# dsh-plugin-scratchpad

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that adds a **Scratchpad** entry to the left sidebar and a locally saved notes panel in the main column.

## Features

- Adds one icon to the left sidebar's global panel list (`sidebar.panellist`, id `scratchpad`, order 20), next to the shipped plugin and schedule entries.
- The sidebar owns the button chrome: clicking the icon selects the matching central panel (`main`, key `scratchpad`) through the host's `ctx.layout.selectPanel()`.
- The panel provides a multiline scratchpad with a live character count, a Clear action, and local persistence through the browser's `localStorage`; notes never leave the device.
- UI text is routed through the dsh Client locale service, with English and Chinese dictionaries, so the label and the panel follow the active language.
- Styling uses only dsh theme tokens (`--dsw-alias-*`). No Harness Client package is imported; the client half is plain JavaScript registered through the browser module loader.

## 中文简介

这是一个 DeepSeek Harness（dsh）插件：在左侧栏新增一个「随手便签」图标入口，点击后在中央区域打开一个便签面板。便签内容自动保存在当前浏览器（localStorage），不会上传；界面文字通过 dsh 的语言服务提供中英文。

## Install

This repository is a DSH bundle package: `package.json` declares `dsh.bundle.patch` plus the `dsh.client` web module, and `cordis.patch.yml` inserts the host plugin row.

1. Clone or download this repository into a local directory.
2. In a DSH session, install the bundle by pointing the plugin manager at the absolute directory:

```text
plugin_manager install_bundle  target=<absolute path to this repository>
```

The plugin manager links the package into the active profile, selects the bundle, and applies it. A fresh install activates through HMR; no restart is needed.

3. The Scratchpad icon appears in the left sidebar. Click it to open the notes panel.

To remove it again: `plugin_manager remove_bundle @local/sidebar-scratchpad`.

## Files

| File | Purpose |
|---|---|
| `package.json` | Bundle manifest: `dsh.bundle.patch`, `dsh.client` (web platform), exports, locales, icon |
| `cordis.patch.yml` | Loader patch inserting the host plugin row |
| `index.js` | Host half (`export function apply() {}`; rendering lives in the client half) |
| `client.js` | Client half: sidebar entry + main panel registrations, panel UI, locale dictionaries |
| `locale/en.json`, `locale/zh.json` | Plugin Manager display title and description |
| `icon.svg` | Plugin icon |

## Compatibility

Built and verified against DeepSeek Harness `0.2.1-rc.5` (developer preview). The client slot contracts it targets may change in future releases.

## License

MIT — see [LICENSE](LICENSE).

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
