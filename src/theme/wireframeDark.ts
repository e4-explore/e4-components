import { createTheme } from './createTheme';
import { wireframe } from './wireframe';

const chalk = '#F2F2ED';

/**
 * "Chalkboard" — the wireframe theme's dark companion. Same hand-drawn face
 * and hard offset shadows, but ink and paper swap: chalk-white lines on a
 * near-black board, so the shadow reads as a soft chalk-dust glow instead
 * of a cast shadow.
 */
export const wireframeDark = createTheme(
  {
    name: 'wireframe',
    dark: true,
    colors: {
      background: '#17171B',
      surface: '#1F2024',
      surfaceAlt: '#26272C',
      ink: chalk,
      inkMuted: '#B7B7C0',
      inkFaint: '#63636C',
      border: chalk,
      borderStrong: chalk,
      primary: '#5C8AFF',
      onPrimary: '#10121A',
      accent: '#7FA3FF',
      success: '#3ED98A',
      warning: '#F5B94D',
      danger: '#FF7A7E',
      overlay: 'rgba(0, 0, 0, 0.55)',
      shadow: chalk,
    },
    shadows: {
      card: { shadowColor: chalk },
      lifted: { shadowColor: chalk },
    },
  },
  wireframe,
);
