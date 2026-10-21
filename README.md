# Lorera（拯救劳拉）— Nintendo Switch 移植

基于 [stt16bit_nx](https://github.com/boraeskicioglu/stt16bit_nx)（MIT）的 GameMaker Studio 2 Switch 加载器改造。加载原版安卓 ARM64 引擎库 `libyoyo.so`，在 Switch 上原生运行，无模拟层。

## 运行方式（大气层 / Atmosphère）

NSP 直接安装 + SD 卡游戏文件：

```
sdmc:/switch/Lorera/
├── lorera_nx.nro        # 本移植的加载器（由 CI 构建）
├── libyoyo.so           # 原版 APK: lib/arm64-v8a/libyoyo.so
├── libc++_shared.so     # 原版 APK: lib/arm64-v8a/libc++_shared.so
├── game.apk             # 原版 APK 本身（重命名为 game.apk）
└── assets/              # 原版 APK 的 assets/ 目录
    ├── game.droid       # data.win（重命名为 game.droid）
    ├── audiogroup1.dat
    └── options.ini
```

步骤：

1. 将 `Lorera-Forwarder.nsp` 用 Tinfoil / DBI 安装。
2. 将 `switch/Lorera/` 整个目录复制到 SD 卡根目录（与 `switch` 文件夹合并）。
3. 回到主界面启动 “Lorera” 图标即可，无需经过 Homebrew Menu。

> 备选：不装 NSP，也可从 Homebrew Menu（按住 R 启动任意游戏进入应用模式）直接运行 `lorera_nx.nro`。应用模式（title override）下内存充足；Album 应用模式不可用。

## 游戏文件来源

从原版安卓版 Lorera 的 APK 提取（本仓库不含任何游戏资源）：

- `lib/arm64-v8a/libyoyo.so`、`lib/arm64-v8a/libc++_shared.so`
- `assets/` 整个目录（游戏数据 `data.win` 重命名为 `game.droid`）
- APK 本体重命名为 `game.apk`

## 配置

首次运行生成 `switch/Lorera/config.txt`：

- `screen_width` / `screen_height`：渲染分辨率；非法值自动选择手持 1280×720 / 底座 1920×1080
- `language`：默认 `en`

存档写入 `switch/Lorera/` 目录。

## 构建

GitHub Actions 自动构建（`devkitpro/devkita64`）：

- 产物：`lorera_nx.nro` + forwarder 的 `main`/`main.npdm`/`control.nacp`（用于本地打包 NSP）

本地构建需要 devkitA64 及 devkitPro 包（switch-sdl2、switch-mesa、switch-libdrm_nouveau、switch-freetype、switch-libpng、switch-ffmpeg、switch-harfbuzz、switch-bzip2）：

```sh
make -j2
```

## 致谢

- [stt16bit_nx](https://github.com/boraeskicioglu/stt16bit_nx) — 本加载器基础（MIT）
- [max_nx](https://github.com/fgsfdsfgs/max_nx)（fgsfdsfgs）与 [ct_nx](https://github.com/NaGaa95/ct_nx)（NaGaa95）— 加载器架构
- [nro-forwarder](https://github.com/R-YaTian/nro-forwarder)（R-YaTian）— NSP 转发启动器（ISC）
- devkitPro / libnx / SDL2 / Mesa / ffmpeg / FreeType 等开源组件

## 法律声明

本项目与 SEGA、YoYo Games 无任何关联。“GameMaker Studio” 是 YoYo Games Ltd 的商标。本仓库不包含原版游戏资源，请从合法渠道获取原版游戏。加载器源码基于 MIT 许可证，详见 LICENSE。
