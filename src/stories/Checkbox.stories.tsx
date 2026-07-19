import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Checkbox } from '../components/Checkbox';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Email me updates',
    checked: true,
    disabled: false,
    onChange: () => {},
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { control: false },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};

export const Group: Story = {
  render: () => {
    const [checks, setChecks] = useState({ a: true, b: false });
    return (
      <Stack gap="sm">
        <Checkbox
          checked={checks.a}
          onChange={(a) => setChecks((c) => ({ ...c, a }))}
          label="Email me updates"
        />
        <Checkbox
          checked={checks.b}
          onChange={(b) => setChecks((c) => ({ ...c, b }))}
          label="Enable beta features"
        />
      </Stack>
    );
  },
};
