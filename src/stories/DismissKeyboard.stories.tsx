import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DismissKeyboard } from '../primitives/DismissKeyboard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Primitives/DismissKeyboard',
  component: DismissKeyboard,
} satisfies Meta<typeof DismissKeyboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wrap a screen so tapping the empty background blurs whatever input is focused
 * and dismisses the keyboard. On iOS this is the only thing that lets a user
 * "get out of" a field by tapping away — RN won't do it on its own.
 *
 * Note: the tap-to-dismiss is a native gesture; in this web preview, click a
 * field to focus it (the field lifts off the page) then click the empty area
 * around the card to blur it.
 */
export const Screen: Story = {
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
