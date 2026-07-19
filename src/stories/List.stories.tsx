import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { List, ListItem } from '../components/List';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Text } from '../primitives/Text';
import { Stack, Row } from '../primitives/Stack';
import { useToast } from '../components/Toast';

const meta = {
  title: 'Components/List',
  component: ListItem,
  args: {
    title: 'Notifications',
    subtitle: 'Name, avatar, handle',
    chevron: true,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    chevron: { control: 'boolean' },
    left: { control: false },
    right: { control: false },
    onPress: { control: false },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <List>
      <ListItem {...args} subtitle={args.subtitle || undefined} />
    </List>
  ),
};

export const Rows: Story = {
  render: () => {
    const toast = useToast();
    return (
      <List>
        <ListItem
          title="Profile"
          subtitle="Name, avatar, handle"
          left={<Avatar name="Ethan Grove" size={36} />}
          chevron
          onPress={() => toast.show('Profile')}
        />
        <ListItem
          title="Notifications"
          right={<Badge label="3" tone="accent" solid />}
          chevron
          onPress={() => toast.show('Notifications')}
        />
        <ListItem title="About" subtitle="Version 0.1.0" />
      </List>
    );
  },
};

let nextId = 4;

export const InlineAddRemove: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: '1', title: 'Sketch the flows' },
      { id: '2', title: 'Wire the screens' },
      { id: '3', title: 'Ship the prototype' },
    ]);
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Rows fade in and collapse out; neighbors glide instead of jumping.
        </Text>
        <List animated>
          {items.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              right={
                <Button
                  label="✕"
                  size="sm"
                  variant="ghost"
                  onPress={() => setItems((list) => list.filter((i) => i.id !== item.id))}
                />
              }
            />
          ))}
        </List>
        <Row>
          <Button
            label="✚ Add row"
            variant="secondary"
            size="sm"
            onPress={() => setItems((list) => [...list, { id: String(nextId), title: `New task ${nextId++}` }])}
          />
        </Row>
      </Stack>
    );
  },
};
