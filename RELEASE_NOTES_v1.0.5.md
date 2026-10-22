# 守护劳拉（Lorera）Switch 移植 — Release v1.0.5

## 本版变化（修复单文件 NSP 启动即报错）

**根因**（从 debug.log 定位：日志停在 `checking syscalls`）：
- 加载器原先用 `envGetOwnProcessHandle()` 取本进程句柄做代码内存映射（`svcMapProcessCodeMemory` 等）。libnx 的这个句柄**只从 NRO 加载器的 homebrew-ABI 上下文提供**；纯 NSP（NXO 形态）没有该上下文 → 返回 `INVALID_HANDLE` → `check_syscalls()` 直接弹出「Own process handle is unavailable.」错误屏退出。
- 这也解释了为什么只有**单文件 NSP**（原生 NXO）会报错，而 SD 卡 NRO / Forwarder（经 hbmenu 以 NRO 运行）不受影响。

**修复**：
- 新增 `so_set_own_process()`：NSO 形态改用内核**当前进程伪句柄 `CUR_PROCESS_HANDLE`（0xFFFF8001）**（内核在需要进程句柄的系统调用中原生接受该伪句柄），NRO 形态仍用加载器句柄；
- `check_syscalls()` 增加逐项日志（后续任何环境问题一眼可见）；
- `fatal_error()` 现在同时把错误写入 `debug.log`（之前只弹屏）。

其余不变：游戏名「守护劳拉」、新图标、单文件完整版（装完即玩）、无 DLC 提示。

## 数据校验

| 文件 | 大小 | SHA256 |
|---|---|---|
| Lorera.nsp | 306,830,552 B | `79edea020d10725d4e7016326fea05738b3fab13b3a461cda7501c0291c67d7b` |
| Lorera-Forwarder.nsp | 356,056 B | `7fe5ca6658c70fb25520d917f4045fa2de29713e8729461064d706f3b97bbef7` |

独立复核：3 NCA 可解、无 rightsId、标题「守护劳拉」、AddOnContentBaseId=0、修复代码已确认进入二进制。

## 安装

`Lorera.nsp` → SD 卡 → DBI 安装（无 DLC 提示）→ 桌面「守护劳拉」直接启动。存档 `sdmc:/switch/Lorera/`。

若仍异常：`sdmc:/switch/Lorera/debug.log` 现在会包含每个初始化步骤与致命错误原文，发我即可。
