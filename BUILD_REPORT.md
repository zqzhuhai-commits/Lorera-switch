# BUILD_REPORT — Lorera Switch

> 状态随 CI 构建更新。以下为本报告发布时的构建与验证事实。

## 构建环境

- GitHub Actions `ubuntu-latest` + `devkitpro/devkita64`（devkitA64 / libnx / switch-tools）
- 构建命令见 `.github/workflows/build.yml` 与 `runtime/tools/docker_build.sh`
- 依赖包：switch-sdl2、switch-mesa、switch-libdrm_nouveau、switch-freetype、switch-libpng、switch-ffmpeg、switch-harfbuzz、switch-bzip2

## 构建产物

| 产物 | 说明 |
|---|---|
| `lorera_nx.nro` | 加载器 NRO（hbmenu / forwarder 使用） |
| `dist/native/{main,main.npdm,control.nacp}` | 原生 NSP 组件（打包用） |
| `dist/forwarder/{main,main.npdm,control.nacp}` | forwarder NSP 组件（打包用） |
| `Lorera.nsp` | 原生应用 NSP（Title ID `0100F53A4C4F5245`） |
| `Lorera-Forwarder.nsp` | NRO 转发 NSP（Title ID `010000ABCD001000`） |

NSP 由 `tools/packaging/build_nsp.mjs` 使用私有 prod.keys 在本地打包并逐项校验（NCA 哈希、Title ID、NSO、NPDM、NACP、图标、RomFS、CNMT）。

## 已验证

- 原库 `libyoyo.so` / `libc++_shared.so` SHA256 与审计 JSON 一致
- 入口符号 `RunnerJNILib_Startup/Process/TouchEvent` 存在（nm -D）
- NSP 容器结构与各 NCA 加密类型、内容哈希（打包脚本断言通过）
- 资源哈希：`data.win` / `audiogroup1.dat` / `options.ini`（见 `docs/ORIGINAL_LIBRARY_AUDIT.json`）

## 未验证

- Switch 实机安装、画面/音频/输入/存档/休眠
- 游戏全流程通关

## 复现

```sh
bash build.sh                      # docker 内构建 NRO + NSP 组件
NSP_KEYS="$(cat /path/prod.keys)" node tools/packaging/build_nsp.mjs   # 打包 NSP
```
