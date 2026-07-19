import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Divider } from '../components/Divider';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    label: '',
    sketch: false,
  },
  argTypes: {
    label: { control: 'text' },
    sketch: { control: 'boolean' },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Divider {...args} label={args.label || undefined} />,
};

export const Variants: Story = {
  render: () => (
    <Stack gap="sm">
      <Divider />
      <Divider label="or" />
      <Divider label="sketchy" sketch />
    </Stack>
  ),
};
