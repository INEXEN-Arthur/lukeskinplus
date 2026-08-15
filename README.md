# lukeskinplus

Skin switcher + custom wallpaper for DeepSeek Harness — a drop-in replacement
for `dsh-skin` that fixes its 2MB image limit. It registers a curated catalog
of palettes into DSH's built-in theme runtime and adds two rows to
**Settings → General** (below the built-in Appearance row):

- **皮肤 / Skins** — pick one of 7 curated palettes (or **默认 / Default** to
  follow the built-in appearance).
- **背景图片 / Wallpaper** — set your own background image with opacity and
  blur controls. **Any image size works** — the image is downscaled to at most
  2560px and stored as a compressed JPEG Blob in IndexedDB, so there is no
  2MB / localStorage-quota limit.

Both choices persist across reloads (small preferences in localStorage; the
image itself in IndexedDB).

## What changed vs. dsh-skin

| | dsh-skin (old) | lukeskinplus (new) |
|---|---|---|
| Wallpaper storage | base64 data URL in `localStorage` (~5MB quota → ~2MB practical limit) | compressed JPEG Blob in **IndexedDB** (no practical size limit) |
| File reading | `FileReader.readAsDataURL` (base64, ~33% overhead) | direct `Blob` → canvas → `toBlob` (raw bytes) |
| Downscale | aggressive `>2MB` re-encode loop (1600/1000/800px) | single pass to ≤2560px @ 0.85 quality |
| Transparency | inverted "opacity" semantics | real transparency slider: higher = image more visible (default 65%) |
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
  3. renders the wallpaper as a fixed backdrop layer (`z-index: -1`) and stacks
     a token override (`ctx.theme.overrideTokens`) that makes the main canvas
     (`--dsw-alias-bg-base`) and sidebar (`--dsw-specific-sidebar-fill`)
     translucent, so the image shows through while inner surfaces (cards,
     inputs, bubbles) stay opaque and readable;
  4. keeps the slot stores in sync with `theme/change`;
  5. mounts both rows into `settings.general.item`.

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

## Wallpaper

In **Settings → General → 背景图片 / Wallpaper**:

- **选择图片 / Choose image** — pick any local image; it is decoded, downscaled
  to ≤2560px, re-encoded as JPEG, and stored in IndexedDB (kept in this browser
  only).
- **透明度 / Transparency** — higher = the image shows through more clearly
  (default 65%).
- **模糊 / Blur** — blur radius for the wallpaper.
- **移除图片 / Remove** — clears it.

## Persistence

- Skin id, transparency, and blur live in `localStorage`.
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

Open **Settings → General** to use both features.

## Development

The client bundle is written directly in the `__ModuleLoader__` bundle format
(the same shape tsdown emits for the shipped `ui-*` packages), so no build step
is required. `lib/client.js` may `require` only module-table entities: platform
seed words (`react`, `react/jsx-runtime`, …) and registered client bundles.