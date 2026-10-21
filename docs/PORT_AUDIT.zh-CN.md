# Lorera Switch 移植审计（PORT AUDIT）

## 原始游戏

- 名称：**Lorera**（中文译名：拯救劳拉）
- 引擎：GameMaker Studio 2（Android arm64-v8a 导出，`libyoyo.so`）
- 数据：`data.win`（81,117,300 字节）、`audiogroup1.dat`（196,107,112 字节）、`options.ini`
- 原始包形态：PortMaster 安卓移植包（`Lorera.port` = 原版 APK 骨架，含 `lib/arm64-v8a/libyoyo.so` 与 `libc++_shared.so`）

## 移植方式

不模拟、不解包重写：在 Switch 上以 AArch64 原生加载原版安卓引擎库 `libyoyo.so`，由加载器（wrapper）提供最小 Android/JNI 兼容层，直接驱动 GameMaker 运行器的 JNI 入口：

- `Java_com_yoyogames_runner_RunnerJNILib_Startup`
- `Java_com_yoyogames_runner_RunnerJNILib_Process`
- `Java_com_yoyogames_runner_RunnerJNILib_TouchEvent`

上述符号已通过 `nm -D` 在原库中逐一确认存在（54 个 RunnerJNILib 导出）；`JNI_OnLoad` 未单独导出，属 GMS2 内联到 Startup 的常见形态，加载器已按可选处理。

## 兼容层覆盖

| 子系统 | 实现 | 说明 |
|---|---|---|
| 图形 | EGL/GLES2（Mesa/nouveau） | 默认 1280×720 手持 / 1920×1080 底座，可配置 |
| 音频 | OpenSL ES → SDL2 软件混音 | 音效与 BGM |
| 输入 | Joy-Con 全按键 + 触摸 | GMS2 Hat 事件、摇杆死区与启动居中 |
| 资源 | AAssetManager 兼容层 | 读取 `assets/` 松散文件（`game.droid`、`audiogroup*.dat`） |
| 存档 | CWD 写入 | `sdmc:/switch/Lorera/`，300 帧周期刷盘 |
| 视频 | ffmpeg 解码 FMV | 走 GMS2 startVideo 路径，无 FMV 时不受影响 |
| 语言 | JNI getCurrentLanguage | 默认 `en`（config.txt 可改） |

## 与参考移植的差异

基于 stt16bit_nx（MIT）适配：包名/版本改为 Lorera 中性值、默认运行目录固定为 `sdmc:/switch/Lorera`（兼容 hbmenu / forwarder NSP / 原生 NSP 三种启动方式）、图标与文档替换。未改动加载器架构。

## 审计结论

- 原库真实、入口齐备，移植路线可行。
- 尚未经 Switch 实机运行验证；`VALIDATION.md` 记录验证状态。
