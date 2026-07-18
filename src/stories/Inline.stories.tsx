import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Card } from '../components/Card';
import { InlineEdit } from '../components/InlineEdit';
import { Accordion } from '../components/Accordion';
import { Button } from '../components/Button';

const meta: Meta = { title: 'Components/Inline editing' };
export default meta;

export const InlineEditing: StoryObj = {
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
            <InlineEdit
              value={notes}
              onCommit={setNotes}
              placeholder="Tap to add notes…"
              multiline
            />
          </Stack>
        </Card>
      </Stack>
    );
  },
};

export const AccordionSections: StoryObj = {
  render: () => (
    <Stack>
      <Text variant="caption" color="inkMuted">
        Sections expand in place; everything below is pushed on a spring.
      </Text>
      <Accordion
        defaultOpen={['what']}
        items={[
          {
            key: 'what',
            title: 'What is this?',
            content:
              'An accordion built on the same Expandable engine as Select — measured height, spring-driven, no jump cuts.',
          },
          {
            key: 'why',
            title: 'Why no modals?',
            content:
              'Inline expansion keeps context: you never lose your place, and nothing teleports.',
          },
          {
            key: 'actions',
            title: 'Can it hold anything?',
            content: <Button label="Yes — any content" size="sm" variant="secondary" />,
          },
        ]}
      />
      <Button label="I get pushed around (smoothly)" variant="ghost" />
    </Stack>
  ),
};
