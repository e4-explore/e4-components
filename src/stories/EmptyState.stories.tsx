import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    glyph: '✎',
    title: 'Nothing here yet',
    description: 'This is the classic wireframe placeholder box. Add something to fill it in.',
  },
  argTypes: {
    glyph: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    action: { control: false },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <EmptyState {...args} action={<Button label="Add item" size="sm" />} />,
};
