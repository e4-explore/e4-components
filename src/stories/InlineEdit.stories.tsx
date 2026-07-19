import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InlineEdit } from '../components/InlineEdit';
import { Card } from '../components/Card';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Components/InlineEdit',
  component: InlineEdit,
  args: {
    value: 'Round at Pebble Beach',
    variant: 'heading',
    placeholder: 'Tap to edit…',
    multiline: false,
    onCommit: () => {},
  },
  argTypes: {
    value: { control: 'text' },
    variant: {
      control: 'select',
      options: ['display', 'title', 'heading', 'body', 'label', 'caption'],
    },
    placeholder: { control: 'text' },
    multiline: { control: 'boolean' },
    onCommit: { control: false },
  },
} satisfies Meta<typeof InlineEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <Card>
        <InlineEdit {...args} value={value} onCommit={setValue} />
      </Card>
    );
  },
};

export const InCard: Story = {
  render: () => {
    const [title, setTitle] = useState('Round at Pebble Beach');
    const [notes, setNotes] = useState('');
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Tap the text — it becomes editable in place with identical metrics, so nothing shifts.
        </Text>
        <Card>
          <Stack gap="sm">
            <InlineEdit value={title} onCommit={setTitle} variant="heading" />
            <InlineEdit value={notes} onCommit={setNotes} placeholder="Tap to add notes…" multiline />
          </Stack>
        </Card>
      </Stack>
    );
  },
};
