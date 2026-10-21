# 第三方组件与许可

本仓库包含/衍生以下开源组件：

| 组件 | 来源 | 许可 |
|---|---|---|
| 加载器（loader） | boraeskicioglu/stt16bit_nx，派生自 fgsfdsfgs/max_nx 与 NaGaa95/ct_nx | MIT（见 LICENSE） |
| NSP 转发启动器 | R-YaTian/nro-forwarder（zqzhuhai-commits/guandan-switch 修改版） | ISC（见 forwarder/LICENSE.md） |
| NSP 打包工具 | zqzhuhai-commits/guandan-switch（@tootallnate/hacbrewpack / nca / romfs） | MIT（npm 包自带） |

运行期链接的 devkitPro 组件（由构建环境提供，不随仓库分发）：

- devkitA64 / libnx（zlib）
- SDL2（zlib）
- Mesa / libdrm-nouveau（MIT）
- FreeType（FTL / GPLv2）
- HarfBuzz（MIT）
- libpng（libpng 许可）
- FFmpeg（LGPL/GPL，含 dav1d、opus、tremor、webp、ogg 等编解码依赖）

图标取自 Steam 商店页官方宣传图（Lorera © 96Brothers），仅用于本地启动图标。
