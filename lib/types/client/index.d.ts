/**
 * lukeskinplus client half types: curated skins, glass/font/preset settings
 * rows, and the client plugin body.
 */
import type { Context } from "@deepseek-ai/cordis";
import type { ThemeDefinition } from "@deepseek-ai/dsh-client-ui-theme/client";
/** One selectable skin (a registered third-party theme). */
export declare const SKINS: readonly ThemeDefinition[];
/** One one-click theme preset (skin + glass + font bundle). */
export declare const PRESETS: readonly {
  id: string;
  skin: string | null;
  interfacePct: number;
  dialogPct: number;
  borderPct: number;
  scalePct: number;
  answerPx: number;
  thinkingPx: number;
  colorLight: string | null;
  colorDark: string | null;
}[];
/** The settings row's locale namespace. */
export declare const SETTINGS_NS: "settings.lukeskinplus";
/** Sentinel meaning "no custom skin". */
export declare const DEFAULT_SKIN: "system";
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/** Client plugin body: register skins, restore saved settings, mount the rows. */
export declare function apply(ctx: Context): void;
