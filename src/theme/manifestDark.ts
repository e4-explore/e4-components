import { createTheme } from './createTheme';
import { manifest } from './manifest';

const paper = '#F2F1EA';

/**
 * "Negative" — the manifest theme's dark companion. Same ledger face and
 * flat hairline rules, but ink and paper invert: pale type on a near-black
 * ground, like a photographic negative of the printed ticket.
 */
export const manifestDark = createTheme(
  {
    name: 'manifest',
    dark: true,
    colors: {
      background: '#141414',
      surface: '#1B1B1A',
      surfaceAlt: '#232320',
      ink: paper,
      inkMuted: '#A6A59C',
      inkFaint: '#5C5C57',
      border: paper,
      borderStrong: paper,
      primary: paper,
      onPrimary: '#141414',
      accent: paper,
      success: '#5FB889',
      warning: '#D9B15C',
      danger: '#D97A7A',
      overlay: 'rgba(0, 0, 0, 0.55)',
      shadow: paper,
    },
    shadows: {
      lifted: { shadowColor: paper },
    },
  },
  manifest,
);
