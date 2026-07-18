import type { Theme } from './tokens';
import { wireframeFonts } from './fonts';

const ink = '#2A2A33';

/**
 * The default E4 theme: intentional wireframe. Grayscale "paper & ink",
 * hard offset shadows like a marker sketch, and a playful hand-drawn face.
 * Every other theme is a createTheme() override of this one.
 */
export const wireframe: Theme = {
  name: 'wireframe',
  dark: false,
  colors: {
    background: '#FAFAF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F1EC',
    ink,
    inkMuted: '#6E6E78',
    inkFaint: '#B3B3BC',
    border: ink,
    borderStrong: ink,
    primary: ink,
    onPrimary: '#FAFAF7',
    accent: '#4B7BFF',
    success: '#2F9E63',
    warning: '#E8A13C',
    danger: '#E5484D',
    overlay: 'rgba(42, 42, 51, 0.35)',
    shadow: ink,
  },
  spacing: { none: 0, xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radii: { none: 0, sm: 4, md: 8, lg: 14, pill: 999 },
  borders: { thin: 1, regular: 1.5, thick: 2.5, sketchStyle: 'dashed' },
  typography: {
    faces: wireframeFonts,
    variants: {
      display: { fontSize: 32, lineHeight: 38, face: wireframeFonts.bold },
      title: { fontSize: 24, lineHeight: 30, face: wireframeFonts.bold },
      heading: { fontSize: 18, lineHeight: 24, face: wireframeFonts.bold },
      body: { fontSize: 16, lineHeight: 23, face: wireframeFonts.regular },
      label: { fontSize: 14, lineHeight: 19, face: wireframeFonts.medium },
      caption: {
        fontSize: 12,
        lineHeight: 16,
        face: wireframeFonts.medium,
        letterSpacing: 0.4,
      },
    },
  },
  shadows: {
    // Hard offset shadow, zero blur — reads as marker-drawn, not "material".
    card: {
      shadowColor: ink,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    lifted: {
      shadowColor: ink,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
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
    springs: {
      snappy: { damping: 26, stiffness: 420, mass: 0.7 },
      gentle: { damping: 26, stiffness: 220, mass: 1 },
      bouncy: { damping: 14, stiffness: 260, mass: 0.9 },
    },
    durations: { fast: 120, normal: 220, slow: 360 },
  },
};
