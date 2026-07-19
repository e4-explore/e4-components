import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Accordion } from '../components/Accordion';
import { Button } from '../components/Button';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

const items = [
  {
    key: 'what',
    title: 'What is this?',
    content:
      'An accordion built on the same Expandable engine as Select — measured height, spring-driven, no jump cuts.',
  },
  {
    key: 'why',
    title: 'Why no modals?',
    content: 'Inline expansion keeps context: you never lose your place, and nothing teleports.',
  },
  {
    key: 'actions',
    title: 'Can it hold anything?',
    content: <Button label="Yes — any content" size="sm" variant="secondary" />,
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: {
    items,
    multiple: false,
  },
  argTypes: {
    multiple: { control: 'boolean' },
    items: { control: false },
    defaultOpen: { control: false },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Accordion {...args} items={items} defaultOpen={['what']} />,
};

export const Sections: Story = {
  render: () => (
    <Stack>
      <Text variant="caption" color="inkMuted">
        Sections expand in place; everything below is pushed on a spring.
      </Text>
      <Accordion defaultOpen={['what']} items={items} />
      <Button label="I get pushed around (smoothly)" variant="ghost" />
    </Stack>
  ),
};
