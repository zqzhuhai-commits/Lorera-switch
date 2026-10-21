# RELEASE NOTES — v1.0.0

Lorera（拯救劳拉）Switch 移植首版。

## 新增

- GameMaker Studio 2 加载器（基于 stt16bit_nx / ct_nx / max_nx，MIT）
- 原生应用 NSP `Lorera.nsp`（Title ID `0100F53A4C4F5245`）：直接安装，读取 `sdmc:/switch/Lorera/`
- NRO 转发 NSP `Lorera-Forwarder.nsp`（Title ID `010000ABCD001000`）：启动 SD 上的 `lorera_nx.nro`
- 固定 SD 目录 `sdmc:/switch/Lorera`，三种启动方式（hbmenu / forwarder / 原生 NSP）共用一份游戏文件
- 全按键 + 触摸输入、SDL2 音频、ffmpeg FMV、可配置分辨率与语言（config.txt）
- 全套工程文档（审计 / 构建报告 / 验证清单 / 测试指南 / 技术说明）

## 安装

1. 将 `switch/Lorera/` 目录复制到 SD 卡（含 `lorera_nx.nro`、`libyoyo.so`、`libc++_shared.so`、`game.apk`、`assets/`）
2. 用 Tinfoil / DBI 安装 `Lorera.nsp`（或 `Lorera-Forwarder.nsp`）
3. 主界面启动 "Lorera"

## 说明

- 仓库与 Release 不包含原版游戏资源与私有密钥
- 实机验证状态见 `VALIDATION.md`；存档与画面问题请附带 `switch/Lorera/debug.log`
