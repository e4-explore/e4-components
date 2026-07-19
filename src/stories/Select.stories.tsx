import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Select } from '../components/Select';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { Text } from '../primitives/Text';
import { Stack, Row } from '../primitives/Stack';

const options = [
  { value: 'golf', label: 'Golf ⛳' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'climbing', label: 'Climbing' },
  { value: 'cycling', label: 'Cycling' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    placeholder: 'Pick one…',
    invalid: false,
    disabled: false,
    options,
    value: null,
    onChange: () => {},
  },
  argTypes: {
    placeholder: { control: 'text' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof Select<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    return <Select {...args} options={options} value={value} onChange={setValue} />;
  },
};

export const InForm: Story = {
  render: () => {
    const [sport, setSport] = useState<string | null>(null);
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          The options panel floats above the content below it instead of pushing it down.
        </Text>
        <FormField label="Favorite sport">
          <Select value={sport} onChange={setSport} placeholder="Pick one…" options={options} />
        </FormField>
        <Row>
          <Button label="Content below" variant="secondary" />
          <Text color="inkMuted">…gets covered, not pushed</Text>
        </Row>
      </Stack>
    );
  },
};
