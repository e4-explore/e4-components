import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';

const meta = {
  title: 'Components/FormField',
  component: FormField,
  args: {
    label: 'Email',
    optional: false,
    hint: 'We never share it',
    error: '',
    children: null,
  },
  argTypes: {
    label: { control: 'text' },
    optional: { control: 'boolean' },
    hint: { control: 'text' },
    error: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <FormField {...args} hint={args.hint || undefined} error={args.error || undefined}>
        <Input placeholder="you@example.com" value={value} onChangeText={setValue} autoCapitalize="none" />
      </FormField>
    );
  },
};
