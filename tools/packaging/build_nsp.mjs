// Lorera homebrew NSP packaging (native game + forwarder), based on the
// GuandanSwitch / Modern-Combat-3-switch packaging pipelines.
// Caller-provided keys stay in memory and are never bundled.
// The native NSP embeds ALL game data (libs, reconstructed APK, assets) in its
// RomFS, so it is a complete single-file install.
// Usage: NSP_KEYS="$(cat /path/prod.keys)" node tools/packaging/build_nsp.mjs
// Requires: dist/native/* (CI), dist/forwarder/* (CI) and dist/romfs-data/ (staged
// game data: libyoyo.so, libc++_shared.so, game.apk, assets/*).
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { buildNsp } from './versioned-builder.mjs';
import { initializeKeySet, parseNca } from '@tootallnate/nca';
import { decode } from '@tootallnate/romfs';

const root = resolve(import.meta.dirname, '../..');
const input = process.env.NSP_KEYS;
if (!input) throw new Error('NSP_KEYS must contain the caller-provided build keys');
const bin = async p => new Uint8Array(await readFile(resolve(root, p)));
const digest = b => createHash('sha256').update(b).digest('hex');
const blobDigest = async b => digest(Buffer.from(await b.arrayBuffer()));

// Build a nested {dir: {file: Blob}} tree for the RomFS encoder.
async function buildRomfsTree(dir) {
  const out = {};
  for (const f of await readdir(resolve(root, dir))) {
    const full = resolve(root, dir, f);
    const st = await stat(full);
    if (st.isDirectory()) out[f] = await buildRomfsTree(dir + '/' + f);
    else out[f] = new Blob([await readFile(full)]);
  }
  return out;
}

// Flatten a nested RomFS map into [path, Blob] pairs for verification.
async function collectBlobs(obj, prefix, out) {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v instanceof Blob) out.push([prefix + k, v]);
    else await collectBlobs(v, prefix + k + '/', out);
  }
  return out;
}

const targets = [
  {
    name: 'Lorera.nsp',
    folder: 'dist/native/',
    titleId: '0100f53a4c4f5245',
    version: 0x00010000,
    romfs: await buildRomfsTree('dist/romfs-data'),
  },
  {
    name: 'Lorera-Forwarder.nsp',
    folder: 'dist/forwarder/',
    titleId: '010000abcd001000',
    version: 0x00010000,
    romfs: null,
  },
];

const keys = await initializeKeySet(input, globalThis.crypto, 1);

function pfsFiles(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'PFS0');
  const count = bytes.readUInt32LE(4), strings = bytes.readUInt32LE(8);
  const table = 16 + 24 * count, dataStart = table + strings;
  assert.ok(dataStart <= bytes.length);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    const pos = 16 + 24 * i;
    const off = Number(bytes.readBigUInt64LE(pos)), len = Number(bytes.readBigUInt64LE(pos + 8));
    const nameStart = table + bytes.readUInt32LE(pos + 16);
    const nameEnd = bytes.indexOf(0, nameStart);
    assert.ok(nameStart >= table && nameEnd < dataStart && nameEnd >= nameStart);
    assert.ok(dataStart + off + len <= bytes.length);
    const name = bytes.toString('ascii', nameStart, nameEnd);
    assert.ok(!files.has(name));
    files.set(name, bytes.subarray(dataStart + off, dataStart + off + len));
  }
  return files;
}

