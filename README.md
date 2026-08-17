# lukeskinplus

Skin switcher + custom wallpaper + adjustable glass transparency and fonts for
DeepSeek Harness — a drop-in replacement for `dsh-skin` that fixes its 2MB
image limit and adds a whole appearance toolbox. It registers a curated catalog
of palettes into DSH's built-in theme runtime and adds several rows to
**Settings → General** (below the built-in Appearance row):

- **皮肤 / Skins** — pick one of 7 curated palettes (or **默认 / Default** to
  follow the built-in appearance).
- **背景图片 / Wallpaper** — set your own background image with opacity and
  blur controls. **Any image size works** — the image is downscaled to at most
  2560px and stored as a compressed JPEG Blob in IndexedDB, so there is no
  2MB / localStorage-quota limit.
- **界面玻璃 / Glass** — four transparency sliders: **界面透明度**
  (main canvas, surfaces, sidebar, menus), **对话框透明度** (dialogs,
  popovers, toasts, tooltips), **边框透明度** (all border levels), and
  **输入框透明度** (the message composer). 0% is fully opaque; raising
  them lets the backdrop show through.
- **字体 / Fonts** — **全局字号** (70–160% zoom of the whole UI),
  **思考字号** (reasoning text size) and **回答字号** (assistant answer
  size) as independent px sliders, plus custom **文字颜色** per color
  scheme (light/dark).
- **主题预设 / Theme presets** — one-click bundles of skin + transparency +
  font settings (默认清晰, 磨砂玻璃, 深海玻璃, 午夜玻璃, 极致透视, 护眼大字,
  樱粉玻璃).

All choices persist across reloads (small preferences in localStorage; the
image itself in IndexedDB).

## Desktop wallpaper (real system desktop)

The CSS-level transparency works everywhere, but the Electron desktop app's
window is opaque by default, so translucent areas would only show the window's
own background color. The app's `electron/main.js` is patched once
(`main.js.lukeskinplus.bak` backup sits next to it):

```js
new BrowserWindow({
  // …
  transparent: true,
  backgroundColor: '#00000000',
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#00000000',
    symbolColor: '#a0a4ab',
    height: 36,
  },
});
```

- `transparent: true` makes the window genuinely transparent, so translucent
  CSS surfaces show the real desktop wallpaper (crisp, not frosted).
- `titleBarStyle: 'hidden'` + `titleBarOverlay` let Windows draw the native
  minimize / maximize / close buttons as an overlay in the top-right corner
  (WCO) — transparent windows alone lose those buttons.
- The plugin then, in Electron only: pads the conversation header right so the
  WCO buttons never cover the header controls, and turns the header into the
  window drag region (interactive children stay clickable; the region is
  auto-disabled while a modal dialog is open so overlay close buttons keep
  working).

Restart the app once after applying the patch.

## What changed vs. dsh-skin

| | dsh-skin (old) | lukeskinplus (new) |
|---|---|---|
| Wallpaper storage | base64 data URL in `localStorage` (~5MB quota → ~2MB practical limit) | compressed JPEG Blob in **IndexedDB** (no practical size limit) |
| File reading | `FileReader.readAsDataURL` (base64, ~33% overhead) | direct `Blob` → canvas → `toBlob` (raw bytes) |
| Downscale | aggressive `>2MB` re-encode loop (1600/1000/800px) | single pass to ≤2560px @ 0.85 quality |
| Transparency | inverted "opacity" semantics | real transparency sliders: interface / dialogs / borders / composer (0–100%) |
| Fonts | — | global UI zoom + thinking size + answer size + text colors |
| Themes | — | 7 preset bundles |
| Large photos | silently fail / not persist | just work |

## How it works

DSH's theme system is token-based: the web shell ships `--dsw-*` design tokens,
and `ThemeRuntime` lets third-party plugins register themes that override the
alias layer (`--dsw-alias-*`) per color scheme. This package is a regular
dual-face plugin:

- **Host half** (`lib/index.js`) — a `dsh.bundle` patch layer that inserts one
  loader entry (`lukeskinplus`); a no-op `apply`, exactly like the shipped ui-*
  packages.
- **Browser half** (`lib/client.js`) — a `dsh.client` bundle (served at
  `/plugins/lukeskinplus/client.js`) that:
  1. registers 7 curated skins via `ctx.theme.register(...)`;
  2. restores the saved skin id and applies it with `ctx.theme.setTheme(...)`;
  3. renders the wallpaper as a fixed backdrop layer (`z-index: -1`);
  4. stacks one permanent token override layer
     (`ctx.theme.overrideTokens("lukeskinplus:glass", …)`) that shades every
     background/border/composer token by the four transparency sliders
     (composed with the wallpaper wash), overrides
     `--dsw-alias-label-primary` with the custom text colors, and rewrites the
     `--dsw-font-markdown-*` family for the answer size;
  5. injects a small `<style>` sheet that sizes the hardcoded-px font rules
     (assistant answer root, reasoning rows, trajectory thinking quotes),
     applies the global UI zoom, and — in the Electron desktop app — adds the
     window drag region and the WCO caption-button clearance; the hashed
     CSS-module class names are discovered at runtime from each module's
     injected `<style data-plugin-css>` tag, so the overrides survive app
     updates;
  6. keeps the slot stores in sync with `theme/change`;
  7. mounts the Skin, Wallpaper, Glass, Fonts, and Theme-presets rows into
     `settings.general.item`.

## Skins

| id        | scheme | vibe                              |
|-----------|--------|-----------------------------------|
| `ocean`   | dark   | DeepSeek-blue deep sea            |
| `graphite`| dark   | neutral monochrome                |
| `forest`  | dark   | green calm                        |
| `sunset`  | dark   | warm purple                       |
| `midnight`| dark   | pure black OLED                   |
| `paper`   | light  | warm paper                        |
| `sakura`  | light  | pink accents                      |

## Persistence

- Skin id, glass/font/color preferences, transparency, and blur live in
  `localStorage`.
- The wallpaper image lives in IndexedDB (database `dsh-skin-plus`).
- Storage keys keep the original `dsh-skin-plus:` prefix so existing settings
  carry over after upgrading from dsh-skin.

## Install

```sh
dsh plugin --profile web add -w github:INEXEN-Arthur/lukeskinplus
```

Then restart the web server to pick up the new bundle layer:

```sh
# stop the running instance, then:
dsh web
```

Open **Settings → General** to use the features.

## Development

The client bundle is written directly in the `__ModuleLoader__` bundle format
(the same shape tsdown emits for the shipped `ui-*` packages), so no build step
is required. `lib/client.js` may `require` only module-table entities: platform
seed words (`react`, `react/jsx-runtime`, …) and registered client bundles.
