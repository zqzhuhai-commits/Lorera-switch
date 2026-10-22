# 守护劳拉（Lorera）Switch 移植 — Release v1.0.3

## 本版变化

1. **游戏显示名改为「守护劳拉」**：NACP 标题已更新（原生 NSP 与 Forwarder 均生效），Switch 桌面显示「守护劳拉」。Title ID 不变（`0100F53A4C4F5245`），已装 v1.0.2 的可直接覆盖安装。
2. **图标更换为用户指定的「守护劳拉」艺术图**：金色立体艺术字 + 劳拉形象（深色束发、背箭囊、绿色吊坠）+ 遗迹烛火背景，已按 256×256 规格嵌入 NRO/NACP/Control RomFS，桌面与启动画面同步显示新图标。
3. 依旧为**单文件完整版 NSP**：全部游戏数据（引擎库 + game.apk + assets/{game.droid, audiogroup1.dat, options.ini}）内置于 NSP RomFS，**装完即玩**，不需要 SD 数据目录；存档写 `sdmc:/switch/Lorera/`。

## 数据校验

| 文件 | 大小 | SHA256 |
|---|---|---|
| Lorera.nsp | 306,814,168 B | `205ec9b72abe8b0b3cc9bb19bb52d9da2e3d326d89c0fc3e842805a8ddba3492` |

独立复核：3 个 NCA 全部可解（Program/Control/CNMT）、无 rightsId（免票根）、NACP 标题「守护劳拉」、内嵌图标与仓库 icon.jpg 逐字节一致。

## 安装（大气层 / Atmosphère + DBI）

1. `Lorera.nsp`（306 MB）放入 SD 卡；
2. DBI 安装（约几分钟）；
3. 桌面「守护劳拉」直接启动。

> `Lorera-Forwarder.nsp` 为 SD 数据模式转发器（普通用户不需要）；`lorera_nx.nro` 供 hbmenu / SD 目录模式。

## 已知限制

- 首次启动若闪退：`sdmc:/switch/Lorera/debug.log` 与 `crash.log` 会记录原因，发我即可继续修。
