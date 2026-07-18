import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Input, TextArea } from '../components/Input';
import { FormField } from '../components/FormField';
import { Checkbox } from '../components/Checkbox';
import { RadioGroup } from '../components/Radio';
import { Switch } from '../components/Switch';
import { Select } from '../components/Select';
import { Button } from '../components/Button';

const meta: Meta = { title: 'Components/Forms' };
export default meta;

export const Inputs: StoryObj = {
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

export const Toggles: StoryObj = {
  render: () => {
    const [checks, setChecks] = useState({ a: true, b: false });
    const [plan, setPlan] = useState<string | null>('pro');
    const [notify, setNotify] = useState(true);
    return (
      <Stack gap="lg">
        <Stack gap="sm">
          <Text variant="label" color="inkMuted">Checkboxes</Text>
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
        <Stack gap="sm">
          <Text variant="label" color="inkMuted">Radio group</Text>
          <RadioGroup
            value={plan}
            onChange={setPlan}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'team', label: 'Team', disabled: true },
            ]}
          />
        </Stack>
        <Stack gap="sm">
          <Text variant="label" color="inkMuted">Switch</Text>
          <Switch value={notify} onChange={setNotify} label="Push notifications" />
        </Stack>
      </Stack>
    );
  },
};

export const InlineSelect: StoryObj = {
  render: () => {
    const [sport, setSport] = useState<string | null>(null);
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          No modal — options expand in place and push content below out of the way.
        </Text>
        <FormField label="Favorite sport">
          <Select
            value={sport}
            onChange={setSport}
            placeholder="Pick one…"
            options={[
              { value: 'golf', label: 'Golf ⛳' },
              { value: 'tennis', label: 'Tennis' },
              { value: 'climbing', label: 'Climbing' },
              { value: 'cycling', label: 'Cycling' },
            ]}
          />
        </FormField>
        <Row>
          <Button label="Content below" variant="secondary" />
          <Text color="inkMuted">…gets pushed, not covered</Text>
        </Row>
      </Stack>
    );
  },
};
