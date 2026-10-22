# v1.0.6 — Title ID 改为标准游戏 ID，消除 DBI「游戏使用DLC的titleId」提示

## 修复内容

- **Title ID 从 `0100F53A4C4F5245` 改为 `0100F53A4C4F0000`**：
  - 原因：DBI 依据 `titleId & 0xFFF` 判定标题类型——`0x000` = 基础游戏、`0x800` = 更新、`0x001–0x7FF` = DLC。旧 ID 低 12 位为 `0x245`（在 DLC 段内），导致 DBI 弹出「游戏使用DLC的titleId」提示。
  - 新 ID 低 12 位为 `0x000`，为标准基础游戏 ID，DBI 不再提示。
- NACP `AddOnContentBaseId` 保持为 0（v1.0.4 起已清零），CNMT 类型为 Application（0x80）。
- 其余（单文件完整版、RomFS 内嵌全部游戏数据、NSO 进程句柄修复、守护劳拉图标/标题）与 v1.0.5 一致。

## 变更文件

- `Game.mk` / `tools/config.npdm.json`（NPDM Title ID 及 Program ID 范围）
- `tools/packaging/build_nsp.mjs`（打包目标 Title ID）
- README / BUILD_REPORT / TECHNICAL_NOTES / TESTING 文档

## 安装说明

1. 卸载/删除旧版（`0100F53A4C4F5245`，如已安装，桌面图标可直接替换，属全新 ID 无冲突）。
2. 用 DBI / Tinfoil 直接安装 `Lorera.nsp`（单文件完整版，Title ID `0100F53A4C4F0000`）。
3. 安装后桌面显示「守护劳拉」，直接运行即可，无需 SD 卡目录。

## 文件校验

| 文件 | 大小 | SHA-256 |
|---|---|---|
| Lorera.nsp | 306,830,040 B | `2eaf16a11f5a1522525d729cc7a82cf00d0d77bca8358dbef615da5a133293c8` |
| Lorera-Forwarder.nsp | 356,056 B | `cae065827981c19c8aeebd60a219ce1901555deba14a1c0d5211d8230b04d28a` |
| lorera_nx.nro | 21,687,194 B | `0c271438ba8e8630a95adf40e477d95a9880d38d7211fab915eaeabb3b249b96` |
