# BUILD_REPORT — Lorera Switch

> 最新构建：2026-10-21，GitHub Actions run #5（commit `a03ad87`），结果 **success**。Release `v1.0.0` 已发布。

## 构建环境

- GitHub Actions `ubuntu-latest` + `devkitpro/devkita64`（devkitA64 / libnx / switch-tools）
- 构建命令见 `.github/workflows/build.yml` 与 `runtime/tools/docker_build.sh`
- 依赖包：switch-sdl2、switch-mesa、switch-libdrm_nouveau、switch-freetype、switch-libpng、switch-ffmpeg、switch-harfbuzz、switch-bzip2

## 构建产物（实际构建值）

| 产物 | 大小 | SHA256 | 说明 |
|---|---|---|---|
| `lorera_nx.nro` | 21,666,902 B | `17ac45c2…af3a8` | 加载器 NRO（NRO0 魔数已确认） |
| `dist/native/main` | 14,218,788 B | `37ac27dd…9f3bb0` | 原生 NSO（elf2nso） |
| `dist/native/main.npdm` | 996 B | `6f108cf4…0449585` | 原生应用 NPDM（`0100F53A4C4F0000`） |
| `dist/native/control.nacp` | 16,384 B | `2d948750…cb0f6da` | 原生 NACP（显示版本 1.0.0） |
| `dist/forwarder/main` | 97,953 B | `3fc4a519…2e557d5f` | forwarder NSO |
| `dist/forwarder/main.npdm` | 1,012 B | `660e5af1…2b88639` | forwarder NPDM（`010000ABCD001000`） |
| `dist/forwarder/control.nacp` | 16,384 B | `64f50777…62967f56a` | forwarder NACP |
| `Lorera.nsp` | 14,467,288 B | `c4275abd…eabac14` | 原生应用 NSP |
| `Lorera-Forwarder.nsp` | 339,672 B | `2fef2b64…86e4119` | forwarder NSP |

NSP 由 `tools/packaging/build_nsp.mjs` 使用私有 prod.keys 在本地打包并逐项校验通过（NCA 内容哈希、Title ID、NSO 与本机构建一致、NPDM ACID、NACP 图标与版本、RomFS、CNMT）。

## 已验证（静态/构建期）

- 原库 `libyoyo.so` / `libc++_shared.so` SHA256 与 `docs/ORIGINAL_LIBRARY_AUDIT.json` 一致
- 入口符号 `RunnerJNILib_Startup/Process/TouchEvent` 存在（nm -D）
- 资源哈希：`data.win` / `audiogroup1.dat` / `options.ini`
- CI 5 次运行全部成功；NRO/NSP 结构校验通过
- SD 数据包 5 个文件 SHA256 与审计一致

## 未验证（需实机）

- Switch 实机安装、画面/音频/输入/存档/休眠
- 游戏全流程通关

## 复现

```sh
bash build.sh                      # docker 内构建 NRO + NSP 组件
NSP_KEYS="$(cat /path/prod.keys)" node tools/packaging/build_nsp.mjs   # 打包 NSP
```

构建产物可从 GitHub Actions Artifact（`lorera-switch-build`）或 Release `v1.0.0` 获取（NSP/NRO）。
