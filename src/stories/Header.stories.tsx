import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Stack } from '../primitives/Stack';
import { useToast } from '../components/Toast';

const meta = {
  title: 'Components/Header',
  component: Header,
  args: {
    title: 'Home',
  },
  argTypes: {
    title: { control: 'text' },
    onBack: { control: false },
    left: { control: false },
    right: { control: false },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Header {...args} right={<Badge label="beta" tone="accent" />} />,
};

export const Variants: Story = {
  render: () => {
    const toast = useToast();
    return (
      <Stack gap="lg">
        <Header title="Home" right={<Badge label="beta" tone="accent" />} />
        <Header title="Detail screen" onBack={() => toast.show('Back!')} />
      </Stack>
    );
  },
};
