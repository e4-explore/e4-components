import React from 'react';
import type { Preview } from '@storybook/react-native-web-vite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ThemeProvider,
  ToastProvider,
  OverlayHost,
  Box,
  wireframe,
  wireframeDark,
  manifest,
  manifestDark,
  glass,
  glassDark,
} from '../src';
import { brandTheme, brandThemeDark } from './brandTheme';

const themesByMode = {
  manifest: { light: manifest, dark: manifestDark },
  wireframe: { light: wireframe, dark: wireframeDark },
  brand: { light: brandTheme, dark: brandThemeDark },
  glass: { light: glass, dark: glassDark },
};

// Glass has nothing to refract over a flat page, so the catalog paints a
// colorful backdrop behind it — a raw DOM gradient (Storybook renders to the
// DOM) so the blur has real hues to bend.
const GLASS_BACKDROP: Record<'light' | 'dark', string> = {
  light:
    'radial-gradient(120% 90% at 12% 8%, #ffd9a8 0%, rgba(255,217,168,0) 45%),' +
    'radial-gradient(120% 90% at 88% 12%, #a8d5ff 0%, rgba(168,213,255,0) 42%),' +
    'radial-gradient(130% 100% at 70% 95%, #d9b8ff 0%, rgba(217,184,255,0) 46%),' +
    'linear-gradient(135deg, #eef2f8 0%, #dfe7f2 100%)',
  dark:
    'radial-gradient(120% 90% at 10% 6%, #3a2a5e 0%, rgba(58,42,94,0) 45%),' +
    'radial-gradient(120% 90% at 90% 14%, #0f3b5e 0%, rgba(15,59,94,0) 44%),' +
    'radial-gradient(130% 100% at 72% 96%, #5e1f3a 0%, rgba(94,31,58,0) 48%),' +
    'linear-gradient(135deg, #0b0b12 0%, #14141f 100%)',
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design theme',
      toolbar: {
        // Wireframe is the baseline, so it isn't a listed item: with nothing
        // matched the button falls back to this static "Apply theme" title.
        // Picking a theme swaps in its name; the reset item clears back to
        // wireframe (reset sets the global to undefined, which the decorator
        // already treats as wireframe).
        title: 'Apply theme',
        icon: 'paintbrush',
        items: [
          { value: 'manifest', title: 'Ledger' },
          { value: 'brand', title: 'Polished' },
          { value: 'glass', title: 'Glass' },
          { type: 'reset', title: 'Clear theme' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color scheme',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'wireframe',
    mode: 'light',
  },
  decorators: [
    (Story, context) => {
      const themeKey = (context.globals.theme as keyof typeof themesByMode) ?? 'wireframe';
      const modeKey = (context.globals.mode as 'light' | 'dark') ?? 'light';
      const theme = themesByMode[themeKey][modeKey];
      const isGlass = themeKey === 'glass';
      // `fullBleed` stories (e.g. the Create-app form shown inside a modal
      // iframe) fill the available width instead of the catalog's 480px column.
      const fullBleed = context.parameters.fullBleed === true;
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <OverlayHost>
                <Box
                  bg={isGlass ? undefined : 'background'}
                  p="lg"
                  style={{
                    minHeight: '100vh' as never,
                    ...(isGlass
                      ? ({ backgroundImage: GLASS_BACKDROP[modeKey] } as never)
                      : null),
                  }}
                >
                  {fullBleed ? (
                    <Story />
                  ) : (
                    <Box style={{ maxWidth: 480, width: '100%' as never }}>
                      <Story />
                    </Box>
                  )}
                </Box>
              </OverlayHost>
            </ToastProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    options: {
      // Fixed sidebar order: intro → building blocks → composed patterns →
      // multi-screen journeys → the full-app demo last.
      storySort: {
        order: [
          'Welcome',
          'Create app',
          'Components',
          'Templates',
          'Flows',
          'Examples',
        ],
      },
    },
  },
};

export default preview;
