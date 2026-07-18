import React from 'react';
import type { Preview } from '@storybook/react-native-web-vite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, ToastProvider, Box, wireframe, wireframeDark } from '../src';
import { brandTheme, brandThemeDark } from './brandTheme';

const themesByMode = {
  wireframe: { light: wireframe, dark: wireframeDark },
  brand: { light: brandTheme, dark: brandThemeDark },
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'wireframe', title: '✏️ Wireframe' },
          { value: 'brand', title: '🎨 Branded demo' },
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
          { value: 'light', title: '☀️ Light' },
          { value: 'dark', title: '🌙 Dark' },
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
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <Box
                bg="background"
                p="lg"
                style={{ minHeight: '100vh' as never }}
              >
                <Box style={{ maxWidth: 480, width: '100%' as never }}>
                  <Story />
                </Box>
              </Box>
            </ToastProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
};

export default preview;
