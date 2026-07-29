import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DraggableList } from '../components/DraggableList';
import { Card } from '../components/Card';
import { Icon } from '../icons/Icon';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Stack, Row } from '../primitives/Stack';
import { useTheme } from '../theme/ThemeProvider';

interface Drill {
  id: string;
  title: string;
  detail: string;
}

const meta = {
  title: 'Components/DraggableList',
  component: DraggableList<Drill>,
  args: {
    rowHeight: 72,
    data: [],
    keyExtractor: (item) => item.id,
    renderItem: () => null,
    onReorder: () => {},
  },
  argTypes: {
    rowHeight: { control: { type: 'range', min: 48, max: 120, step: 4 } },
    activationDelay: { control: { type: 'range', min: 0, max: 400, step: 20 } },
    data: { control: false },
    keyExtractor: { control: false },
    renderItem: { control: false },
    onReorder: { control: false },
  },
} satisfies Meta<typeof DraggableList<Drill>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const theme = useTheme();
    const [items, setItems] = useState<Drill[]>([
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
          {...args}
          data={items}
          keyExtractor={(item) => item.id}
          onReorder={setItems}
          renderItem={({ item, index, isActive }) => (
            <Box pb="sm" style={{ height: args.rowHeight }}>
              <Card
                flat={!isActive}
                p="md"
                style={[
                  { flex: 1, justifyContent: 'center' },
                  isActive ? theme.shadows.lifted : null,
                ]}
              >
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
              {/* Dashed separator sits in the row's bottom gap — only on the
                  flat rows (a lifted row becomes the surfaced card, which owns
                  its own edges), and never after the last item. */}
              {!isActive && index < items.length - 1 ? (
                <Box
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: theme.spacing.sm,
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    style={{
                      borderBottomWidth: theme.borders.thin,
                      borderColor: theme.colors.border,
                      borderStyle: theme.borders.sketchStyle,
                      opacity: 0.6,
                    }}
                  />
                </Box>
              ) : null}
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
