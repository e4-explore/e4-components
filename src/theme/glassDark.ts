import { createTheme } from './createTheme';
import { glass } from './glass';

const ink = '#F5F5F7';

/**
 * "Glass Dark" — the glass theme's dark companion. Same translucent material
 * and system face, but the tint darkens and the specular highlight dims to a
 * faint rim, so panels read as smoked glass over a dark, colorful backdrop.
 */
export const glassDark = createTheme(
  {
    name: 'glass',
    dark: true,
    colors: {
      background: '#0A0A0C',
      surface: '#1C1C1E',
      surfaceAlt: '#2C2C2E',
      ink,
      inkMuted: '#AEAEB2',
      inkFaint: '#636366',
      // Apple's system separator (dark): brighter than the old 0.16 rim so
      // dividers and panel edges stay legible over dark frosted surfaces.
      border: 'rgba(84, 84, 88, 0.65)',
      borderStrong: ink,
      primary: '#0A84FF',
      onPrimary: '#FFFFFF',
      accent: '#0A84FF',
      success: '#30D158',
      warning: '#FF9F0A',
      danger: '#FF453A',
      overlay: 'rgba(0, 0, 0, 0.45)',
      shadow: '#000000',
    },
    shadows: {
      card: { shadowColor: '#000000', shadowOpacity: 0.5 },
      lifted: { shadowColor: '#000000', shadowOpacity: 0.6 },
    },
    material: {
      blur: { thin: 18, regular: 28, thick: 44 },
      tint: 'rgba(30, 30, 34, 0.55)',
      fallback: 'rgba(28, 28, 30, 0.96)',
      highlight: 'rgba(255, 255, 255, 0.18)',
      highlightWidth: 1,
      saturation: 1.5,
      nativeTint: 'dark',
    },
  },
  glass,
);
