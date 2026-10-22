# 安装与实机测试 — Lorera Switch

## 环境要求

- Atmosphère CFW（建议最新版）+ sigpatches
- 安装工具：Tinfoil 或 DBI
- 原版 Lorera 安卓游戏文件（仓库不提供）

## 安装

### 方式一：原生 NSP（推荐）

1. 解压发布包，把 `switch/Lorera/` 整个目录放到 SD 卡根目录（与 `switch` 合并）：

```
sdmc:/switch/Lorera/
├── lorera_nx.nro        # 加载器
├── libyoyo.so           # 原版 APK: lib/arm64-v8a/libyoyo.so
├── libc++_shared.so     # 原版 APK: lib/arm64-v8a/libc++_shared.so
├── game.apk             # 原版 APK 重命名
└── assets/
    ├── game.droid       # data.win 重命名
    ├── audiogroup1.dat
    └── options.ini
```

2. 安装 `Lorera.nsp`（Title ID `0100F53A4C4F0000`）。
3. 主界面出现 "Lorera" 图标，直接启动。

### 方式二：forwarder NSP

1. 同上放置 `switch/Lorera/` 目录。
2. 安装 `Lorera-Forwarder.nsp`（Title ID `010000ABCD001000`）。
3. 主界面启动图标（转发加载 SD 上的 NRO，启动日志 `switch/Lorera/forwarder-v1.0.0.log`）。

### 方式三：NRO（调试）

1. 同上放置 `switch/Lorera/` 目录。
2. 从 Homebrew Menu 以应用模式启动 `lorera_nx.nro`（按住 R 启动任意游戏进入 title override，或使用支持应用模式的 hbmenu 入口）。
3. 不支持 Album 应用模式（内存不足）。

## 配置

首次运行生成 `switch/Lorera/config.txt`：

- `screen_width` / `screen_height`：渲染分辨率，非法值自动 1280×720（手持）/ 1920×1080（底座）
- `language`：默认 `en`

## 测试要点

按以下顺序回报结果（附 `switch/Lorera/debug.log`、`crash.log` 如存在）：

1. 启动：是否进入游戏、能否看到标题/菜单
2. 画面：渲染是否正确、有无花屏/错位（关注 ATC/纹理格式）
3. 音频：BGM 与音效
4. 输入：方向键/摇杆/ABXY/+−/L/R/ZL/ZR、触摸（如游戏需要）
5. 存档：退出重进后进度是否保留
6. 休眠恢复：长时间挂起后是否正常

## 已知问题

- 实机尚未验证；任何启动失败请提供 `debug.log` 全文。
