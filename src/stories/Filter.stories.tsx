import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Filter } from '../components/Filter';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

const options = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'flagged', label: 'Flagged', disabled: true },
];

const meta = {
  title: 'Components/Filter',
  component: Filter,
  args: {
    options,
    value: null,
    onChange: () => {},
    multiple: false,
  },
  argTypes: {
    multiple: { control: 'boolean' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof Filter<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [single, setSingle] = useState<string | null>('all');
    const [multi, setMulti] = useState<string[]>(['all']);
    return args.multiple ? (
      <Filter multiple options={options} value={multi} onChange={setMulti} />
    ) : (
      <Filter options={options} value={single} onChange={setSingle} />
    );
  },
};

export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('active');
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          One at a time — tap the active chip again to clear it.
        </Text>
        <Filter options={options} value={value} onChange={setValue} />
        <Text variant="caption" color="inkFaint">
          Selected: {value ?? '—'}
        </Text>
      </Stack>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(['active', 'draft']);
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Toggle any number of chips; each fill springs in.
        </Text>
        <Filter multiple options={options} value={values} onChange={setValues} />
        <Text variant="caption" color="inkFaint">
          Selected: {values.length ? values.join(', ') : '—'}
        </Text>
      </Stack>
    );
  },
};
