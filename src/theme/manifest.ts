import type { Theme } from './tokens';
import { manifestFonts } from './fonts';

const ink = '#141414';

/**
 * The manifest theme: ledger & barcode. Flat cream paper, hairline rules,
 * a dense monospace face, and uppercase tabular labels — reads like a
 * shipping manifest or ticket stub rather than an app.
 */
export const manifest: Theme = {
  name: 'manifest',
  dark: false,
  colors: {
    background: '#FAF9F4',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEDE5',
    ink,
    inkMuted: '#6B6B64',
    inkFaint: '#A8A79D',
    border: ink,
    borderStrong: ink,
    primary: ink,
    onPrimary: '#FAF9F4',
    accent: ink,
    success: '#2F6E4C',
    warning: '#8A6D2F',
    danger: '#8A2F2F',
    overlay: 'rgba(20, 20, 20, 0.4)',
    shadow: ink,
  },
  spacing: { none: 0, xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radii: { none: 0, sm: 0, md: 0, lg: 0, pill: 3 },
  borders: { thin: 1, regular: 1, thick: 1.5, sketchStyle: 'solid' },
  typography: {
    faces: manifestFonts,
    variants: {
      display: {
        fontSize: 28,
        lineHeight: 32,
        face: manifestFonts.bold,
        letterSpacing: -0.5,
        textTransform: 'uppercase',
      },
      title: {
        fontSize: 22,
        lineHeight: 26,
        face: manifestFonts.bold,
        letterSpacing: -0.3,
        textTransform: 'uppercase',
      },
      heading: {
        fontSize: 16,
        lineHeight: 20,
        face: manifestFonts.medium,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
      },
      body: { fontSize: 14, lineHeight: 20, face: manifestFonts.regular },
      label: {
        fontSize: 12,
        lineHeight: 16,
        face: manifestFonts.medium,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      },
      caption: {
        fontSize: 11,
        lineHeight: 14,
        face: manifestFonts.regular,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      },
    },
  },
  shadows: {
    // Flat paper — no cast shadow. Cards read as ruled sections, not tiles.
    card: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    lifted: {
      shadowColor: ink,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
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
      snappy: { damping: 28, stiffness: 460, mass: 0.6 },
      gentle: { damping: 28, stiffness: 240, mass: 0.9 },
      bouncy: { damping: 16, stiffness: 280, mass: 0.8 },
    },
    durations: { fast: 100, normal: 180, slow: 300 },
  },
};
