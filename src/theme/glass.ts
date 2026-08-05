import type { Theme } from './tokens';
import { systemFonts } from './fonts';

// Apple's "label" ink and system accent (light). The face is the system stack,
// which resolves to SF Pro for free on Apple platforms — the authentic Liquid
// Glass typography where it matters, and a clean sans everywhere else.
const ink = '#1C1C1E';

/**
 * "Glass" — an Apple Liquid Glass–inspired theme. Translucent surfaces that
 * blur and saturate whatever sits behind them, a bright specular edge, soft
 * ambient shadows, generous concentric corners, and the system (SF Pro) face.
 *
 * The translucency lives in `material`, not in `colors.surface`: plain
 * components stay opaque and legible, while glass-aware ones (Card, Modal,
 * BottomSheet, TabBar, Header) render through `<GlassSurface>`. Glass needs
 * something behind it to refract — put a photo or gradient behind your app.
 */
export const glass: Theme = {
  name: 'glass',
  dark: false,
  colors: {
    background: '#E7ECF3',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF1F6',
    ink,
    inkMuted: '#6C6C70',
    inkFaint: '#AEAEB2',
    // Apple's system separator (light): a translucent gray that stays visible
    // over frosted surfaces without turning into a hard line.
    border: 'rgba(60, 60, 67, 0.29)',
    borderStrong: ink,
    primary: '#007AFF',
    onPrimary: '#FFFFFF',
    accent: '#007AFF',
    success: '#34C759',
    warning: '#FF9F0A',
    danger: '#FF3B30',
    overlay: 'rgba(0, 0, 0, 0.22)',
    shadow: '#000000',
  },
  spacing: { none: 0, xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  // Large, continuous corners — the concentric Apple look.
  radii: { none: 0, sm: 8, md: 12, lg: 20, pill: 999 },
  // Hairline edges throughout.
  borders: { thin: 0.5, regular: 1, thick: 1.5, sketchStyle: 'solid' },
  typography: {
    faces: systemFonts,
    variants: {
      display: { fontSize: 34, lineHeight: 40, face: systemFonts.bold, letterSpacing: 0.2 },
      title: { fontSize: 28, lineHeight: 34, face: systemFonts.bold, letterSpacing: 0.2 },
      heading: { fontSize: 20, lineHeight: 25, face: systemFonts.bold },
      body: { fontSize: 17, lineHeight: 24, face: systemFonts.regular },
      label: { fontSize: 15, lineHeight: 20, face: systemFonts.medium },
      caption: { fontSize: 13, lineHeight: 17, face: systemFonts.medium },
    },
  },
  shadows: {
    // Soft ambient shadows — glass floats, it doesn't stamp a hard offset.
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    lifted: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 36,
      elevation: 14,
    },
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  motion: {
    // Fluid, lightly overshooting — glass settles like a liquid.
    springs: {
      snappy: { damping: 24, stiffness: 380, mass: 0.7 },
      gentle: { damping: 22, stiffness: 200, mass: 1 },
      bouncy: { damping: 13, stiffness: 240, mass: 0.9 },
    },
    durations: { fast: 120, normal: 240, slow: 400 },
  },
  material: {
    blur: { thin: 18, regular: 28, thick: 44 },
    tint: 'rgba(255, 255, 255, 0.55)',
    fallback: 'rgba(248, 250, 253, 0.96)',
    highlight: 'rgba(255, 255, 255, 0.7)',
    highlightWidth: 1,
    saturation: 1.7,
    nativeTint: 'light',
  },
};
