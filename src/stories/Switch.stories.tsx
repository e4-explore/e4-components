import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Switch } from '../components/Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Push notifications',
    value: true,
    disabled: false,
    onChange: () => {},
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { control: false },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Switch {...args} value={value} onChange={setValue} />;
  },
};
