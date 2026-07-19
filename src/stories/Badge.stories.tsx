import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Badge } from '../components/Badge';
import { Row } from '../primitives/Stack';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    label: 'Badge',
    tone: 'neutral',
    solid: false,
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: ['neutral', 'accent', 'success', 'warning', 'danger'] },
    solid: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Row wrap gap="sm">
      <Badge label="Neutral" />
      <Badge label="Accent" tone="accent" />
      <Badge label="Success" tone="success" />
      <Badge label="Warning" tone="warning" />
      <Badge label="Danger" tone="danger" />
      <Badge label="Solid" tone="accent" solid />
    </Row>
  ),
};
