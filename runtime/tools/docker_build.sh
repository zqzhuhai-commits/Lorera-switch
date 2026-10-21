#!/bin/sh
# Build the loader NRO and all NSP packaging components inside the
# devkitpro/devkita64 docker image. Requires Docker on the host.
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
PROJECT="$(cd "$HERE/../.." && pwd)"
cd "$PROJECT"
exec docker run --rm -v "$PROJECT:/project" -w /project devkitpro/devkita64 bash -lc '
  export DEVKITPRO=/opt/devkitpro DEVKITA64=/opt/devkitpro/devkitA64
  export PATH=/opt/devkitpro/portlibs/switch/bin:/opt/devkitpro/tools/bin:/opt/devkitpro/devkitA64/bin:$PATH
  dkp-pacman -Sy --noconfirm --needed \
    switch-sdl2 switch-mesa switch-libdrm_nouveau switch-freetype \
    switch-libpng switch-ffmpeg switch-harfbuzz switch-bzip2 || exit 1
  make -f Game.mk -j2 || exit 1
  make -f Game.mk nsp-components || exit 1
  make -C forwarder -j2 || exit 1
  mkdir -p dist/forwarder
  elf2nso forwarder/hbl.elf dist/forwarder/main
  npdmtool forwarder/hbl.json dist/forwarder/main.npdm
  nacptool --create "Lorera" "Independent Homebrew" "1.0.0" dist/forwarder/control.nacp --titleid=010000abcd001000
  echo "=== build complete ==="
  ls -la dist dist/native dist/forwarder
'
