import React from 'react';
import type { Preview } from '@storybook/react-native-web-vite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, ToastProvider, Box, wireframe } from '../src';
import { brandTheme } from './brandTheme';

const themes = {
  wireframe,
  brand: brandTheme,
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
  },
  initialGlobals: {
    theme: 'wireframe',
  },
  decorators: [
    (Story, context) => {
      const theme = themes[(context.globals.theme as keyof typeof themes) ?? 'wireframe'];
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
