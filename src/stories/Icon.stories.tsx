import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Icon, type IconName } from '../icons/Icon';
import { Box } from '../primitives/Box';
import { Row, Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

// The full set, in the order it's declared in the component.
const NAMES: IconName[] = [
  'chevronLeft',
  'chevronRight',
  'chevronDown',
  'check',
  'close',
  'grip',
  'home',
  'search',
  'chart',
  'smile',
  'edit',
];

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: {
    name: 'smile',
    size: 24,
    color: 'ink',
  },
  argTypes: {
    name: { control: 'select', options: NAMES },
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    color: {
      control: 'select',
      options: ['ink', 'inkMuted', 'inkFaint', 'primary', 'accent', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Every icon at a glance — each is drawn from plain Views (no SVG), so it
// renders identically everywhere and inherits the current theme's ink color.
export const Gallery: Story = {
  render: () => (
    <Row wrap gap="lg">
      {NAMES.map((name) => (
        <Stack key={name} gap="xs" align="center" style={{ width: 76 }}>
          <Box align="center" justify="center" style={{ width: 44, height: 44 }}>
            <Icon name={name} size={24} />
          </Box>
          <Text variant="caption" color="inkMuted">
            {name}
          </Text>
        </Stack>
      ))}
    </Row>
  ),
};

// The same glyph picks up any theme color token you hand it.
export const Colors: Story = {
  render: () => (
    <Row gap="lg">
      <Icon name="smile" size={32} color="ink" />
      <Icon name="check" size={32} color="success" />
      <Icon name="close" size={32} color="danger" />
      <Icon name="chart" size={32} color="primary" />
      <Icon name="search" size={32} color="accent" />
    </Row>
  ),
};
