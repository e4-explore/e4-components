import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Input, TextArea } from '../components/Input';
import { FormField } from '../components/FormField';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'you@example.com',
    invalid: false,
    editable: true,
  },
  argTypes: {
    placeholder: { control: 'text' },
    invalid: { control: 'boolean' },
    editable: { control: 'boolean' },
    left: { control: false },
    right: { control: false },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <Input {...args} value={value} onChangeText={setValue} autoCapitalize="none" />;
  },
};

export const WithFields: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const emailError =
      email.length > 0 && !email.includes('@') ? 'That doesn’t look like an email' : undefined;
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Focus lifts the field off the page. Errors push neighbors smoothly — no jumps.
        </Text>
        <FormField label="Email" error={emailError} hint="We never share it">
          <Input
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </FormField>
        <FormField label="Display name" optional>
          <Input placeholder="Wire Frame" left={<Text color="inkFaint">☺</Text>} />
        </FormField>
        <FormField label="Bio" optional>
          <TextArea placeholder="A few lines about you…" value={bio} onChangeText={setBio} />
        </FormField>
        <FormField label="Disabled">
          <Input placeholder="Read only" editable={false} />
        </FormField>
      </Stack>
    );
  },
};
