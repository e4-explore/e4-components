import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Avatar } from '../components/Avatar';
import { Row } from '../primitives/Stack';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Ethan Grove',
    size: 40,
  },
  argTypes: {
    name: { control: 'text' },
    size: { control: { type: 'range', min: 24, max: 96, step: 4 } },
    source: { control: false },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Row gap="md">
      <Avatar name="Ethan Grove" size={56} />
      <Avatar name="Wire Frame" />
      <Avatar size={40} />
      <Avatar name="Solo" size={32} />
    </Row>
  ),
};
