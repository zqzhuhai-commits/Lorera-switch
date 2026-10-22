#!/usr/bin/env python3
"""Stage the Lorera game data into dist/romfs-data/ for the single-file NSP.

Usage:
  python3 tools/packaging/prepare_romfs.py --src <Lorera game dir> [--out dist/romfs-data]

The game dir is the extracted PortMaster package (Lorera.port + assets/).
Reconstructs a structurally faithful game.apk (manifest + assets + arm64 libs),
mirrors the assets/ folder and copies the arm64 engine libs.
"""
import argparse, os, shutil, sys, time, zipfile

def build_apk(port, out_apk, assets_dir, libyoyo, libcpp):
    manifest = (b'<?xml version="1.0" encoding="utf-8"?>\n'
                b'<manifest xmlns:android="http://schemas.android.com/apk/res/android" '
                b'package="com.lorera.game" android:versionCode="10" '
                b'android:versionName="1.0.0"><application android:label="Lorera" '
                b'android:hasCode="true"/></manifest>\n')
    with zipfile.ZipFile(port) as z:
        open('/tmp/libyoyo.so', 'wb').write(z.read('lib/arm64-v8a/libyoyo.so'))
        open('/tmp/libcpp.so', 'wb').write(z.read('lib/arm64-v8a/libc++_shared.so'))
    with zipfile.ZipFile(out_apk, 'w', zipfile.ZIP_STORED, allowZip64=True) as z:
        zi = zipfile.ZipInfo('AndroidManifest.xml', (2020, 1, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_STORED
        z.writestr(zi, manifest)
        # The PortMaster original ships a libs-only APK: assets are served by
        # the fake AAssetManager from the sibling assets/ folder, never read
        # from the APK zip itself. Keep the same shape (keeps the NSP small).
        for arc, src in [
            ('lib/arm64-v8a/libyoyo.so', '/tmp/libyoyo.so'),
            ('lib/arm64-v8a/libc++_shared.so', '/tmp/libcpp.so'),
        ]:
            zi = zipfile.ZipInfo(arc, (2020, 1, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_STORED
            with open(src, 'rb') as f:
                z.writestr(zi, f.read())

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', required=True, help='extracted PortMaster game dir (Lorera.port + assets/)')
    p.add_argument('--out', default='dist/romfs-data', help='staging dir')
    a = p.parse_args()
    port = os.path.join(a.src, 'Lorera.port')
    assets_dir = os.path.join(a.src, 'assets')
    for need in (port, assets_dir):
        if not os.path.isdir(assets_dir) and not os.path.isfile(port):
            sys.exit(f'missing game file: {need}')
    out = a.out
    assets_out = os.path.join(out, 'assets')
    os.makedirs(assets_out, exist_ok=True)
    build_apk(port, os.path.join(out, 'game.apk'), assets_dir, None, None)
    for src, dst in [
        ('/tmp/libyoyo.so', os.path.join(out, 'libyoyo.so')),
        ('/tmp/libcpp.so', os.path.join(out, 'libc++_shared.so')),
        (os.path.join(assets_dir, 'data.win'), os.path.join(assets_out, 'game.droid')),
        (os.path.join(assets_dir, 'audiogroup1.dat'), os.path.join(assets_out, 'audiogroup1.dat')),
        (os.path.join(assets_dir, 'options.ini'), os.path.join(assets_out, 'options.ini')),
    ]:
        if os.path.abspath(src) != os.path.abspath(dst):
            shutil.copyfile(src, dst)
    print('staged romfs-data at', out)
    for root, _, files in os.walk(out):
        for f in files:
            full = os.path.join(root, f)
            print(f'{os.path.relpath(full, out)}  {os.path.getsize(full)}')

if __name__ == '__main__':
    main()
