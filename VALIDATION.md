# VALIDATION — Lorera Switch

验证清单按「已通过 / 未验证」逐项记录；任何"全部符合"类结论不超出下表范围。

## 已通过（静态/构建期）

- [x] 原库身份：`libyoyo.so`（6,226,528 B）、`libc++_shared.so`（1,055,016 B）SHA256 与 `docs/ORIGINAL_LIBRARY_AUDIT.json` 一致
- [x] 入口符号：RunnerJNILib_Startup / Process / TouchEvent 导出确认（nm -D）
- [x] 资源：`data.win` 81,117,300 B、`audiogroup1.dat` 196,107,112 B、`options.ini` 43 B，哈希一致
- [x] NRO 结构（NRO0 魔数、图标、NACP）
- [x] NSP 容器：3 个 NCA（Program/Control/Meta）、AES-CTR 加密、无 rights ID（打包脚本断言）
- [x] NPDM/NACP/图标/CNMT 逐项与打包脚本校验
- [x] 加载器目录固定为 `sdmc:/switch/Lorera`（源码审查）

## 未验证（需实机）

- [ ] NSP 安装（Tinfoil/DBI）
- [ ] 桌面图标启动（原生 NSP 与 forwarder NSP）
- [ ] 画面渲染、音频、手柄/触摸输入
- [ ] 存档写入与恢复、休眠/恢复
- [ ] 全流程可玩性、长时间稳定性

## 已知边界

- 需 Atmosphère CFW（依赖 svcMapProcessCodeMemory 等，加载器启动时自检并给出明确错误）
- Album 应用模式（applet）内存不足，需应用模式启动（原生/forwarder NSP 天然满足，NRO 需 title override）
