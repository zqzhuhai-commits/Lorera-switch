# Lorera（拯救劳拉）Switch 移植 — Release v1.0.2（单文件完整版）

## 本版变化

1. **完整版单文件 NSP**（用户明确要求）：`Lorera.nsp`（306 MB）把全部游戏数据内置进 NSP 自己的 RomFS——
   - `libyoyo.so`（游戏引擎）
   - `libc++_shared.so`
   - `game.apk`（PortMaster 原版 libs-only 形态）
   - `assets/game.droid`（data.win）
   - `assets/audiogroup1.dat`（音频包）
   - `assets/options.ini`

   **装完即玩，不再依赖 SD 卡目录**。存档与设置仍写到 `sdmc:/switch/Lorera/`（Switch 的 NSP 安装机制要求可写数据放 SD）。

2. **装机失败根因已修复**：v1.0.0/v1.0.1 的 NSP 用本地不完整的 keys 打包（缺 `header_key`），真机 DBI 报 `Invalid NCA magic`。本版改用**完整 keyset**（含 `header_key` + `key_area_key_application_00`，与用户机器上可正常安装的 Modern Combat 3 NSP 同一套），打包方式对齐 MC3（hacbrewpack 管线 + RomFS 内嵌数据）。独立解析复核：3 个 NCA 全部可解、无 rightsId（免票根）、titleId 正确。

3. **加载器新增 RomFS 模式**（SD 模式完全保留）：
   - 原生 NSP 启动时自动挂载自身 RomFS（`romfsMountSelf`，libnx 对 NSO 走 `romfsMountFromCurrentProcess`）；
   - 检测到内嵌数据 → 从 `romfs:/` 读引擎库/资源，SD 卡只写存档；
   - NRO / Forwarder 走 SD 目录模式，行为与 v1.0.1 一致。

## 安装（大气层 / Atmosphère + DBI）

1. 把 `Lorera.nsp`（306 MB）放到 SD 卡任意目录；
2. DBI → 浏览到该文件 → Install；等进度走完（约几分钟）；
3. 桌面出现「Lorera」图标，直接启动，**无需任何 SD 数据文件**。

> 可选：`Lorera-Forwarder.nsp` 是转发器形态（SD 数据模式），普通用户不需要；`lorera_nx.nro` 供 hbmenu / SD 目录模式使用。

## 数据校验

| 文件 | 大小 | SHA256 |
|---|---|---|
| Lorera.nsp | 306,814,168 B | `d585cb3912157bfefb467366d13a0cfb10b3fbf388c127d080fa297c7585df77` |

## 已知限制

- 首次启动若闪退：`sdmc:/switch/Lorera/debug.log` 与 `crash.log` 会记录原因，反馈给我即可继续修；
- 存档目录：`sdmc:/switch/Lorera/`（YoYoPrefsFile.txt 等）。
