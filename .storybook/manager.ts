import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const e4Theme = create({
  base: 'light',
  brandTitle: 'E4 Explorebook',
  brandUrl: 'https://github.com/ethanphilipgrove-dot',
  brandImage: 'e4-logo.svg',
  brandTarget: '_blank',

  colorPrimary: '#2A2A33',
  colorSecondary: '#4B7BFF',

  appBg: '#FAFAF7',
  appContentBg: '#FAFAF7',
  appPreviewBg: '#FAFAF7',
  appBorderColor: '#2A2A33',
  appBorderRadius: 12,

  fontBase: "'Shantell Sans', 'Comic Sans MS', cursive",
  fontCode: "'Menlo', 'Consolas', monospace",

  textColor: '#2A2A33',
  textMutedColor: '#6E6E78',
  barBg: '#FAFAF7',
  barTextColor: '#6E6E78',
  barSelectedColor: '#2A2A33',
  barHoverColor: '#4B7BFF',

  inputBg: '#FFFFFF',
  inputBorder: '#2A2A33',
  inputTextColor: '#2A2A33',
  inputBorderRadius: 8,
});

addons.setConfig({
  theme: e4Theme,
});
