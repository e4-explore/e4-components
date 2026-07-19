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
} from '../src';
import { brandTheme, brandThemeDark } from './brandTheme';

const themesByMode = {
  manifest: { light: manifest, dark: manifestDark },
  wireframe: { light: wireframe, dark: wireframeDark },
  brand: { light: brandTheme, dark: brandThemeDark },
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
      // `fullBleed` stories (e.g. the Create-app form shown inside a modal
      // iframe) fill the available width instead of the catalog's 480px column.
      const fullBleed = context.parameters.fullBleed === true;
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <OverlayHost>
                <Box
                  bg="background"
                  p="lg"
                  style={{ minHeight: '100vh' as never }}
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
