# Lorera（拯救劳拉）— Nintendo Switch 移植

基于 [stt16bit_nx](https://github.com/boraeskicioglu/stt16bit_nx)（MIT）体系的 GameMaker Studio 2 Switch 加载器改造（参考工程路线：[shadowguardian-switch](https://github.com/zqzhuhai-commits/shadowguardian-switch)）。加载原版安卓 ARM64 引擎库 `libyoyo.so`，在 Switch 上原生运行，无模拟层。

当前版本：**v1.0.0**。构建与验证状态见 [BUILD_REPORT.md](BUILD_REPORT.md) 与 [VALIDATION.md](VALIDATION.md)。

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

### 方式一：原生 NSP（推荐）

1. 将 `switch/Lorera/` 整个目录复制到 SD 卡根目录。
2. 用 Tinfoil / DBI 安装 `Lorera.nsp`（Title ID `0100F53A4C4F5245`）。
3. 主界面启动 "Lorera" 图标，直接运行。

### 方式二：forwarder NSP

1. 同上放置 `switch/Lorera/` 目录。
2. 安装 `Lorera-Forwarder.nsp`（Title ID `010000ABCD001000`），主界面图标转发加载 SD 上的 NRO。

### 方式三：NRO（调试）

Homebrew Menu 以应用模式（title override）运行 `lorera_nx.nro`。Album 应用模式不可用。

三种方式共用同一份 `switch/Lorera/` 游戏文件。

## 游戏文件来源

从原版安卓版 Lorera 的 APK 提取（本仓库不含任何游戏资源）：

- `lib/arm64-v8a/libyoyo.so`、`lib/arm64-v8a/libc++_shared.so`
- `assets/` 整个目录（游戏数据 `data.win` 重命名为 `game.droid`）
- APK 本体重命名为 `game.apk`

原始库与资源哈希见 [docs/ORIGINAL_LIBRARY_AUDIT.json](docs/ORIGINAL_LIBRARY_AUDIT.json)。

## 配置

首次运行生成 `switch/Lorera/config.txt`：

- `screen_width` / `screen_height`：渲染分辨率；非法值自动选择手持 1280×720 / 底座 1920×1080
- `language`：默认 `en`

存档写入 `switch/Lorera/` 目录。

## 构建

CI（GitHub Actions）或本地 Docker 自动构建：

```sh
bash build.sh                        # docker 内构建 NRO + NSP 组件
NSP_KEYS="$(cat /path/prod.keys)" node tools/packaging/build_nsp.mjs   # 打包 NSP
```

本地 devkitA64 构建：`make -f Game.mk`（NRO）与 `make -f Game.mk nsp-components`（原生 NSP 组件）。

## 文档

- [移植审计](docs/PORT_AUDIT.zh-CN.md) · [原始库审计 JSON](docs/ORIGINAL_LIBRARY_AUDIT.json)
- [构建报告](BUILD_REPORT.md) · [验证清单](VALIDATION.md) · [技术说明](TECHNICAL_NOTES.md)
- [安装与实机测试](docs/TESTING.zh-CN.md) · [发行说明](RELEASE_NOTES_v1.0.0.md)

## 致谢与许可

- [stt16bit_nx](https://github.com/boraeskicioglu/stt16bit_nx) — 本加载器基础（MIT）
- [max_nx](https://github.com/fgsfdsfgs/max_nx)（fgsfdsfgs）与 [ct_nx](https://github.com/NaGaa95/ct_nx)（NaGaa95）— 加载器架构
- [nro-forwarder](https://github.com/R-YaTian/nro-forwarder)（R-YaTian）— NSP 转发启动器（ISC）
- devkitPro / libnx / SDL2 / Mesa / ffmpeg / FreeType 等开源组件（见 [THIRD_PARTY.md](THIRD_PARTY.md)）

## 法律声明

本项目与 SEGA、YoYo Games 无任何关联。"GameMaker Studio" 是 YoYo Games Ltd 的商标。本仓库不包含原版游戏资源与私有密钥，请从合法渠道获取原版游戏。加载器源码基于 MIT 许可证，详见 [LICENSE](LICENSE)。
