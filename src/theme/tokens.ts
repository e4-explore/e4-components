import type { TextStyle, ViewStyle } from 'react-native';

/** A resolved font face: family name plus (on web) a weight. */
export interface FontFace {
  fontFamily: string;
  fontWeight?: TextStyle['fontWeight'];
}

export interface SpringPreset {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface ThemeColors {
  /** App background (the "paper"). */
  background: string;
  /** Card / sheet surfaces. */
  surface: string;
  /** Slightly recessed surface (inputs, table headers, skeletons). */
  surfaceAlt: string;
  /** Primary text & line work. */
  ink: string;
  /** Secondary text. */
  inkMuted: string;
  /** Placeholder / disabled text. */
  inkFaint: string;
  /** Default border color. */
  border: string;
  /** Emphasized border (focused inputs, active elements). */
  borderStrong: string;
  /** Primary action fill. */
  primary: string;
  /** Text/icon color on primary. */
  onPrimary: string;
  /** Secondary highlight (selection, links, active tabs). */
  accent: string;
  success: string;
  warning: string;
  danger: string;
  /** Scrim behind sheets. */
  overlay: string;
  /** Hard offset-shadow color. */
  shadow: string;
}

export interface ThemeSpacing {
  none: number;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  none: number;
  sm: number;
  md: number;
  lg: number;
  pill: number;
}

export interface ThemeBorders {
  /** Hairline decorative borders. */
  thin: number;
  /** Default component border. */
  regular: number;
  /** Emphasis border (focus, selection). */
  thick: number;
  /** Border style used for "placeholder" elements (image stubs, drop zones). */
  sketchStyle: 'dashed' | 'dotted' | 'solid';
}

export type TextVariantName =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'caption';

export interface TextVariant {
  fontSize: number;
  lineHeight: number;
  face: FontFace;
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
}

export interface ThemeTypography {
  faces: {
    regular: FontFace;
    medium: FontFace;
    bold: FontFace;
  };
  variants: Record<TextVariantName, TextVariant>;
}

export interface ThemeShadows {
  /** Resting cards. */
  card: ViewStyle;
  /** Lifted elements: dragged rows, open sheets. */
  lifted: ViewStyle;
  none: ViewStyle;
}

export interface ThemeMotion {
  springs: {
    /** Press feedback, toggles — fast, no overshoot to speak of. */
    snappy: SpringPreset;
    /** Layout settling — calm, decisive. */
    gentle: SpringPreset;
    /** Playful entries (toasts, badges) — visible overshoot. */
    bouncy: SpringPreset;
  };
  durations: {
    fast: number;
    normal: number;
    slow: number;
  };
}

/**
 * "Glass" material recipe — the extra ingredients a translucent, Apple-style
 * theme needs that flat tokens can't express. **Optional**: themes without a
 * `material` block render as ordinary opaque surfaces, so adding this is
 * non-breaking for every existing theme.
 *
 * Consumed by `<GlassSurface>` (and the components that opt into it): the
 * backdrop is blurred, the `tint` is painted over it, `saturation` makes the
 * colors behind pop, and a hairline `highlight` reads as a specular edge.
 * When real blur is unavailable — old browsers, native without expo-blur, or
 * the user's Reduce Transparency setting — the opaque `fallback` fill is used
 * instead, so text stays legible.
 */
export interface ThemeMaterial {
  /** Backdrop blur radius (px on web / dp on native) per surface weight. */
  blur: {
    thin: number;
    regular: number;
    thick: number;
  };
  /** Translucent tint painted over the blurred backdrop. */
  tint: string;
  /**
   * Opaque-ish fill used when blur can't render (Reduce Transparency, old
   * browsers, native without expo-blur). Must pass text-contrast on its own.
   */
  fallback: string;
  /** Bright specular edge highlight (low-alpha rgba). */
  highlight: string;
  /** Width of the specular highlight border. */
  highlightWidth: number;
  /** Backdrop saturation multiplier (web `saturate()`), makes hues behind pop. */
  saturation: number;
  /** `tint` prop passed to expo-blur's BlurView on native. */
  nativeTint: 'light' | 'dark' | 'default';
}

export interface Theme {
  /** Name shown in tooling; also lets components branch on dark vs light if needed. */
  name: string;
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  borders: ThemeBorders;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  motion: ThemeMotion;
  /**
   * Translucent "glass" material recipe. Present only on glass-style themes;
   * when absent, glass-aware components render as ordinary opaque surfaces.
   */
  material?: ThemeMaterial;
}

/** Deep-partial of Theme, accepted by createTheme() for per-project overrides. */
export type ThemeOverride = {
  [K in keyof Theme]?: Theme[K] extends object
    ? { [K2 in keyof Theme[K]]?: Partial<Theme[K][K2]> | Theme[K][K2] }
    : Theme[K];
};
