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
}

/** Deep-partial of Theme, accepted by createTheme() for per-project overrides. */
export type ThemeOverride = {
  [K in keyof Theme]?: Theme[K] extends object
    ? { [K2 in keyof Theme[K]]?: Partial<Theme[K][K2]> | Theme[K][K2] }
    : Theme[K];
};
