import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Expandable } from '../components/Expandable';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

const meta = {
  title: 'Components/Expandable',
  component: Expandable,
  args: {
    open: true,
    children: null,
  },
  argTypes: {
    open: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof Expandable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Expandable {...args}>
      <Card flat>
        <Text>
          Measured-height, spring-driven reveal. Flip `open` in Controls to watch neighbors glide
          instead of jump.
        </Text>
      </Card>
    </Expandable>
  ),
};

export const Toggle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack>
        <Button label={open ? 'Collapse' : 'Expand'} variant="secondary" onPress={() => setOpen((o) => !o)} />
        <Expandable open={open}>
          <Card flat>
            <Text>Content below springs into place — no layout jump.</Text>
          </Card>
        </Expandable>
        <Text variant="caption" color="inkMuted">
          This caption glides as the panel above it opens and closes.
        </Text>
      </Stack>
    );
  },
};