for (const t of targets) {
  const main = await bin(t.folder + 'main');
  assert.equal(Buffer.from(main.subarray(0, 4)).toString(), 'NSO0');
  const romfs = t.romfs ?? {};
  if (t.romfs === null) {
    const path = 'sdmc:/switch/Lorera/lorera_nx.nro';
    romfs.nextNroPath = new Blob([path]); romfs.nextArgv = new Blob([path]);
    romfs['target-version.txt'] = new Blob(['Lorera v1.0.0 external NRO\n']);
    romfs['LICENSE-forwarder.txt'] = new Blob([await bin('forwarder/LICENSE.md')]);
  }
  const nacp = await bin(t.folder + 'control.nacp');
  const result = await buildNsp({
    keys, plaintext: false, noLogo: true, noPatchNacpLogo: true,
    titleId: t.titleId, titleVersion: t.version,
    exefs: new Map([['main', main], ['main.npdm', await bin(t.folder + 'main.npdm')]]),
    control: new Map([['control.nacp', nacp], ['icon_AmericanEnglish.dat', await bin('icon.jpg')]]),
    romfs,
  });
  const bytes = Buffer.from(await result.nsp.arrayBuffer());
  const files = pfsFiles(bytes);
  assert.equal(files.size, 3, 'Expected Program, Control and Meta NCAs');
  const records = new Map();
  let cnmt;
  for (const [name, nca] of files) {
    const hash = digest(nca);
    assert.ok(name.startsWith(hash.slice(0, 32)), 'NCA content hash mismatch');
    const parsed = await parseNca(new Blob([nca]), { keys });
    assert.equal(parsed.titleId, BigInt('0x' + t.titleId));
    assert.equal(parsed.ncaSize, BigInt(nca.length));
    assert.ok(parsed.sections.every(s => s.cryptType === 3), 'NCA bodies must use standard AES-CTR encryption');
    assert.equal(parsed.hasRightsId, false, 'Homebrew must not require title keys/tickets');
    records.set(hash.slice(0, 32), { hash, size: nca.length, type: parsed.contentType });
    if (parsed.contentType === 0) {
      const exe = pfsFiles(Buffer.from(await parsed.sections.find(s => s.pfs0Data).pfs0Data.arrayBuffer()));
      assert.equal(digest(exe.get('main')), digest(main), 'NSO must match this native build');
      const npdm = exe.get('main.npdm');
      assert.equal(npdm.toString('ascii', 0, 4), 'META');
      assert.equal(npdm.readBigUInt64LE(npdm.readUInt32LE(0x70) + 0x10), BigInt('0x' + t.titleId));
      assert.equal(npdm[0x0e], 44, 'Application thread priority');
      assert.equal(npdm[0x0f], 0, 'Application default CPU');
      const acidFlags = npdm.readUInt32LE(npdm.readUInt32LE(0x78) + 0x20c);
      assert.equal(acidFlags & 1, 1, 'Retail application descriptor');
      assert.equal((acidFlags >> 2) & 15, 0, 'Use application memory pool, not system pool');
      const assets = await decode(parsed.sections.find(s => s.romfsData).romfsData);
      const expected = await collectBlobs(romfs, '', []);
      const actual = await collectBlobs(assets, '', []);
      assert.equal(actual.length, expected.length, 'Embedded RomFS file count mismatch');
      for (const [path, blob] of expected) {
        const match = actual.find(([p]) => p === path);
        assert.ok(match, 'Missing embedded ' + path);
        assert.equal(await blobDigest(match[1]), await blobDigest(blob), 'Stale embedded ' + path);
      }
      console.log(t.name, 'RomFS embedded files:', expected.map(([p]) => p).join(', '));
    } else if (parsed.contentType === 2) {
      const control = await decode(parsed.sections.find(s => s.romfsData).romfsData);
      assert.equal(await blobDigest(control['control.nacp']), digest(nacp));
      assert.equal(await blobDigest(control['icon_AmericanEnglish.dat']), digest(await bin('icon.jpg')));
      console.log(t.name, 'Control display version:', Buffer.from(nacp).toString('utf8', 0x3060, 0x3070).replace(/\0.*$/s, ''));
    } else if (parsed.contentType === 1) {
      const meta = pfsFiles(Buffer.from(await parsed.sections.find(s => s.pfs0Data).pfs0Data.arrayBuffer()));
      cnmt = [...meta.values()][0];
    }
  }
  assert.equal(cnmt.readBigUInt64LE(0), BigInt('0x' + t.titleId));
  assert.equal(cnmt.readUInt16LE(0x10), 2);
  assert.equal(cnmt.readUInt32LE(8), t.version, 'Installer metadata must identify this version');
  const start = 0x20 + cnmt.readUInt16LE(0x0e);
  for (let i = 0; i < 2; i++) {
    const pos = start + 0x38 * i;
    const record = records.get(cnmt.subarray(pos + 0x20, pos + 0x30).toString('hex'));
    assert.ok(record, 'CNMT references absent NCA');
    assert.equal(record.hash, cnmt.subarray(pos, pos + 0x20).toString('hex'));
    assert.equal(record.size, cnmt.readUIntLE(pos + 0x30, 6));
    assert.equal(cnmt[pos + 0x36], record.type === 0 ? 1 : 3);
  }
  await writeFile(resolve(root, 'dist/' + t.name), bytes);
  console.log('PASS:', t.name, 'all NCA hashes, title ID, NSO, NPDM, NACP, icon and RomFS verified');
  console.log(t.name, 'SHA256:', digest(bytes));
}
