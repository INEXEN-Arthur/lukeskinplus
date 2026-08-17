// lukeskinplus — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/lukeskinplus/client.js and executed
// through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with
// require() resolved against the shell's module table — the same shape the
// shipped ui-* packages' tsdown bundles emit.
//
// Storage: the skin id, glass/font preferences, transparency, and blur live in
// localStorage (tiny values). The wallpaper image itself is stored as a
// compressed JPEG Blob in IndexedDB (`dsh-skin-plus/files`), so there is NO
// 2MB / localStorage-quota limit — multi-megabyte photos are downscaled to at
// most 2560px and stored raw (no base64 overhead), which IndexedDB handles
// comfortably.
//
// v2.0.0 changes:
//  - "Glass" row: interface / dialog / border / composer transparency sliders.
//    The whole token layer (`--dsw-alias-bg-*`, `--dsw-alias-border-*`,
//    `--dsw-specific-input-major`) is re-shaded so the backdrop (plugin
//    wallpaper, and — with the transparent Electron window patch — the real
//    desktop wallpaper) shows through. Sliders work even without a wallpaper.
//  - "Fonts" row: global UI zoom (70–160%), separate thinking-text and
//    answer-text sizes (token + targeted CSS rules), and custom primary text
//    colors per color scheme.
//  - "Theme presets" row: one-click bundles of skin + glass + font settings.
//  - Hardcoded px font rules in the shipped module CSS (AssistantMarkdown,
//    ReasoningRow, MessageItem, TrajectoryTable) are matched dynamically by
//    discovering each module's hashed class names from its injected
//    <style data-plugin-css> tag, so the overrides survive app updates.
//  - In the Electron desktop app: window-drag region on the conversation
//    header (disabled while a modal overlay is open), and right padding so the
//    WCO caption buttons never cover the header controls.
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
		/** Default wallpaper transparency (0..1; 1 = image fully visible). */
		const DEFAULT_WALLPAPER_TRANSPARENCY = 0.65;
		/** Default wallpaper blur radius in px. */
		const DEFAULT_WALLPAPER_BLUR = 0;
		/** Source identity for the glass token override layer. */
		const OVERRIDE_SOURCE = "lukeskinplus:glass";
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

		// ---- v1.1.0: glass / font / preset preferences (all percentages or px) ----
		/** Interface surface transparency 0..100 (0 = opaque). */
		const GLASS_INTERFACE_KEY = "dsh-skin-plus:glass-interface";
		/** Dialog / popover transparency 0..100 (0 = opaque). */
		const GLASS_DIALOG_KEY = "dsh-skin-plus:glass-dialog";
		/** Border transparency 0..100 (0 = original borders). */
		const GLASS_BORDER_KEY = "dsh-skin-plus:glass-border";
		/** Composer (message input box) transparency 0..100 (0 = opaque). */
		const GLASS_COMPOSER_KEY = "dsh-skin-plus:glass-composer";
		/** Global UI font scale percent (70..160). */
		const FONT_SCALE_KEY = "dsh-skin-plus:font-scale";
		/** Answer text size in px (12..24). */
		const FONT_ANSWER_KEY = "dsh-skin-plus:font-answer";
		/** Thinking text size in px (11..20). */
		const FONT_THINKING_KEY = "dsh-skin-plus:font-thinking";
		/** Custom primary text color, light scheme ("#rrggbb" or null). */
		const TEXT_COLOR_LIGHT_KEY = "dsh-skin-plus:text-color-light";
		/** Custom primary text color, dark scheme ("#rrggbb" or null). */
		const TEXT_COLOR_DARK_KEY = "dsh-skin-plus:text-color-dark";
		/** Last applied theme preset id (for the picker highlight). */
		const PRESET_KEY = "dsh-skin-plus:preset";

		/** True inside the Electron desktop app (drives window-chrome CSS fixes). */
		const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);

		/** Default appearance state (glass / fonts / colors). */
		const DEFAULT_APPEARANCE = Object.freeze({
			preset: null,
			interfacePct: 0,
			dialogPct: 0,
			borderPct: 0,
			composerPct: 0,
			scalePct: 100,
			answerPx: 16,
			thinkingPx: 14,
			colorLight: null,
			colorDark: null
		});

		/** Tokens shaded by the interface transparency slider. */
		const INTERFACE_BG_TOKENS = [
			"--dsw-alias-bg-base",
			"--dsw-alias-bg-layer-1",
			"--dsw-alias-bg-layer-3",
			"--dsw-alias-bg-module-platform",
			"--dsw-specific-sidebar-fill",
			"--dsw-specific-menu"
		];
		/** Tokens shaded by the dialog transparency slider. */
		const DIALOG_BG_TOKENS = [
			"--dsw-alias-bg-layer-2",
			"--dsw-alias-bg-overlay",
			"--dsw-alias-toast-bg",
			"--dsw-alias-tooltip-bg",
			"--dsw-alias-border-inverted",
			"--dsw-alias-border-inverted2"
		];
		/** Tokens shaded by the border transparency slider. */
		const BORDER_TOKENS = [
			"--dsw-alias-border-l1",
			"--dsw-alias-border-l2",
			"--dsw-alias-border-l3",
			"--dsw-alias-border-l4"
		];
		/** Tokens shaded by the composer (message input box) transparency slider. */
		const COMPOSER_BG_TOKENS = [
			"--dsw-specific-input-major"
		];

		/**
		 * Concrete built-in token values per color scheme (the shipped
		 * design-platform.css palette). Used whenever the active theme does not
		 * override a token: skin tokens are only authoritative for the scheme
		 * the skin owns.
		 */
		const BUILTIN_TOKENS = {
			light: {
				"--dsw-alias-bg-base": "rgb(255, 255, 255)",
				"--dsw-alias-bg-layer-1": "rgb(255, 255, 255)",
				"--dsw-alias-bg-layer-2": "rgb(255, 255, 255)",
				"--dsw-alias-bg-layer-3": "rgb(255, 255, 255)",
				"--dsw-alias-bg-overlay": "rgb(233, 236, 242)",
				"--dsw-alias-bg-module-platform": "rgb(245, 246, 247)",
				"--dsw-specific-sidebar-fill": "rgb(249, 250, 251)",
				"--dsw-specific-menu": "rgb(255, 255, 255)",
				"--dsw-specific-input-major": "rgb(255, 255, 255)",
				"--dsw-alias-border-l1": "rgba(0, 0, 0, 0.04)",
				"--dsw-alias-border-l2": "rgba(0, 0, 0, 0.1)",
				"--dsw-alias-border-l3": "rgba(0, 0, 0, 0.12)",
				"--dsw-alias-border-l4": "rgba(0, 0, 0, 0.16)",
				"--dsw-alias-border-inverted": "rgba(0, 0, 0, 0)",
				"--dsw-alias-border-inverted2": "rgba(0, 0, 0, 0)",
				"--dsw-alias-label-primary": "rgb(15, 17, 21)",
				"--dsw-alias-label-secondary": "rgb(97, 102, 107)",
				"--dsw-alias-label-tertiary": "rgb(129, 133, 140)",
				"--dsw-alias-toast-bg": "rgb(53, 54, 56)",
				"--dsw-alias-tooltip-bg": "rgb(44, 44, 46)"
			},
			dark: {
				"--dsw-alias-bg-base": "rgb(21, 21, 23)",
				"--dsw-alias-bg-layer-1": "rgb(35, 35, 36)",
				"--dsw-alias-bg-layer-2": "rgb(44, 44, 46)",
				"--dsw-alias-bg-layer-3": "rgb(53, 54, 56)",
				"--dsw-alias-bg-overlay": "rgb(97, 102, 107)",
				"--dsw-alias-bg-module-platform": "rgb(53, 54, 56)",
				"--dsw-specific-sidebar-fill": "rgb(27, 27, 28)",
				"--dsw-specific-menu": "rgb(53, 54, 56)",
				"--dsw-specific-input-major": "rgb(44, 44, 46)",
				"--dsw-alias-border-l1": "rgba(255, 255, 255, 0.06)",
				"--dsw-alias-border-l2": "rgba(255, 255, 255, 0.12)",
				"--dsw-alias-border-l3": "rgba(255, 255, 255, 0.16)",
				"--dsw-alias-border-l4": "rgba(255, 255, 255, 0.2)",
				"--dsw-alias-border-inverted": "rgba(255, 255, 255, 0.06)",
				"--dsw-alias-border-inverted2": "rgba(255, 255, 255, 0.08)",
				"--dsw-alias-label-primary": "rgb(245, 246, 247)",
				"--dsw-alias-label-secondary": "rgb(207, 211, 214)",
				"--dsw-alias-label-tertiary": "rgb(173, 178, 184)",
				"--dsw-alias-toast-bg": "rgb(67, 69, 74)",
				"--dsw-alias-tooltip-bg": "rgb(67, 69, 74)"
			}
		};

		/**
		 * Markdown font token defaults (name, weight, style, size,
		 * line-height, family kind). The answer size multiplies the whole
		 * family so headings/tables/code stay proportional to body text.
		 */
		const MD_FONT_TOKENS = [
			["base", "400", "normal", 16, 28, "text"],
			["base-strong", "600", "normal", 16, 28, "text"],
			["base-italic", "400", "italic", 16, 28, "text"],
			["base-strong-italic", "600", "italic", 16, 28, "text"],
			["h1", "700", "normal", 24, 34, "text"],
			["h2", "700", "normal", 22, 32, "text"],
			["h3", "700", "normal", 20, 30, "text"],
			["h4", "600", "normal", 16, 28, "text"],
			["table", "400", "normal", 15, 25, "text"],
			["table-head", "500", "normal", 15, 25, "text"],
			["small", "400", "normal", 14, 24, "text"],
			["small-strong", "600", "normal", 14, 24, "text"],
			["small-italic", "400", "italic", 14, 24, "text"],
			["small-strong-italic", "600", "italic", 14, 24, "text"],
			["code", "400", "normal", 14, 22, "code"],
			["code-block", "400", "normal", 13, 22, "code"],
			["code-block-small", "400", "normal", 12, 18, "code"]
		];

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

		/**
		 * One-click theme presets: a skin id (null = keep current skin) plus
		 * the whole glass/font/color bundle. "clear" restores the default look.
		 */
		const PRESETS = [
			{
				id: "clear",
				skin: null,
				interfacePct: 0,
				dialogPct: 0,
				borderPct: 0,
				composerPct: 0,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
			},
			{
				id: "frost",
				skin: null,
				interfacePct: 30,
				dialogPct: 25,
				borderPct: 35,
				composerPct: 20,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
			},
			{
				id: "ocean-glass",
				skin: "ocean",
				interfacePct: 45,
				dialogPct: 40,
				borderPct: 50,
				composerPct: 35,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
			},
			{
				id: "midnight-glass",
				skin: "midnight",
				interfacePct: 45,
				dialogPct: 40,
				borderPct: 50,
				composerPct: 35,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
			},
			{
				id: "ultra",
				skin: "midnight",
				interfacePct: 70,
				dialogPct: 60,
				borderPct: 70,
				composerPct: 55,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
			},
			{
				id: "reading",
				skin: "paper",
				interfacePct: 10,
				dialogPct: 10,
				borderPct: 20,
				composerPct: 10,
				scalePct: 110,
				answerPx: 18,
				thinkingPx: 15,
				colorLight: null,
				colorDark: null
			},
			{
				id: "sakura-glass",
				skin: "sakura",
				interfacePct: 40,
				dialogPct: 35,
				borderPct: 45,
				composerPct: 30,
				scalePct: 100,
				answerPx: 16,
				thinkingPx: 14,
				colorLight: null,
				colorDark: null
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
			"background.hint": "图片显示在主内容区与侧边栏的半透明底上，消息等内层表面保持不透明以保证可读性。支持任意大小的图片（自动压缩保存，无 2MB 限制）",
			"glass.title": "界面玻璃",
			"glass.interface": "界面透明度",
			"glass.dialog": "对话框透明度",
			"glass.border": "边框透明度",
			"glass.composer": "输入框透明度",
			"glass.hint": "0% 为完全不透明。调高后背景（插件壁纸 / 桌面壁纸）会从界面、对话框、边框与消息输入框透出；桌面版需要已启用透明窗口补丁才能透出系统桌面。",
			"font.title": "字体",
			"font.scale": "全局字号",
			"font.answer": "回答字号",
			"font.thinking": "思考字号",
			"font.color": "文字颜色",
			"font.colorLight": "浅色模式",
			"font.colorDark": "深色模式",
			"font.colorDefault": "默认",
			"font.colorReset": "恢复默认",
			"font.hint": "全局字号按百分比缩放整个界面；回答字号作用于答案正文，思考字号作用于思考过程文字，二者互不影响。",
			"preset.title": "主题预设",
			"preset.hint": "一键套用一组皮肤 + 透明度 + 字体的组合配置。",
			"preset.clear": "默认清晰",
			"preset.clear.hint": "恢复默认外观",
			"preset.frost": "磨砂玻璃",
			"preset.frost.hint": "轻度磨砂，保留当前皮肤",
			"preset.ocean-glass": "深海玻璃",
			"preset.ocean-glass.hint": "深海蓝 + 中度透明",
			"preset.midnight-glass": "午夜玻璃",
			"preset.midnight-glass.hint": "纯黑 OLED + 中度透明",
			"preset.ultra": "极致透视",
			"preset.ultra.hint": "高透明度，桌面壁纸清晰可见",
			"preset.reading": "护眼大字",
			"preset.reading.hint": "纸感暖 + 大字号",
			"preset.sakura-glass": "樱粉玻璃",
			"preset.sakura-glass.hint": "樱花粉 + 中度透明"
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
			"background.hint": "The image shows through the translucent main canvas and sidebar; inner surfaces stay opaque for readability. Any image size is supported (auto-compressed, no 2MB limit).",
			"glass.title": "Glass",
			"glass.interface": "Interface",
			"glass.dialog": "Dialogs",
			"glass.border": "Borders",
			"glass.composer": "Composer",
			"glass.hint": "0% is fully opaque. Raise the sliders to let the backdrop (plugin wallpaper / desktop wallpaper) show through surfaces, dialogs, borders, and the composer input; the desktop app needs the transparent-window patch for the real desktop to show.",
			"font.title": "Fonts",
			"font.scale": "UI scale",
			"font.answer": "Answer size",
			"font.thinking": "Thinking size",
			"font.color": "Text color",
			"font.colorLight": "Light mode",
			"font.colorDark": "Dark mode",
			"font.colorDefault": "Default",
			"font.colorReset": "Reset",
			"font.hint": "UI scale resizes the whole interface in percent; answer size affects the assistant reply and thinking size affects the reasoning text, independently.",
			"preset.title": "Theme presets",
			"preset.hint": "Apply a bundle of skin + transparency + font settings in one click.",
			"preset.clear": "Clear",
			"preset.clear.hint": "Restore the default look",
			"preset.frost": "Frosted",
			"preset.frost.hint": "Light frost, keeps current skin",
			"preset.ocean-glass": "Ocean glass",
			"preset.ocean-glass.hint": "Deep-sea blue, medium transparency",
			"preset.midnight-glass": "Midnight glass",
			"preset.midnight-glass.hint": "Pure-black OLED, medium transparency",
			"preset.ultra": "Ultra",
			"preset.ultra.hint": "High transparency, desktop clearly visible",
			"preset.reading": "Reading",
			"preset.reading.hint": "Warm paper, larger fonts",
			"preset.sakura-glass": "Sakura glass",
			"preset.sakura-glass.hint": "Sakura pink, medium transparency"
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

		/** Read a clamped number preference (fallback when absent or invalid). */
		function readNumber(key, fallback, min, max) {
			const raw = readStorage(key);
			if (raw === null) return fallback;
			const value = Number(raw);
			return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
		}

		/** Read a "#rrggbb" color preference (null when absent or invalid). */
		function readColor(key) {
			const raw = readStorage(key);
			if (typeof raw !== "string") return null;
			return /^#[0-9a-f]{6}$/i.test(raw) ? raw.toLowerCase() : null;
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

		/** The whole glass/font/color appearance state, clamped from storage. */
		function readAppearance() {
			return {
				preset: readStorage(PRESET_KEY),
				interfacePct: readNumber(GLASS_INTERFACE_KEY, DEFAULT_APPEARANCE.interfacePct, 0, 100),
				dialogPct: readNumber(GLASS_DIALOG_KEY, DEFAULT_APPEARANCE.dialogPct, 0, 100),
				borderPct: readNumber(GLASS_BORDER_KEY, DEFAULT_APPEARANCE.borderPct, 0, 100),
				composerPct: readNumber(GLASS_COMPOSER_KEY, DEFAULT_APPEARANCE.composerPct, 0, 100),
				scalePct: readNumber(FONT_SCALE_KEY, DEFAULT_APPEARANCE.scalePct, 70, 160),
				answerPx: readNumber(FONT_ANSWER_KEY, DEFAULT_APPEARANCE.answerPx, 12, 24),
				thinkingPx: readNumber(FONT_THINKING_KEY, DEFAULT_APPEARANCE.thinkingPx, 11, 20),
				colorLight: readColor(TEXT_COLOR_LIGHT_KEY),
				colorDark: readColor(TEXT_COLOR_DARK_KEY)
			};
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

		//#region lukeskinplus: color math
		/** Parse a hex or rgb()/rgba() color into { r, g, b, a } (null when unparseable). */
		function parseColor(color) {
			const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
			if (hex !== null) {
				let digits = hex[1];
				if (digits.length === 3) digits = digits.split("").map((char) => char + char).join("");
				const n = parseInt(digits, 16);
				return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
			}
			const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(String(color).trim());
			if (rgb !== null) {
				return {
					r: Number(rgb[1]),
					g: Number(rgb[2]),
					b: Number(rgb[3]),
					a: rgb[4] === void 0 ? 1 : Number(rgb[4])
				};
			}
			return null;
		}

		/** The same color with its alpha replaced (original string when alpha ≈ 1 or unparseable). */
		function withAlpha(color, alpha) {
			if (alpha >= 0.999) return String(color);
			const parsed = parseColor(color);
			if (parsed === null) return String(color);
			return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Math.round(alpha * 1000) / 1000})`;
		}

		/** The same color with its alpha multiplied (original string when factor ≈ 1 or unparseable). */
		function scaleAlpha(color, factor) {
			if (factor >= 0.999) return String(color);
			const parsed = parseColor(color);
			if (parsed === null) return String(color);
			return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Math.round(parsed.a * factor * 1000) / 1000})`;
		}

		/**
		 * Resolve one token for one scheme: the active skin's value when it
		 * owns that scheme, otherwise the shipped built-in palette.
		 */
		function resolveToken(scheme, name, active) {
			if (active.colorScheme === scheme && typeof active.tokens[name] === "string") {
				return active.tokens[name];
			}
			return BUILTIN_TOKENS[scheme][name] ?? BUILTIN_TOKENS[scheme]["--dsw-alias-bg-base"];
		}
		//#endregion

		//#region lukeskinplus: font token scaling
		/** Round a px value to 2 decimals. */
		function round2(value) {
			return Math.round(value * 100) / 100;
		}

		/**
		 * Build the --dsw-font-markdown-* override table: every markdown token
		 * scaled by answerSize / 16 so the assistant reply (headings, tables,
		 * code included) tracks the answer-size slider. Both the shorthand token
		 * and its component sub-tokens are emitted. (The global UI scale is
		 * applied separately as a CSS zoom on <body>, since most of the shell
		 * typesets in hardcoded px.)
		 * @returns token-name → CSS value (same value for light and dark).
		 */
		function buildFontOverrides(answerPx) {
			const answerScale = Math.min(24, Math.max(12, answerPx)) / 16;
			const result = {};
			const emit = (name, weight, style, size, lineHeight, family) => {
				const familyValue = family === "code" ? "var(--ds-font-family-code)" : "var(--dsw-font-family)";
				const stylePrefix = style === "italic" ? "italic " : "";
				const sizePx = round2(size);
				const lineHeightPx = round2(lineHeight);
				const token = `--dsw-font-markdown-${name}`;
				result[token] = `${stylePrefix}${weight} ${sizePx}px/${lineHeightPx}px ${familyValue}`;
				result[`${token}-font-size`] = `${sizePx}px`;
				result[`${token}-line-height`] = `${lineHeightPx}px`;
				result[`${token}-font-weight`] = weight;
				result[`${token}-font-style`] = style;
			};
			for (const [name, weight, style, size, lineHeight, family] of MD_FONT_TOKENS) {
				emit(name, weight, style, size * answerScale, lineHeight * answerScale, family);
			}
			return result;
		}
		//#endregion

		//#region lukeskinplus: glass token layer + dynamic font CSS
		/** Disposer for the current glass token-override layer. */
		let glassDispose = null;
		/** Signature of the last applied token override (re-shade loop guard). */
		let lastGlassSignature = null;
		/** The injected <style> element carrying the hardcoded-px font fixes. */
		let cssEl = null;

		/**
		 * Stack the glass token override layer: interface / dialog / border
		 * alphas, the custom text color, and the whole scaled font token
		 * family. The layer exists permanently (at 0% and 100% scale it simply
		 * reproduces the defaults), so the wallpaper wash and the transparency
		 * sliders compose in one place. Re-calling with the same source
		 * replaces the whole layer (per the ThemeRuntime contract).
		 */
		function stackGlass(ctx) {
			const snapshot = ctx.theme.getTheme();
			const appearance = readAppearance();
			const hasWallpaper = currentWallpaperUrl !== null;
			const wash = hasWallpaper ? Math.min(1, Math.max(0, 1 - readWallpaperTransparency())) : 1;
			const interfaceAlpha = Math.min(1, Math.max(0, wash * (1 - appearance.interfacePct / 100)));
			const dialogAlpha = Math.min(1, Math.max(0, 1 - appearance.dialogPct / 100));
			const borderFactor = Math.min(1, Math.max(0, 1 - appearance.borderPct / 100));
			const overrides = {};
			const pair = (schemeFn) => ({ light: schemeFn("light"), dark: schemeFn("dark") });
			for (const name of INTERFACE_BG_TOKENS) {
				overrides[name] = pair((scheme) => withAlpha(resolveToken(scheme, name, snapshot.active), interfaceAlpha));
			}
			for (const name of DIALOG_BG_TOKENS) {
				overrides[name] = pair((scheme) => withAlpha(resolveToken(scheme, name, snapshot.active), dialogAlpha));
			}
			for (const name of BORDER_TOKENS) {
				overrides[name] = pair((scheme) => scaleAlpha(resolveToken(scheme, name, snapshot.active), borderFactor));
			}
			const composerAlpha = Math.min(1, Math.max(0, 1 - appearance.composerPct / 100));
			for (const name of COMPOSER_BG_TOKENS) {
				overrides[name] = pair((scheme) => withAlpha(resolveToken(scheme, name, snapshot.active), composerAlpha));
			}
			overrides["--dsw-alias-label-primary"] = pair((scheme) => {
				const custom = scheme === "light" ? appearance.colorLight : appearance.colorDark;
				return custom ?? resolveToken(scheme, "--dsw-alias-label-primary", snapshot.active);
			});
			const fonts = buildFontOverrides(appearance.answerPx);
			for (const [name, value] of Object.entries(fonts)) {
				overrides[name] = { light: value, dark: value };
			}
			const signature = JSON.stringify(overrides);
			if (signature === lastGlassSignature) return;
			lastGlassSignature = signature;
			glassDispose?.();
			glassDispose = ctx.theme.overrideTokens(OVERRIDE_SOURCE, overrides);
		}

		/**
		 * Discover a hashed CSS-module class name from the module's injected
		 * <style data-plugin-css="…/Module.module.css"> tag, so the override
		 * survives the hashes changing between app builds.
		 * @param moduleName - distinctive part of the CSS module path.
		 * @param localName - the exported local class name (e.g. "root").
		 * @returns the full hashed class name (e.g. "Sxvs8a_root") or null.
		 */
		function discoverHashedClass(moduleName, localName) {
			const tag = document.querySelector(`style[data-plugin-css*="${moduleName}"]`);
			if (tag === null) return null;
			const match = new RegExp(`\\.((?:[A-Za-z0-9_-]+)_${localName})(?=[,{:\\s.])`).exec(tag.textContent);
			return match === null ? null : match[1];
		}

		/**
		 * Build the CSS text for the hardcoded-px font rules the token system
		 * does not cover: assistant answer root, reasoning (thinking) rows,
		 * user bubbles, and the trajectory thinking quote.
		 */
		function buildFontCss(appearance) {
			const uiScale = Math.min(160, Math.max(70, appearance.scalePct)) / 100;
			const answerPx = appearance.answerPx;
			const thinkingPx = appearance.thinkingPx;
			const answerLineHeight = Math.round(answerPx * 1.75);
			const thinkingLineHeight = Math.round(thinkingPx * 1.7);
			const lines = [];
			// Global UI scale: most of the shell typesets in hardcoded px, so a
			// proportional zoom on <body> is the only way the slider visibly
			// resizes the whole interface (Chromium zoom, supported by the
			// Electron shell; in other browsers the slider simply has no effect).
			lines.push(`body{zoom:${round2(uiScale)}!important}`);
			const assistantRoot = discoverHashedClass("AssistantMarkdown.module.css", "root");
			if (assistantRoot !== null) {
				lines.push(`.${assistantRoot}{font-size:${answerPx}px!important;line-height:${answerLineHeight}px!important}`);
			}
			const thinkBody = discoverHashedClass("ReasoningRow.module.css", "thinkBody");
			if (thinkBody !== null) {
				lines.push(`.${thinkBody}{font-size:${thinkingPx}px!important;line-height:${thinkingLineHeight}px!important}`);
			}
			const thinkSummary = discoverHashedClass("ReasoningRow.module.css", "summary");
			if (thinkSummary !== null) {
				lines.push(`.${thinkSummary}{font-size:${thinkingPx}px!important;line-height:${thinkingLineHeight}px!important}`);
			}
			const thinkTitle = discoverHashedClass("ReasoningRow.module.css", "title");
			if (thinkTitle !== null) {
				lines.push(`.${thinkTitle}{font-size:${thinkingPx}px!important}`);
			}
			const thinkingQuote = discoverHashedClass("TrajectoryTable.module.css", "thinkingQuote");
			if (thinkingQuote !== null) {
				const quotePx = Math.max(11, round2(thinkingPx * 0.9));
				const quoteLineHeight = Math.round(quotePx * 1.6);
				lines.push(`.${thinkingQuote}{font-size:${quotePx}px!important;line-height:${quoteLineHeight}px!important}`);
				lines.push(`.${thinkingQuote} [class^="_markdown_"]{font-size:${quotePx}px!important;line-height:${quoteLineHeight}px!important}`);
			}
			return lines.join("");
		}

		/**
		 * Electron window-chrome fixes: with the transparent-window + WCO patch
		 * (titleBarStyle hidden + titleBarOverlay), the system draws the native
		 * caption buttons over the top-right corner of the page and the hidden
		 * title bar leaves no system drag area. Pad the conversation header when
		 * the details column is collapsed (its right edge then reaches the
		 * window corner) so header utilities are not covered by the buttons, and
		 * turn the header into the window drag region (interactive children stay
		 * clickable via no-drag).
		 */
		function buildChromeCss() {
			if (!IS_ELECTRON) return "";
			const lines = [];
			const frame = discoverHashedClass("AppFrame.module.css", "frame");
			const header = discoverHashedClass("ConversationRoot.module.css", "header");
			const settingsOverlay = discoverHashedClass("SettingsRoot.module.css", "overlay");
			if (frame !== null && header !== null) {
				lines.push(`.${frame}[data-details-collapsed] .${header}{padding-right:172px!important}`);
			}
			if (header !== null) {
				lines.push(`.${header}{-webkit-app-region:drag!important}`);
				lines.push(
					`.${header} button,.${header} a,.${header} [role="button"],.${header} [role="tab"],.${header} input,.${header} select,.${header} textarea{-webkit-app-region:no-drag!important}`
				);
				// Window-level drag regions swallow clicks for anything rendered
				// above them (full-window overlays included). While a modal
				// dialog/overlay is open, disable the header drag region so the
				// overlay's close button and mask stay clickable.
				lines.push(
					`body:has(.${settingsOverlay}) .${header},body:has([role="dialog"]) .${header}{-webkit-app-region:no-drag!important}`
				);
			}
			return lines.join("");
		}

		/** (Re)build the injected font-fix stylesheet. */
		function rebuildFontCss() {
			const el = ensureCssEl();
			el.textContent = buildFontCss(readAppearance()) + buildChromeCss();
		}

		/** Get-or-create the injected stylesheet. */
		function ensureCssEl() {
			if (cssEl === null || !document.head.contains(cssEl)) {
				cssEl = document.createElement("style");
				cssEl.id = "lukeskinplus-css";
				cssEl.dataset.lukeskinplus = "font-css";
				document.head.appendChild(cssEl);
			}
			return cssEl;
		}

		/** Remove the injected stylesheet. */
		function removeFontCss() {
			cssEl?.remove();
			cssEl = null;
		}

		/** Re-shade the token layer, rebuild the CSS fixes, and sync the row stores. */
		function applyGlass(ctx) {
			stackGlass(ctx);
			rebuildFontCss();
			syncAppearanceStores();
		}
		//#endregion

		//#region lukeskinplus: wallpaper layer
		/** The fixed backdrop layer (z-index -1), created lazily. */
		let wallpaperEl = null;
		/** Object URL of the currently applied wallpaper (or null). */
		let currentWallpaperUrl = null;

		/** Apply (or clear) the wallpaper layer, then re-shade the glass tokens. */
		function applyWallpaper(ctx) {
			const url = currentWallpaperUrl;
			if (url === null) {
				wallpaperEl?.remove();
				wallpaperEl = null;
				applyGlass(ctx);
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
			applyGlass(ctx);
		}

		/** Remove the wallpaper layer, glass overrides, stylesheet, and object URL (fiber unload). */
		function teardownWallpaper() {
			wallpaperEl?.remove();
			wallpaperEl = null;
			glassDispose?.();
			glassDispose = null;
			lastGlassSignature = null;
			removeFontCss();
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

		/** Appearance row store: the whole glass/font/color state (one shape, one store per row). */
		function createAppearanceStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({
					...DEFAULT_APPEARANCE,
					revision: -1
				}),
				actions: {
					sync: (d, state, revision) => {
						if (revision <= d.revision) return;
						Object.assign(d, state);
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
			sliderLabelWide: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "13px",
				whiteSpace: "nowrap",
				width: "92px"
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
			},
			colorRow: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				flexWrap: "wrap"
			},
			colorGroup: {
				display: "flex",
				alignItems: "center",
				gap: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "8px",
				padding: "4px 10px 4px 8px"
			},
			colorLabel: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "13px",
				whiteSpace: "nowrap"
			},
			colorInput: {
				width: "34px",
				height: "24px",
				padding: 0,
				border: "none",
				background: "transparent",
				cursor: "pointer"
			},
			colorDefaultBadge: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "11px",
				whiteSpace: "nowrap"
			},
			presetCard: {
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				gap: "2px",
				width: "132px",
				padding: "8px 10px",
				borderRadius: "10px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "transparent",
				cursor: "pointer",
				font: "inherit",
				textAlign: "left",
				boxSizing: "border-box"
			},
			presetCardSelected: {
				borderColor: "var(--dsw-alias-brand-primary)",
				background: "var(--dsw-alias-interactive-bg-hover)"
			},
			presetName: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "13px",
				lineHeight: "20px",
				whiteSpace: "nowrap"
			},
			presetDesc: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "11px",
				lineHeight: "16px"
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

		/** One labeled slider (reused by the wallpaper, glass, and font rows). */
		function Slider({ label, value, min, max, step, format, onChange, wideLabel }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.sliderRow,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						style: wideLabel ? styles.sliderLabelWide : styles.sliderLabel,
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

		/**
		 * Glass row: interface / dialog / border / composer transparency
		 * sliders. Works with the plugin wallpaper and — with the
		 * transparent-window patch — lets the real desktop wallpaper show
		 * through.
		 */
		function GlassRow({ t, setInterface, setDialog, setBorder, setComposer, useStore }) {
			const interfacePct = useStore((s) => s.interfacePct);
			const dialogPct = useStore((s) => s.dialogPct);
			const borderPct = useStore((s) => s.borderPct);
			const composerPct = useStore((s) => s.composerPct);
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("glass.title")
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("glass.interface"),
						value: interfacePct,
						min: 0,
						max: 100,
						step: 1,
						format: (v) => `${v}%`,
						onChange: setInterface,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("glass.dialog"),
						value: dialogPct,
						min: 0,
						max: 100,
						step: 1,
						format: (v) => `${v}%`,
						onChange: setDialog,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("glass.border"),
						value: borderPct,
						min: 0,
						max: 100,
						step: 1,
						format: (v) => `${v}%`,
						onChange: setBorder,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("glass.composer"),
						value: composerPct,
						min: 0,
						max: 100,
						step: 1,
						format: (v) => `${v}%`,
						onChange: setComposer,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.hint,
						children: t("glass.hint")
					})
				]
			});
		}

		/**
		 * Fonts row: global UI scale, thinking size, answer size, and custom
		 * primary text colors per color scheme.
		 */
		function FontRow({ t, setScale, setAnswer, setThinking, setTextColor, resetTextColors, useStore }) {
			const scalePct = useStore((s) => s.scalePct);
			const answerPx = useStore((s) => s.answerPx);
			const thinkingPx = useStore((s) => s.thinkingPx);
			const colorLight = useStore((s) => s.colorLight);
			const colorDark = useStore((s) => s.colorDark);
			const colorInput = (value) => value ?? "#9aa0a6";
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("font.title")
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("font.scale"),
						value: scalePct,
						min: 70,
						max: 160,
						step: 5,
						format: (v) => `${v}%`,
						onChange: setScale,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("font.thinking"),
						value: thinkingPx,
						min: 11,
						max: 20,
						step: 1,
						format: (v) => `${v}px`,
						onChange: setThinking,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsx)(Slider, {
						label: t("font.answer"),
						value: answerPx,
						min: 12,
						max: 24,
						step: 1,
						format: (v) => `${v}px`,
						onChange: setAnswer,
						wideLabel: true
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.colorRow,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								style: styles.sliderLabelWide,
								children: t("font.color")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								style: styles.colorGroup,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: styles.colorLabel,
										children: t("font.colorLight")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "color",
										value: colorInput(colorLight),
										style: styles.colorInput,
										onChange: (event) => setTextColor("light", event.target.value)
									}),
									colorLight === null ? (0, react_jsx_runtime.jsx)("span", {
										style: styles.colorDefaultBadge,
										children: t("font.colorDefault")
									}) : null
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								style: styles.colorGroup,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: styles.colorLabel,
										children: t("font.colorDark")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "color",
										value: colorInput(colorDark),
										style: styles.colorInput,
										onChange: (event) => setTextColor("dark", event.target.value)
									}),
									colorDark === null ? (0, react_jsx_runtime.jsx)("span", {
										style: styles.colorDefaultBadge,
										children: t("font.colorDefault")
									}) : null
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: resetTextColors,
								children: t("font.colorReset")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.hint,
						children: t("font.hint")
					})
				]
			});
		}

		/** Theme preset picker row: one card per bundled configuration. */
		function PresetRow({ t, applyPreset, useStore }) {
			const preset = useStore((s) => s.preset);
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("preset.title")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.grid,
						children: [
							PRESETS.map((presetDefinition) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => applyPreset(presetDefinition.id),
								"aria-pressed": preset === presetDefinition.id,
								style: {
									...styles.presetCard,
									...(preset === presetDefinition.id ? styles.presetCardSelected : {})
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: styles.presetName,
										children: t(`preset.${presetDefinition.id}`)
									}),
									(0, react_jsx_runtime.jsx)("span", {
										style: styles.presetDesc,
										children: t(`preset.${presetDefinition.id}.hint`)
									})
								]
							}, presetDefinition.id)),
							(0, react_jsx_runtime.jsx)("div", {
								style: styles.hint,
								children: t("preset.hint")
							})
						]
					})
				]
			});
		}
		//#endregion

		//#region lukeskinplus: client plugin body
		/**
		 * Required services: theme runtime (skins, switching, token override
		 * layers), slots/locale (the settings rows). Skin/glass/font/transparency/
		 * blur persist in localStorage; the wallpaper Blob persists in IndexedDB.
		 */
		const inject = [
			"slots",
			"locale",
			"theme"
		];

		/** Forward declaration resolved inside apply (broadcast on every re-shade). */
		let syncAppearanceStores = () => {};

		/**
		 * Client plugin body: register the curated skins into the theme runtime,
		 * restore the saved skin and wallpaper, keep the rows' stores in sync
		 * with theme/change, register the settings rows, and apply the glass /
		 * font layer.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			const disposers = SKINS.map((skinDefinition) => ctx.theme.register(skinDefinition));
			ctx.effect(() => () => {
				for (const dispose of disposers) dispose();
			}, "lukeskinplus: theme registration");

			// Restore the saved skin once (before any user interaction).
			const saved = readSavedSkin();
			const restoreSkin = () => {
				if (typeof saved === "string" && saved !== DEFAULT_SKIN && SKINS.some((skinDefinition) => skinDefinition.id === saved)) {
					const current = ctx.theme.getTheme().preference;
					if (current !== saved) ctx.theme.setTheme(saved);
				}
			};
			restoreSkin();
			// The host settings scope can adopt the built-in preference slightly
			// later and overwrite the restored skin (startup race); re-assert once.
			ctx.effect(() => {
				const timer = window.setTimeout(() => {
					try {
						restoreSkin();
					} catch {
						// disposed meanwhile — nothing to restore
					}
				}, 1500);
				return () => window.clearTimeout(timer);
			}, "lukeskinplus: skin restore re-assert");

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

			// Appearance (glass / fonts / colors) bookkeeping: one revision clock,
			// three row stores mirroring the same state shape.
			let appearanceRevision = 0;
			const glassRowStore = createAppearanceStore();
			const fontRowStore = createAppearanceStore();
			const presetRowStore = createAppearanceStore();
			let glassBound;
			let fontBound;
			let presetBound;
			syncAppearanceStores = () => {
				appearanceRevision += 1;
				const state = readAppearance();
				glassBound?.sync(state, appearanceRevision);
				fontBound?.sync(state, appearanceRevision);
				presetBound?.sync(state, appearanceRevision);
			};

			const skinStore = createSkinStore();
			let skinBound;
			const syncSkin = (snapshot) => {
				skinBound?.sync(snapshot.preference, snapshot.revision);
				// A skin/scheme switch changes the base colors; re-shade the glass.
				applyGlass(ctx);
			};
			ctx.on("theme/change", syncSkin);

			// The injected module-CSS <style> tags may not exist yet while this
			// bundle applies; retry the dynamic class discovery a few times.
			ctx.effect(() => {
				const timers = [
					window.setTimeout(() => { try { applyGlass(ctx); } catch {} }, 700),
					window.setTimeout(() => { try { applyGlass(ctx); } catch {} }, 2500)
				];
				return () => {
					for (const timer of timers) window.clearTimeout(timer);
				};
			}, "lukeskinplus: css class discovery retries");

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

			/** Shared appearance setter plumbing: persist, re-apply, re-sync. */
			const setAppearanceKey = (key, value) => {
				writeStorage(key, String(value));
				applyGlass(ctx);
			};

			const glassInjected = (actions) => {
				glassBound = actions;
				syncAppearanceStores();
				return {
					setInterface: (percent) => setAppearanceKey(GLASS_INTERFACE_KEY, Math.min(100, Math.max(0, percent))),
					setDialog: (percent) => setAppearanceKey(GLASS_DIALOG_KEY, Math.min(100, Math.max(0, percent))),
					setBorder: (percent) => setAppearanceKey(GLASS_BORDER_KEY, Math.min(100, Math.max(0, percent))),
					setComposer: (percent) => setAppearanceKey(GLASS_COMPOSER_KEY, Math.min(100, Math.max(0, percent)))
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "lukeskinplus-glass",
				order: 40,
				store: glassRowStore,
				locale: SETTINGS_NS,
				inject: glassInjected
			}, GlassRow));

			const fontInjected = (actions) => {
				fontBound = actions;
				syncAppearanceStores();
				return {
					setScale: (percent) => setAppearanceKey(FONT_SCALE_KEY, Math.min(160, Math.max(70, percent))),
					setAnswer: (px) => setAppearanceKey(FONT_ANSWER_KEY, Math.min(24, Math.max(12, px))),
					setThinking: (px) => setAppearanceKey(FONT_THINKING_KEY, Math.min(20, Math.max(11, px))),
					setTextColor: (scheme, color) => {
						const key = scheme === "light" ? TEXT_COLOR_LIGHT_KEY : TEXT_COLOR_DARK_KEY;
						writeStorage(key, /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null);
						applyGlass(ctx);
					},
					resetTextColors: () => {
						writeStorage(TEXT_COLOR_LIGHT_KEY, null);
						writeStorage(TEXT_COLOR_DARK_KEY, null);
						applyGlass(ctx);
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "lukeskinplus-font",
				order: 50,
				store: fontRowStore,
				locale: SETTINGS_NS,
				inject: fontInjected
			}, FontRow));

			const presetInjected = (actions) => {
				presetBound = actions;
				syncAppearanceStores();
				return {
					applyPreset: (id) => {
						const presetDefinition = PRESETS.find((candidate) => candidate.id === id);
						if (presetDefinition === void 0) return;
						if (presetDefinition.skin !== null) {
							ctx.theme.setTheme(presetDefinition.skin);
							writeSavedSkin(presetDefinition.skin);
						}
						writeStorage(GLASS_INTERFACE_KEY, String(presetDefinition.interfacePct));
						writeStorage(GLASS_DIALOG_KEY, String(presetDefinition.dialogPct));
						writeStorage(GLASS_BORDER_KEY, String(presetDefinition.borderPct));
						writeStorage(GLASS_COMPOSER_KEY, String(presetDefinition.composerPct));
						writeStorage(FONT_SCALE_KEY, String(presetDefinition.scalePct));
						writeStorage(FONT_ANSWER_KEY, String(presetDefinition.answerPx));
						writeStorage(FONT_THINKING_KEY, String(presetDefinition.thinkingPx));
						writeStorage(TEXT_COLOR_LIGHT_KEY, presetDefinition.colorLight);
						writeStorage(TEXT_COLOR_DARK_KEY, presetDefinition.colorDark);
						writeStorage(PRESET_KEY, id);
						applyGlass(ctx);
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "lukeskinplus-preset",
				order: 60,
				store: presetRowStore,
				locale: SETTINGS_NS,
				inject: presetInjected
			}, PresetRow));

			// Kick off the async wallpaper restore (after the slots are registered).
			restoreWallpaper();
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.SKINS = SKINS;
		exports.PRESETS = PRESETS;
		exports.DEFAULT_SKIN = DEFAULT_SKIN;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
