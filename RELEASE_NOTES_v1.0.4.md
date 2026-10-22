# 守护劳拉（Lorera）Switch 移植 — Release v1.0.4

## 本版变化

**消除 DBI 安装时的「使用了 DLC 的 title」提示**：
- 根因：devkitPro nacptool 会自动把 NACP 的 `AddOnContentBaseId` 设为 `titleId + 0x1000`，等于声明「该应用支持 DLC」，安装器因此弹出提示。
- 修复：打包时将该字段清零（游戏无任何 DLC），两个 NSP（原生 + Forwarder）均已处理并断言验证 `AddOnContentBaseId = 0x0`。
- 其余不变：游戏名「守护劳拉」、新图标、单文件完整版（数据全部内置、装完即玩）。

## 数据校验

| 文件 | 大小 | SHA256 |
|---|---|---|
| Lorera.nsp | 306,830,552 B | `9bbe13105d765cdcaff0c7396f3ee4b12017882e951c3570766dd2ebd8563212` |
| Lorera-Forwarder.nsp | 356,056 B | `d369836d7f99311912cc22030d2f6757f39a2f912de6aef6cb4858780fc3c59d` |

独立复核：3 NCA 可解、无 rightsId、标题「守护劳拉」、AddOnContentBaseId=0。

## 安装

`Lorera.nsp` → SD 卡 → DBI 安装（不再有 DLC 提示）→ 桌面「守护劳拉」直接启动。存档 `sdmc:/switch/Lorera/`。
