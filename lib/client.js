// lukeskinplus — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/lukeskinplus/client.js and executed
// through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with
// require() resolved against the shell's module table — the same shape the
// shipped ui-* packages' tsdown bundles emit.
//
// Storage: the skin id, transparency, and blur live in localStorage (tiny values).
// The wallpaper image itself is stored as a compressed JPEG Blob in IndexedDB
// (`dsh-skin-plus/files`), so there is NO 2MB / localStorage-quota limit —
// multi-megabyte photos are downscaled to at most 2560px and stored raw (no
// base64 overhead), which IndexedDB handles comfortably.
window.__ModuleLoader__.load({
	id: "lukeskinplus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");
		let _runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		//#region lukeskinplus: definitions
		/** The settings row's locale namespace. */
		const SETTINGS_NS = "settings.lukeskinplus";
		/** localStorage key holding the selected skin id. */
		const STORAGE_KEY = "dsh-skin-plus:skin";
		/** localStorage key holding the wallpaper transparency (0..1; 1 = image fully visible). */
		const WALLPAPER_TRANSPARENCY_KEY = "dsh-skin-plus:wallpaper-transparency";
		/** localStorage key holding the wallpaper blur radius (px). */
		const WALLPAPER_BLUR_KEY = "dsh-skin-plus:wallpaper-blur";
		/** Sentinel meaning "no custom skin — follow the built-in appearance". */
		const DEFAULT_SKIN = "system";
		/** Default transparency (0..1; 1 = image fully visible). */
		const DEFAULT_WALLPAPER_TRANSPARENCY = 0.65;
		/** Default wallpaper blur radius in px. */
		const DEFAULT_WALLPAPER_BLUR = 0;
		/** Source identity for the wallpaper's token override layer. */
		const OVERRIDE_SOURCE = "lukeskinplus:wallpaper";
		/** IndexedDB database name for the wallpaper Blob. */
		const DB_NAME = "dsh-skin-plus";
		/** IndexedDB object store name. */
		const DB_STORE = "files";
		/** IndexedDB key under which the wallpaper Blob is stored. */
		const WALLPAPER_ID = "wallpaper";
		/** Maximum long edge (px) a wallpaper is downscaled to before storing. */
		const MAX_IMAGE_SIDE = 2560;
		/** JPEG quality (0..1) used when re-encoding the wallpaper. */
		const JPEG_QUALITY = 0.85;
		/** Built-in base colors used when no skin token overrides the scheme. */
		const BUILTIN_BASE = {
			light: "rgb(255, 255, 255)",
			dark: "rgb(21, 21, 23)"
		};

		/**
		 * The curated skin catalog. Every skin is a third-party theme for the
		 * built-in ThemeRuntime: an id, the base palette it builds on
		 * (colorScheme drives body[data-ds-dark-theme]), and --dsw-alias-*
		 * overrides applied as inline custom properties on <body> by ui-layout's
		 * ThemePresenter. Values are concrete CSS colors (no var() indirection),
		 * tuned per skin for contrast on both surface and text roles.
		 */
		const SKINS = [
			{
				id: "ocean",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0a101f",
					"--dsw-alias-bg-layer-1": "#101a30",
					"--dsw-alias-bg-layer-2": "#16233e",
					"--dsw-alias-bg-layer-3": "#1c2c4d",
					"--dsw-alias-bg-overlay": "#1e2c49",
					"--dsw-alias-border-l1": "rgba(148, 163, 184, 0.14)",
					"--dsw-alias-border-l2": "rgba(148, 163, 184, 0.26)",
					"--dsw-alias-label-primary": "#e9eef9",
					"--dsw-alias-label-secondary": "#a5b3cc",
					"--dsw-alias-label-tertiary": "#7e8da8",
					"--dsw-alias-brand-primary": "#4d86f8",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#6d9dfa",
					"--dsw-alias-button-primary-dimmed": "#16233e",
					"--dsw-alias-state-business-primary": "#4d86f8",
					"--dsw-alias-state-business-tertiary": "#16233e",
					"--dsw-alias-interactive-bg-hover": "rgba(77, 134, 248, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(77, 134, 248, 0.2)",
					"--dsw-alias-markdown-code-block": "#0d1426",
					"--dsw-alias-markdown-inline-code": "#16233e",
					"--dsw-specific-sidebar-fill": "#0d1426",
					"--dsw-specific-sidebar-nav-item-active": "#16233e",
					"--dsw-specific-sidebar-nav-item-hover": "#121c31",
					"--dsw-alias-scrollbar-bg-l1": "#1c2c4d",
					"--dsw-alias-scrollbar-bg-l2": "#23365e",
					"--dsw-alias-scrollbar-hover-l1": "#2a3f6d",
					"--dsw-alias-scrollbar-hover-l2": "#2a3f6d"
				}
			},
			{
				id: "graphite",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0f0f11",
					"--dsw-alias-bg-layer-1": "#17171a",
					"--dsw-alias-bg-layer-2": "#1e1e22",
					"--dsw-alias-bg-layer-3": "#26262b",
					"--dsw-alias-bg-overlay": "#27272c",
					"--dsw-alias-border-l1": "rgba(255, 255, 255, 0.07)",
					"--dsw-alias-border-l2": "rgba(255, 255, 255, 0.14)",
					"--dsw-alias-label-primary": "#ededf0",
					"--dsw-alias-label-secondary": "#a2a2ab",
					"--dsw-alias-label-tertiary": "#82828c",
					"--dsw-alias-brand-primary": "#b9bdc8",
					"--dsw-alias-brand-text": "#101012",
					"--dsw-alias-button-primary-hover": "#d2d5de",
					"--dsw-alias-button-primary-dimmed": "#26262b",
					"--dsw-alias-state-business-primary": "#b9bdc8",
					"--dsw-alias-state-business-tertiary": "#26262b",
					"--dsw-alias-interactive-bg-hover": "rgba(255, 255, 255, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(255, 255, 255, 0.14)",
					"--dsw-alias-markdown-code-block": "#141417",
					"--dsw-alias-markdown-inline-code": "#1e1e22",
					"--dsw-specific-sidebar-fill": "#141417",
					"--dsw-specific-sidebar-nav-item-active": "#1e1e22",
					"--dsw-specific-sidebar-nav-item-hover": "#1a1a1e",
					"--dsw-alias-scrollbar-bg-l1": "#2e2e34",
					"--dsw-alias-scrollbar-bg-l2": "#383840",
					"--dsw-alias-scrollbar-hover-l1": "#45454e",
					"--dsw-alias-scrollbar-hover-l2": "#45454e"
				}
			},
			{
				id: "forest",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0a120d",
					"--dsw-alias-bg-layer-1": "#101a13",
					"--dsw-alias-bg-layer-2": "#17241a",
					"--dsw-alias-bg-layer-3": "#1e2e22",
					"--dsw-alias-bg-overlay": "#203024",
					"--dsw-alias-border-l1": "rgba(134, 239, 172, 0.1)",
					"--dsw-alias-border-l2": "rgba(134, 239, 172, 0.2)",
					"--dsw-alias-label-primary": "#e7f5eb",
					"--dsw-alias-label-secondary": "#9dc4a9",
					"--dsw-alias-label-tertiary": "#7ba68a",
					"--dsw-alias-brand-primary": "#34d37b",
					"--dsw-alias-brand-text": "#04120a",
					"--dsw-alias-button-primary-hover": "#5ae295",
					"--dsw-alias-button-primary-dimmed": "#17241a",
					"--dsw-alias-state-business-primary": "#34d37b",
					"--dsw-alias-state-business-tertiary": "#17241a",
					"--dsw-alias-interactive-bg-hover": "rgba(52, 211, 123, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(52, 211, 123, 0.2)",
					"--dsw-alias-markdown-code-block": "#0c1510",
					"--dsw-alias-markdown-inline-code": "#17241a",
					"--dsw-specific-sidebar-fill": "#0c1510",
					"--dsw-specific-sidebar-nav-item-active": "#17241a",
					"--dsw-specific-sidebar-nav-item-hover": "#111d15",
					"--dsw-alias-scrollbar-bg-l1": "#1e2e22",
					"--dsw-alias-scrollbar-bg-l2": "#26402e",
					"--dsw-alias-scrollbar-hover-l1": "#2f5038",
					"--dsw-alias-scrollbar-hover-l2": "#2f5038"
				}
			},
			{
				id: "sunset",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#150f1f",
					"--dsw-alias-bg-layer-1": "#1d152b",
					"--dsw-alias-bg-layer-2": "#261c38",
					"--dsw-alias-bg-layer-3": "#302346",
					"--dsw-alias-bg-overlay": "#312548",
					"--dsw-alias-border-l1": "rgba(233, 213, 255, 0.1)",
					"--dsw-alias-border-l2": "rgba(233, 213, 255, 0.2)",
					"--dsw-alias-label-primary": "#f4edfc",
					"--dsw-alias-label-secondary": "#c2aee0",
					"--dsw-alias-label-tertiary": "#9f8cc2",
					"--dsw-alias-brand-primary": "#c084fc",
					"--dsw-alias-brand-text": "#1a0f26",
					"--dsw-alias-button-primary-hover": "#d4a4fd",
					"--dsw-alias-button-primary-dimmed": "#261c38",
					"--dsw-alias-state-business-primary": "#c084fc",
					"--dsw-alias-state-business-tertiary": "#261c38",
					"--dsw-alias-interactive-bg-hover": "rgba(192, 132, 252, 0.14)",
					"--dsw-alias-interactive-bg-active": "rgba(192, 132, 252, 0.24)",
					"--dsw-alias-markdown-code-block": "#181022",
					"--dsw-alias-markdown-inline-code": "#261c38",
					"--dsw-specific-sidebar-fill": "#181022",
					"--dsw-specific-sidebar-nav-item-active": "#261c38",
					"--dsw-specific-sidebar-nav-item-hover": "#1d1429",
					"--dsw-alias-scrollbar-bg-l1": "#302346",
					"--dsw-alias-scrollbar-bg-l2": "#3d2d5a",
					"--dsw-alias-scrollbar-hover-l1": "#4a3770",
					"--dsw-alias-scrollbar-hover-l2": "#4a3770"
				}
			},
			{
				id: "midnight",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#000000",
					"--dsw-alias-bg-layer-1": "#0b0b0f",
					"--dsw-alias-bg-layer-2": "#141419",
					"--dsw-alias-bg-layer-3": "#1c1c23",
					"--dsw-alias-bg-overlay": "#1d1d24",
					"--dsw-alias-border-l1": "rgba(255, 255, 255, 0.06)",
					"--dsw-alias-border-l2": "rgba(255, 255, 255, 0.12)",
					"--dsw-alias-label-primary": "#e8e8ee",
					"--dsw-alias-label-secondary": "#9d9daa",
					"--dsw-alias-label-tertiary": "#7c7c88",
					"--dsw-alias-brand-primary": "#7c8cff",
					"--dsw-alias-brand-text": "#05050a",
					"--dsw-alias-button-primary-hover": "#9aa7ff",
					"--dsw-alias-button-primary-dimmed": "#141419",
					"--dsw-alias-state-business-primary": "#7c8cff",
					"--dsw-alias-state-business-tertiary": "#141419",
					"--dsw-alias-interactive-bg-hover": "rgba(124, 140, 255, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(124, 140, 255, 0.2)",
					"--dsw-alias-markdown-code-block": "#08080b",
					"--dsw-alias-markdown-inline-code": "#141419",
					"--dsw-specific-sidebar-fill": "#08080b",
					"--dsw-specific-sidebar-nav-item-active": "#141419",
					"--dsw-specific-sidebar-nav-item-hover": "#0e0e13",
					"--dsw-alias-scrollbar-bg-l1": "#1c1c23",
					"--dsw-alias-scrollbar-bg-l2": "#26262f",
					"--dsw-alias-scrollbar-hover-l1": "#31313c",
					"--dsw-alias-scrollbar-hover-l2": "#31313c"
				}
			},
			{
				id: "paper",
				colorScheme: "light",
				tokens: {
					"--dsw-alias-bg-base": "#faf7f1",
					"--dsw-alias-bg-layer-1": "#ffffff",
					"--dsw-alias-bg-layer-2": "#f4efe5",
					"--dsw-alias-bg-layer-3": "#ebe3d4",
					"--dsw-alias-bg-overlay": "#fffdf8",
					"--dsw-alias-border-l1": "rgba(120, 96, 48, 0.1)",
					"--dsw-alias-border-l2": "rgba(120, 96, 48, 0.18)",
					"--dsw-alias-label-primary": "#2e2a22",
					"--dsw-alias-label-secondary": "#6f675a",
					"--dsw-alias-label-tertiary": "#8e8578",
					"--dsw-alias-brand-primary": "#b45309",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#d97706",
					"--dsw-alias-button-primary-dimmed": "#f4efe5",
					"--dsw-alias-state-business-primary": "#b45309",
					"--dsw-alias-state-business-tertiary": "#f4efe5",
					"--dsw-alias-interactive-bg-hover": "rgba(180, 83, 9, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(180, 83, 9, 0.14)",
					"--dsw-alias-markdown-code-block": "#f4efe5",
					"--dsw-alias-markdown-inline-code": "#f0e9da",
					"--dsw-specific-sidebar-fill": "#f4efe5",
					"--dsw-specific-sidebar-nav-item-active": "#ebe3d4",
					"--dsw-specific-sidebar-nav-item-hover": "#eee7d8",
					"--dsw-alias-scrollbar-bg-l1": "#e0d6c2",
					"--dsw-alias-scrollbar-bg-l2": "#d8ccb4",
					"--dsw-alias-scrollbar-hover-l1": "#cdbfa3",
					"--dsw-alias-scrollbar-hover-l2": "#cdbfa3"
				}
			},
			{
				id: "sakura",
				colorScheme: "light",
				tokens: {
					"--dsw-alias-bg-base": "#fdf5f7",
					"--dsw-alias-bg-layer-1": "#ffffff",
					"--dsw-alias-bg-layer-2": "#f9e8ee",
					"--dsw-alias-bg-layer-3": "#f2dae3",
					"--dsw-alias-bg-overlay": "#fffbfc",
					"--dsw-alias-border-l1": "rgba(190, 80, 120, 0.1)",
					"--dsw-alias-border-l2": "rgba(190, 80, 120, 0.18)",
					"--dsw-alias-label-primary": "#3b2530",
					"--dsw-alias-label-secondary": "#8b6576",
					"--dsw-alias-label-tertiary": "#a27f8f",
					"--dsw-alias-brand-primary": "#db2777",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#ec4899",
					"--dsw-alias-button-primary-dimmed": "#f9e8ee",
					"--dsw-alias-state-business-primary": "#db2777",
					"--dsw-alias-state-business-tertiary": "#f9e8ee",
					"--dsw-alias-interactive-bg-hover": "rgba(219, 39, 119, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(219, 39, 119, 0.14)",
					"--dsw-alias-markdown-code-block": "#f9e8ee",
					"--dsw-alias-markdown-inline-code": "#f2dae3",
					"--dsw-specific-sidebar-fill": "#f9e8ee",
					"--dsw-specific-sidebar-nav-item-active": "#f2dae3",
					"--dsw-specific-sidebar-nav-item-hover": "#f6e0e8",
					"--dsw-alias-scrollbar-bg-l1": "#eccfda",
					"--dsw-alias-scrollbar-bg-l2": "#e4c0cf",
					"--dsw-alias-scrollbar-hover-l1": "#d9afc1",
					"--dsw-alias-scrollbar-hover-l2": "#d9afc1"
				}
			}
		];

		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"skin.title": "皮肤",
			"skin.default": "默认",
			"skin.ocean": "深海蓝",
			"skin.graphite": "石墨灰",
			"skin.forest": "森林绿",
			"skin.sunset": "落日紫",
			"skin.midnight": "午夜黑",
			"skin.paper": "纸感暖",
			"skin.sakura": "樱花粉",
			"background.title": "背景图片",
			"background.choose": "选择图片",
			"background.remove": "移除图片",
			"background.opacity": "透明度",
			"background.blur": "模糊",
			"background.hint": "图片显示在主内容区与侧边栏的半透明底上，消息等内层表面保持不透明以保证可读性。支持任意大小的图片（自动压缩保存，无 2MB 限制）"
		};

		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"skin.title": "Skins",
			"skin.default": "Default",
			"skin.ocean": "Ocean",
			"skin.graphite": "Graphite",
			"skin.forest": "Forest",
			"skin.sunset": "Sunset",
			"skin.midnight": "Midnight",
			"skin.paper": "Paper",
			"skin.sakura": "Sakura",
			"background.title": "Wallpaper",
			"background.choose": "Choose image",
			"background.remove": "Remove",
			"background.opacity": "Transparency",
			"background.blur": "Blur",
			"background.hint": "The image shows through the translucent main canvas and sidebar; inner surfaces stay opaque for readability. Any image size is supported (auto-compressed, no 2MB limit)."
		};
		//#endregion

		//#region lukeskinplus: localStorage persistence (small values only)
		/** Read a localStorage string value (null on absence or error). */
		function readStorage(key) {
			try {
				const value = window.localStorage.getItem(key);
				return typeof value === "string" ? value : null;
			} catch {
				return null;
			}
		}

		/** Write (or remove with null) a localStorage value. */
		function writeStorage(key, value) {
			try {
				if (value === null) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, value);
			} catch {
				// storage unavailable / quota — the preference stays process-local
			}
		}

		/** Saved skin id (may be unknown/absent). */
		function readSavedSkin() {
			return readStorage(STORAGE_KEY);
		}

		/** Persist a skin choice; DEFAULT_SKIN clears the stored value. */
		function writeSavedSkin(id) {
			writeStorage(STORAGE_KEY, id === DEFAULT_SKIN ? null : id);
		}

		/** Wallpaper transparency 0..1 (clamped; default when unset). */
		function readWallpaperTransparency() {
			const raw = readStorage(WALLPAPER_TRANSPARENCY_KEY);
			if (raw === null) return DEFAULT_WALLPAPER_TRANSPARENCY;
			const value = Number(raw);
			return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_WALLPAPER_TRANSPARENCY;
		}

		/** Blur radius in px (clamped to 0..60; default when unset). */
		function readWallpaperBlur() {
			const raw = readStorage(WALLPAPER_BLUR_KEY);
			if (raw === null) return DEFAULT_WALLPAPER_BLUR;
			const value = Number(raw);
			return Number.isFinite(value) ? Math.min(60, Math.max(0, value)) : DEFAULT_WALLPAPER_BLUR;
		}
		//#endregion

		//#region lukeskinplus: IndexedDB persistence (the wallpaper Blob)
		/** Open the wallpaper IndexedDB (creating the store on first use). */
		function openDb() {
			return new Promise((resolve, reject) => {
				let request;
				try {
					request = window.indexedDB.open(DB_NAME, 1);
				} catch (error) {
					reject(error);
					return;
				}
				request.onupgradeneeded = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
				};
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error ?? new Error("indexedDB open failed"));
			});
		}

		/** Read the stored wallpaper Blob (null when absent or unavailable). */
		function idbGet(key) {
			return openDb()
				.then((db) => new Promise((resolve, reject) => {
					const tx = db.transaction(DB_STORE, "readonly");
					const request = tx.objectStore(DB_STORE).get(key);
					request.onsuccess = () => resolve(request.result ?? null);
					request.onerror = () => reject(request.error ?? new Error("indexedDB get failed"));
					tx.oncomplete = () => db.close();
				}))
				.catch(() => null);
		}

		/** Store (or replace) a value under a key. */
		function idbPut(key, value) {
			return openDb().then((db) => new Promise((resolve, reject) => {
				const tx = db.transaction(DB_STORE, "readwrite");
				tx.objectStore(DB_STORE).put(value, key);
				tx.oncomplete = () => { db.close(); resolve(); };
				tx.onerror = () => { db.close(); reject(tx.error ?? new Error("indexedDB put failed")); };
				tx.onabort = () => { db.close(); reject(tx.error ?? new Error("indexedDB put aborted")); };
			}));
		}

		/** Delete a key (no-op on failure). */
		function idbDel(key) {
			return openDb()
				.then((db) => new Promise((resolve, reject) => {
					const tx = db.transaction(DB_STORE, "readwrite");
					tx.objectStore(DB_STORE).delete(key);
					tx.oncomplete = () => { db.close(); resolve(); };
					tx.onerror = () => { db.close(); reject(tx.error ?? new Error("indexedDB delete failed")); };
					tx.onabort = () => { db.close(); reject(tx.error ?? new Error("indexedDB delete aborted")); };
				}))
				.catch(() => {});
		}
		//#endregion

		//#region lukeskinplus: wallpaper layer + token shading
		/** The fixed backdrop layer (z-index -1), created lazily. */
		let wallpaperEl = null;
		/** Disposer for the current token-override layer. */
		let wallpaperOverrideDispose = null;
		/** Object URL of the currently applied wallpaper (or null). */
		let currentWallpaperUrl = null;
		/** Signature of the last applied token override (re-shade loop guard). */
		let lastOverrideSignature = null;

		/** Parse a hex or rgb()/rgba() color into rgba() with the given alpha. */
		function toRgba(color, alpha) {
			const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
			if (hex !== null) {
				let digits = hex[1];
				if (digits.length === 3) digits = digits.split("").map((char) => char + char).join("");
				const n = parseInt(digits, 16);
				return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
			}
			const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(color.trim());
			if (rgb !== null) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
			return color.trim();
		}

		/**
		 * The base color for one scheme: the active skin's `--dsw-alias-bg-base`
		 * when it owns that scheme, otherwise the built-in base. The wash always
		 * carries the active skin's tint (and re-shades on theme/change).
		 */
		function resolveBase(scheme, active) {
			if (active.colorScheme === scheme && typeof active.tokens["--dsw-alias-bg-base"] === "string") {
				return active.tokens["--dsw-alias-bg-base"];
			}
			return BUILTIN_BASE[scheme];
		}

		/**
		 * Stack the wallpaper's token override layer: the main canvas
		 * (--dsw-alias-bg-base) and the sidebar (--dsw-specific-sidebar-fill)
		 * become translucent at the configured transparency, so the fixed backdrop
		 * shows through while inner surfaces (cards, inputs, bubbles) stay
		 * opaque and readable. Re-calling with the same source replaces the
		 * whole layer (per the ThemeRuntime contract).
		 */
		function shadeTokens(ctx) {
			const snapshot = ctx.theme.getTheme();
			const transparency = readWallpaperTransparency();
			const wash = Math.min(1, Math.max(0, 1 - transparency));
			const sidebarWash = Math.min(1, wash + 0.1);
			const overrides = {
				"--dsw-alias-bg-base": {
					light: toRgba(resolveBase("light", snapshot.active), wash),
					dark: toRgba(resolveBase("dark", snapshot.active), wash)
				},
				"--dsw-specific-sidebar-fill": {
					light: toRgba(resolveBase("light", snapshot.active), sidebarWash),
					dark: toRgba(resolveBase("dark", snapshot.active), sidebarWash)
				}
			};
			const signature = JSON.stringify(overrides);
			if (signature === lastOverrideSignature) return;
			lastOverrideSignature = signature;
			wallpaperOverrideDispose?.();
			wallpaperOverrideDispose = ctx.theme.overrideTokens(OVERRIDE_SOURCE, overrides);
		}

		/** Apply (or clear) the wallpaper layer and its token shading. */
		function applyWallpaper(ctx) {
			const url = currentWallpaperUrl;
			if (url === null) {
				wallpaperEl?.remove();
				wallpaperEl = null;
				wallpaperOverrideDispose?.();
				wallpaperOverrideDispose = null;
				lastOverrideSignature = null;
				return;
			}
			if (wallpaperEl === null || !document.body.contains(wallpaperEl)) {
				wallpaperEl = document.createElement("div");
				wallpaperEl.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;";
				document.body.prepend(wallpaperEl);
			}
			const blur = readWallpaperBlur();
			wallpaperEl.style.backgroundImage = `url("${url}")`;
			wallpaperEl.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
			shadeTokens(ctx);
		}

		/** Remove the wallpaper layer, token overrides, and object URL (fiber unload). */
		function teardownWallpaper() {
			wallpaperEl?.remove();
			wallpaperEl = null;
			wallpaperOverrideDispose?.();
			wallpaperOverrideDispose = null;
			lastOverrideSignature = null;
			if (currentWallpaperUrl !== null) {
				URL.revokeObjectURL(currentWallpaperUrl);
				currentWallpaperUrl = null;
			}
		}
		//#endregion

		//#region lukeskinplus: image processing (no size cap)
		/** Decode a Blob into an HTMLImageElement (object URL is returned for cleanup). */
		function decodeImageBlob(blob) {
			return new Promise((resolve, reject) => {
				const url = URL.createObjectURL(blob);
				const image = new Image();
				image.onload = () => resolve({ image, url });
				image.onerror = () => {
					URL.revokeObjectURL(url);
					reject(new Error("image decode failed"));
				};
				image.src = url;
			});
		}

		/**
		 * Downscale a picked file to at most MAX_IMAGE_SIDE px on its long edge
		 * and re-encode it as a JPEG Blob. This keeps huge photos usable while
		 * removing the base64 overhead the old implementation paid; the result
		 * goes to IndexedDB, which has no practical size limit for a wallpaper.
		 */
		async function compressImage(file) {
			const { image, url } = await decodeImageBlob(file);
			try {
				const sourceWidth = image.naturalWidth || image.width;
				const sourceHeight = image.naturalHeight || image.height;
				const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(sourceWidth, sourceHeight));
				const canvas = document.createElement("canvas");
				canvas.width = Math.max(1, Math.round(sourceWidth * scale));
				canvas.height = Math.max(1, Math.round(sourceHeight * scale));
				const context = canvas.getContext("2d");
				context.drawImage(image, 0, 0, canvas.width, canvas.height);
				return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
			} finally {
				URL.revokeObjectURL(url);
			}
		}
		//#endregion

		//#region lukeskinplus: settings row stores
		/**
		 * Skin row slot store: a mirror of the theme service snapshot. The
		 * plugin's apply-world change listener is the only writer; the row
		 * component reads via props.useStore.
		 */
		function createSkinStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({
					skin: "system",
					revision: -1
				}),
				actions: {
					sync: (d, skin, revision) => {
						if (revision <= d.revision) return;
						d.skin = skin;
						d.revision = revision;
					}
				}
			});
		}

		/** Wallpaper row store: object URL + transparency + blur, written only by this plugin. */
		function createWallpaperStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({
					url: null,
					transparency: DEFAULT_WALLPAPER_TRANSPARENCY,
					blur: DEFAULT_WALLPAPER_BLUR,
					revision: -1
				}),
				actions: {
					sync: (d, url, transparency, blur, revision) => {
						if (revision <= d.revision) return;
						d.url = url;
						d.transparency = transparency;
						d.blur = blur;
						d.revision = revision;
					}
				}
			});
		}
		//#endregion

		//#region lukeskinplus: settings rows
		/** Inline style sheet for the rows (kept dependency-free). */
		const styles = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				padding: "16px 0"
			},
			title: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "14px",
				fontWeight: 400,
				lineHeight: "22px"
			},
			hint: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "12px",
				lineHeight: "18px"
			},
			grid: {
				display: "flex",
				flexWrap: "wrap",
				gap: "10px"
			},
			card: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "6px",
				width: "96px",
				padding: "3px",
				borderRadius: "10px",
				border: "2px solid transparent",
				background: "transparent",
				cursor: "pointer",
				font: "inherit",
				boxSizing: "border-box"
			},
			cardSelected: {
				borderColor: "var(--dsw-alias-brand-primary)",
				background: "var(--dsw-alias-interactive-bg-hover)"
			},
			cardLabel: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "12px",
				lineHeight: "16px",
				whiteSpace: "nowrap"
			},
			cardLabelSelected: {
				color: "var(--dsw-alias-label-primary)"
			},
			swatch: {
				width: "100%",
				height: "52px",
				borderRadius: "8px",
				boxSizing: "border-box",
				padding: "8px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				gap: "6px"
			},
			swatchLine: {
				height: "7px",
				borderRadius: "4px"
			},
			defaultSwatch: {
				width: "100%",
				height: "52px",
				borderRadius: "8px",
				boxSizing: "border-box",
				display: "flex",
				overflow: "hidden",
				border: "1px solid var(--dsw-alias-border-l2)"
			},
			button: {
				height: "32px",
				padding: "0 14px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-button-elevated-fill)",
				color: "var(--dsw-alias-label-primary)",
				cursor: "pointer",
				fontSize: "13px",
				font: "inherit",
				boxSizing: "border-box"
			},
			buttonDanger: {
				color: "var(--dsw-alias-state-error-primary)"
			},
			preview: {
				width: "72px",
				height: "44px",
				objectFit: "cover",
				borderRadius: "6px",
				border: "1px solid var(--dsw-alias-border-l2)"
			},
			actionRow: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				flexWrap: "wrap"
			},
			sliderRow: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				minWidth: "240px"
			},
			sliderLabel: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "13px",
				whiteSpace: "nowrap",
				width: "52px"
			},
			slider: {
				flex: 1,
				accentColor: "var(--dsw-alias-brand-primary)"
			},
			sliderValue: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "12px",
				whiteSpace: "nowrap",
				width: "44px",
				textAlign: "right"
			}
		};

		/** Mini palette preview driven by one skin's token table. */
		function Swatch({ tokens }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...styles.swatch,
					background: tokens["--dsw-alias-bg-layer-1"],
					border: `1px solid ${tokens["--dsw-alias-border-l2"]}`
				},
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "70%",
							background: tokens["--dsw-alias-label-primary"],
							opacity: 0.85
						}
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "45%",
							background: tokens["--dsw-alias-brand-primary"]
						}
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "55%",
							background: tokens["--dsw-alias-label-secondary"],
							opacity: 0.55
						}
					})
				]
			});
		}

		/** "Default" chip: follow the built-in appearance (light + dark halves). */
		function DefaultSwatch() {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.defaultSwatch,
				children: [
					(0, react_jsx_runtime.jsx)("div", { style: { flex: 1, background: "#f4f4f5" } }),
					(0, react_jsx_runtime.jsx)("div", { style: { flex: 1, background: "#1c1c20" } })
				]
			});
		}

		/** One selectable skin card. */
		function SkinCard({ skin, selected, onSelect, t }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onSelect,
				"aria-pressed": selected,
				style: {
					...styles.card,
					...(selected ? styles.cardSelected : {})
				},
				children: [
					(0, react_jsx_runtime.jsx)(Swatch, { tokens: skin.tokens }),
					(0, react_jsx_runtime.jsx)("span", {
						style: {
							...styles.cardLabel,
							...(selected ? styles.cardLabelSelected : {})
						},
						children: t(`skin.${skin.id}`)
					})
				]
			});
		}

		/**
		 * Skin picker row registered into the Settings → General item slot,
		 * right after the built-in Appearance row: title + a "Default" chip and
		 * one swatch card per curated skin.
		 */
		function SkinRow({ t, setSkin, useStore }) {
			const skin = useStore((s) => s.skin);
			const selected = SKINS.some((candidate) => candidate.id === skin) ? skin : null;
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("skin.title")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.grid,
						children: [
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSkin(DEFAULT_SKIN),
								"aria-pressed": selected === null,
								style: {
									...styles.card,
									...(selected === null ? styles.cardSelected : {})
								},
								children: [
									(0, react_jsx_runtime.jsx)(DefaultSwatch, {}),
									(0, react_jsx_runtime.jsx)("span", {
										style: {
											...styles.cardLabel,
											...(selected === null ? styles.cardLabelSelected : {})
										},
										children: t("skin.default")
									})
								]
							}),
							SKINS.map((skinDefinition) => (0, react_jsx_runtime.jsx)(SkinCard, {
								skin: skinDefinition,
								selected: selected === skinDefinition.id,
								onSelect: () => setSkin(skinDefinition.id),
								t
							}, skinDefinition.id))
						]
					})
				]
			});
		}

		/** One labeled slider (transparency or blur). */
		function Slider({ label, value, min, max, step, format, onChange }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.sliderRow,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						style: styles.sliderLabel,
						children: label
					}),
					(0, react_jsx_runtime.jsx)("input", {
						type: "range",
						min,
						max,
						step,
						value,
						style: styles.slider,
						onChange: (event) => onChange(Number(event.target.value))
					}),
					(0, react_jsx_runtime.jsx)("span", {
						style: styles.sliderValue,
						children: format(value)
					})
				]
			});
		}

		/**
		 * Wallpaper row: choose any local image (compressed to a JPEG Blob and
		 * stored in IndexedDB — no 2MB cap), preview it, tune the wash transparency
		 * and blur, and remove it.
		 */
		function WallpaperRow({ t, setWallpaper, setTransparency, setBlur, removeWallpaper, useStore }) {
			const url = useStore((s) => s.url);
			const transparency = useStore((s) => s.transparency);
			const blur = useStore((s) => s.blur);
			const inputRef = (0, _react.useRef)(null);
			const [busy, setBusy] = (0, _react.useState)(false);
			const onPick = () => inputRef.current?.click();
			const onFile = async (event) => {
				const file = event.target.files?.[0];
				if (file === void 0) return;
				setBusy(true);
				try {
					const blob = await compressImage(file);
					if (blob !== null && blob.size > 0) await setWallpaper(blob);
				} catch {
					// decode/encode failure — leave the current wallpaper untouched
				} finally {
					setBusy(false);
					event.target.value = "";
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("background.title")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.actionRow,
						children: [
							url !== null ? (0, react_jsx_runtime.jsx)("img", {
								src: url,
								alt: "",
								style: styles.preview
							}) : null,
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: onPick,
								disabled: busy,
								children: busy ? "…" : t("background.choose")
							}),
							url !== null ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles.button,
									...styles.buttonDanger
								},
								onClick: () => removeWallpaper(),
								children: t("background.remove")
							}) : null,
							(0, react_jsx_runtime.jsx)("input", {
								ref: inputRef,
								type: "file",
								accept: "image/*",
								style: { display: "none" },
								onChange: onFile
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("background.opacity"),
						value: Math.round(transparency * 100),
						min: 0,
						max: 100,
						step: 1,
						format: (v) => `${v}%`,
						onChange: setTransparency
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("background.blur"),
						value: blur,
						min: 0,
						max: 60,
						step: 1,
						format: (v) => `${v}px`,
						onChange: setBlur
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.hint,
						children: t("background.hint")
					})
				]
			});
		}
		//#endregion

		//#region lukeskinplus: client plugin body
		/**
		 * Required services: theme runtime (skins, switching, token override
		 * layers), slots/locale (the settings rows). Skin/transparency/blur persist
		 * in localStorage; the wallpaper Blob persists in IndexedDB.
		 */
		const inject = [
			"slots",
			"locale",
			"theme"
		];

		/**
		 * Client plugin body: register the curated skins into the theme runtime,
		 * restore the saved skin and wallpaper, keep the rows' stores in sync
		 * with theme/change, and register both rows into Settings → General.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			const disposers = SKINS.map((skinDefinition) => ctx.theme.register(skinDefinition));
			ctx.effect(() => () => {
				for (const dispose of disposers) dispose();
			}, "lukeskinplus: theme registration");

			// Restore the saved skin once (before any user interaction).
			const saved = readSavedSkin();
			if (typeof saved === "string" && saved !== DEFAULT_SKIN && SKINS.some((skinDefinition) => skinDefinition.id === saved)) {
				const current = ctx.theme.getTheme().preference;
				if (current !== saved) ctx.theme.setTheme(saved);
			}

			// Wallpaper bookkeeping.
			let wallpaperRevision = 0;
			const wallpaperStore = createWallpaperStore();
			let wallpaperBound;
			const syncWallpaper = () => {
				wallpaperRevision += 1;
				wallpaperBound?.sync(currentWallpaperUrl, readWallpaperTransparency(), readWallpaperBlur(), wallpaperRevision);
			};

			// Restore the wallpaper Blob from IndexedDB, then apply it.
			const restoreWallpaper = async () => {
				try {
					const blob = await idbGet(WALLPAPER_ID);
					if (blob instanceof Blob && blob.size > 0) {
						if (currentWallpaperUrl !== null) URL.revokeObjectURL(currentWallpaperUrl);
						currentWallpaperUrl = URL.createObjectURL(blob);
						applyWallpaper(ctx);
						syncWallpaper();
						return;
					}
				} catch {
					// IndexedDB read failure — fall through to a clean state
				}
				applyWallpaper(ctx);
				syncWallpaper();
			};

			ctx.effect(() => () => {
				teardownWallpaper();
			}, "lukeskinplus: wallpaper cleanup");

			const skinStore = createSkinStore();
			let skinBound;
			const syncSkin = (snapshot) => {
				skinBound?.sync(snapshot.preference, snapshot.revision);
				// A skin/scheme switch changes the base color; re-shade the wash.
				if (currentWallpaperUrl !== null) applyWallpaper(ctx);
			};
			ctx.on("theme/change", syncSkin);

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en
			}), "lukeskinplus: settings row dictionaries");

			const skinInjected = (actions) => {
				skinBound = actions;
				syncSkin(ctx.theme.getTheme());
				return {
					setSkin: (id) => {
						ctx.theme.setTheme(id);
						writeSavedSkin(id);
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "lukeskinplus",
				order: 20,
				store: skinStore,
				locale: SETTINGS_NS,
				inject: skinInjected
			}, SkinRow));

			const wallpaperInjected = (actions) => {
				wallpaperBound = actions;
				syncWallpaper();
				return {
					setWallpaper: async (blob) => {
						await idbPut(WALLPAPER_ID, blob);
						if (currentWallpaperUrl !== null) URL.revokeObjectURL(currentWallpaperUrl);
						currentWallpaperUrl = URL.createObjectURL(blob);
						applyWallpaper(ctx);
						syncWallpaper();
					},
					setTransparency: (percent) => {
						const value = Math.min(1, Math.max(0, percent / 100));
						writeStorage(WALLPAPER_TRANSPARENCY_KEY, String(value));
						applyWallpaper(ctx);
						syncWallpaper();
					},
					setBlur: (px) => {
						const value = Math.min(60, Math.max(0, px));
						writeStorage(WALLPAPER_BLUR_KEY, String(value));
						applyWallpaper(ctx);
						syncWallpaper();
					},
					removeWallpaper: async () => {
						await idbDel(WALLPAPER_ID);
						if (currentWallpaperUrl !== null) {
							URL.revokeObjectURL(currentWallpaperUrl);
							currentWallpaperUrl = null;
						}
						applyWallpaper(ctx);
						syncWallpaper();
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "lukeskinplus-wallpaper",
				order: 30,
				store: wallpaperStore,
				locale: SETTINGS_NS,
				inject: wallpaperInjected
			}, WallpaperRow));

			// Kick off the async wallpaper restore (after the slots are registered).
			restoreWallpaper();
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.SKINS = SKINS;
		exports.DEFAULT_SKIN = DEFAULT_SKIN;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
