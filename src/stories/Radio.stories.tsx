import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RadioGroup } from '../components/Radio';

const options = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team', disabled: true },
];

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    value: 'pro',
    options,
    onChange: () => {},
  },
  argTypes: {
    value: { control: 'inline-radio', options: ['free', 'pro', 'team'] },
    options: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof RadioGroup<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(args.value);
    return <RadioGroup options={options} value={value} onChange={setValue} />;
  },
};
