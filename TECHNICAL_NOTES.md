# TECHNICAL NOTES — Lorera Switch

## 加载器架构

复用 stt16bit_nx（派生自 fgsfdsfgs/max_nx 与 NaGaa95/ct_nx）的「原生 .so 加载」方案：

1. `__libnx_initheap` 预留 `SO_HEAP_RESERVE_MB`（96MB）给两个 .so 的加载映像；其余堆供引擎 malloc 与 Mesa 纹理。
2. `so_load` 把 `libc++_shared.so`、`libyoyo.so` 按 ELF 段映射到保留堆，完成重定位与符号解析（std/__cxa 等 C++ 符号解析进 libc++_shared）。
3. `so_finalize` 锁定代码段、flush cache；执行两个模块的静态构造函数。
4. JNI 兼容层（fake JNIEnv/JavaVM）驱动 GameMaker 入口：`Startup` 传入 apk 路径/存档路径 → `Process` 每帧渲染循环 → `TouchEvent` 输入。
5. 图形走 EGL/GLES2（Mesa）；音频走 OpenSL ES shim → SDL2 混音；资源走 AAssetManager 兼容层读取 `assets/`；FMV 走 ffmpeg（GMS2 startVideo）。

## 本移植改动（相对 stt16bit_nx）

- 包名/版本中性化：`getPackageName`/`GetAppID` → `com.lorera.game`，`getVersion` → `1.0.0`
- 默认语言 `en`
- 固定运行目录：`main()` 无条件 `chdir("sdmc:/switch/Lorera")`（创建目录），使 hbmenu NRO / forwarder NSP / 原生 NSP 三种启动方式行为一致
- 原生 NSP 支持：`tools/config.npdm.json`（应用 NPDM，Title ID `0100F53A4C4F0000`），`make -f Game.mk nsp-components` 产出 NSO/NPDM/NACP
- 图标：Steam 官方宣传图裁切 256×256 JPEG

## 存档与配置

- 存档目录 = 运行目录 = `sdmc:/switch/Lorera/`
- 存档每 ~300 帧（约 5s）与退到后台时刷盘
- `config.txt` 首启生成，支持分辨率与语言

## 依赖的系统调用

`svcMapProcessCodeMemory`(0x77)、`svcUnmapProcessCodeMemory`(0x78)、`svcSetProcessMemoryPermission`(0x73)；加载器启动时 `envIsSyscallHinted` 自检，缺失即报错。Atmosphère 应用模式下可用。

## 资源规模

- `data.win` 81 MB、`audiogroup1.dat` 196 MB —— SD 卡须为 FAT32/exFAT，文件系统兼容。
