# Lorera NRO 转发启动器

基于 R-YaTian/nro-forwarder 提交 b130f4200411b2d516e36298fb0acea40f0d9aca，原始 ISC 许可见 LICENSE.md。

此 NSP 不包含游戏。固定读取 `sdmc:/switch/Lorera/lorera_nx.nro`，标题 ID 为 `010000ABCD001000`。先将本版 NRO 及游戏文件拷到该位置，再安装并启动桌面图标。

本项目修改：默认目标路径、路径读取长度校验、SD 启动日志及应用 NPDM 配置。保留原始 NRO 加载器、堆覆盖与 ConfigEntry ABI，不使用在普通应用中无效的 envSetNextLoad 假转发。

启动日志：`switch/Lorera/forwarder-v1.0.0.log`。缺少目标 NRO 会记录 present=0 并返回加载错误。
