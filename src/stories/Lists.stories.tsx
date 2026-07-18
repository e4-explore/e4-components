import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { List, ListItem } from '../components/List';
import { DraggableList } from '../components/DraggableList';
import { Table } from '../components/Table';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icon } from '../icons/Icon';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';

const meta: Meta = { title: 'Components/Lists & Data' };
export default meta;

export const Lists: StoryObj = {
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

export const InlineAddRemove: StoryObj = {
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
            onPress={() =>
              setItems((list) => [...list, { id: String(nextId), title: `New task ${nextId++}` }])
            }
          />
        </Row>
      </Stack>
    );
  },
};

export const Reorderable: StoryObj = {
  render: () => {
    const theme = useTheme();
    const [items, setItems] = useState([
      { id: 'a', title: 'Warm-up putts', detail: '10 min' },
      { id: 'b', title: 'Driving range', detail: '25 min' },
      { id: 'c', title: 'Short game', detail: '20 min' },
      { id: 'd', title: 'Bunker practice', detail: '15 min' },
      { id: 'e', title: 'Play 9 holes', detail: '2 hrs' },
    ]);
    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Hold a row to lift it, drag to reorder — neighbors spring aside, release settles.
        </Text>
        <DraggableList
          data={items}
          keyExtractor={(item) => item.id}
          onReorder={setItems}
          rowHeight={72}
          renderItem={({ item, isActive }) => (
            <Box pb="sm" style={{ height: 72 }}>
              <Card flat={!isActive} p="md" style={{ flex: 1, justifyContent: 'center' }}>
                <Row>
                  <Icon name="grip" size={18} color="inkFaint" />
                  <Box flex={1} ml="sm">
                    <Text variant="label" weight="medium">
                      {item.title}
                    </Text>
                  </Box>
                  <Text variant="caption" color="inkMuted">
                    {item.detail}
                  </Text>
                </Row>
              </Card>
            </Box>
          )}
        />
        <Text variant="caption" color="inkFaint">
          Order: {items.map((i) => i.title.split(' ')[0]).join(' → ')}
        </Text>
      </Stack>
    );
  },
};

export const DataTable: StoryObj = {
  render: () => (
    <Table
      keyExtractor={(row) => String(row.hole)}
      columns={[
        { key: 'hole', title: 'Hole', flex: 1 },
        { key: 'par', title: 'Par', flex: 1, align: 'center' },
        { key: 'score', title: 'Score', flex: 1, align: 'center' },
        {
          key: 'result',
          title: 'Result',
          flex: 2,
          render: (row) => (
            <Badge
              label={String(row.result)}
              tone={row.result === 'Birdie' ? 'success' : row.result === 'Bogey' ? 'warning' : 'neutral'}
            />
          ),
        },
      ]}
      data={[
        { hole: 1, par: 4, score: 4, result: 'Par' },
        { hole: 2, par: 3, score: 2, result: 'Birdie' },
        { hole: 3, par: 5, score: 6, result: 'Bogey' },
        { hole: 4, par: 4, score: 4, result: 'Par' },
      ]}
    />
  ),
};
