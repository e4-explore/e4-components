import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Input, TextArea } from '../components/Input';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DismissKeyboard } from '../primitives/DismissKeyboard';
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

/**
 * Wrap a screen in `DismissKeyboard` so tapping the empty background blurs the
 * focused field and drops the keyboard. On iOS this is the only thing that lets
 * a user "get out of" a field by tapping away — RN won't do it on its own.
 *
 * Note: tap-to-dismiss is a native gesture with no web equivalent (there's no
 * software keyboard here). In this preview, click a field to focus it, then
 * click the empty area around the card to blur it.
 */
export const TapToDismiss: Story = {
  render: () => {
    const [name, setName] = useState('');
    const [team, setTeam] = useState('');
    return (
      <DismissKeyboard style={{ minHeight: 360, padding: 16 }}>
        <Stack gap="md">
          <Text variant="caption" color="inkMuted">
            Tap a field to focus it, then tap anywhere in the empty space to deselect.
          </Text>
          <Card>
            <Stack gap="sm">
              <Text variant="heading">Sign up</Text>
              <FormField label="Name">
                <Input placeholder="Wire Frame" value={name} onChangeText={setName} />
              </FormField>
              <FormField label="Team" optional>
                <Input placeholder="The Sketches" value={team} onChangeText={setTeam} />
              </FormField>
              <Button label="Continue" onPress={() => {}} />
            </Stack>
          </Card>
        </Stack>
      </DismissKeyboard>
    );
  },
};
