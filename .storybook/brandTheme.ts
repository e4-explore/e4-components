import { createTheme, systemFonts } from '../src';

/**
 * Example of what a real project does: override tokens, keep every component.
 * This is the whole "rebrand" — one object.
 */
export const brandTheme = createTheme({
  name: 'demo-brand',
  colors: {
    background: '#F6F8FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF1F7',
    ink: '#101828',
    inkMuted: '#475467',
    inkFaint: '#98A2B3',
    border: '#D0D5DD',
    borderStrong: '#101828',
    primary: '#155EEF',
    onPrimary: '#FFFFFF',
    accent: '#155EEF',
    overlay: 'rgba(16, 24, 40, 0.45)',
    shadow: 'rgba(16, 24, 40, 0.12)',
  },
  radii: { none: 0, sm: 6, md: 10, lg: 16, pill: 999 },
  borders: { thin: 1, regular: 1, thick: 2, sketchStyle: 'solid' },
  typography: {
    faces: systemFonts,
    variants: {
      display: { fontSize: 32, lineHeight: 38, face: systemFonts.bold },
      title: { fontSize: 24, lineHeight: 30, face: systemFonts.bold },
      heading: { fontSize: 18, lineHeight: 24, face: systemFonts.bold },
      body: { fontSize: 16, lineHeight: 23, face: systemFonts.regular },
      label: { fontSize: 14, lineHeight: 19, face: systemFonts.medium },
      caption: { fontSize: 12, lineHeight: 16, face: systemFonts.medium, letterSpacing: 0.4 },
    },
  },
  shadows: {
    card: {
      shadowColor: 'rgba(16, 24, 40, 0.5)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 3,
    },
    lifted: {
      shadowColor: 'rgba(16, 24, 40, 0.6)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 10,
    },
  },
});

/** Dark companion for the branded demo theme, showing the same brand tokens flipped to a dark surface. */
export const brandThemeDark = createTheme(
  {
    name: 'demo-brand-dark',
    dark: true,
    colors: {
      background: '#0B1220',
      surface: '#121B2E',
      surfaceAlt: '#1B2740',
      ink: '#EAF0FF',
      inkMuted: '#93A2C0',
      inkFaint: '#546080',
      border: '#2A3652',
      borderStrong: '#EAF0FF',
      primary: '#4C8DFF',
      onPrimary: '#08101F',
      accent: '#6FA4FF',
      overlay: 'rgba(3, 7, 18, 0.6)',
      shadow: 'rgba(0, 0, 0, 0.6)',
    },
  },
  brandTheme,
);
