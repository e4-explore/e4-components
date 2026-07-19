import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Icon } from '../icons/Icon';
import { DragProvider, type DropResult } from '../dnd/DragProvider';
import { DragColumn } from '../dnd/DragColumn';

const meta: Meta = { title: 'Lists & Data/Kanban board' };
export default meta;

interface Task {
  id: string;
  title: string;
}

type ColumnId = 'todo' | 'doing' | 'done';

const COLUMNS: { id: ColumnId; label: string; tone: 'neutral' | 'accent' | 'success' }[] = [
  { id: 'todo', label: 'To do', tone: 'neutral' },
  { id: 'doing', label: 'In progress', tone: 'accent' },
  { id: 'done', label: 'Done', tone: 'success' },
];

const ROW_HEIGHT = 68;

export const CrossListDrag: StoryObj = {
  render: () => {
    const [board, setBoard] = useState<Record<ColumnId, Task[]>>({
      todo: [
        { id: 'a', title: 'Sketch the flows' },
        { id: 'b', title: 'Pick the type scale' },
        { id: 'c', title: 'Draft empty states' },
      ],
      doing: [{ id: 'd', title: 'Wire the components' }],
      done: [{ id: 'e', title: 'Set up the repo' }],
    });

    const handleDrop = ({ from, itemKey, to, toIndex }: DropResult) => {
      setBoard((prev) => {
        const fromCol = from as ColumnId;
        const toCol = to as ColumnId;
        const moving = prev[fromCol].find((t) => t.id === itemKey);
        if (!moving) return prev;

        const next: Record<ColumnId, Task[]> = {
          todo: [...prev.todo],
          doing: [...prev.doing],
          done: [...prev.done],
        };
        next[fromCol] = next[fromCol].filter((t) => t.id !== itemKey);
        // Clamp the insertion index once the source item is removed.
        const insertAt = Math.min(toIndex, next[toCol].length);
        next[toCol] = [
          ...next[toCol].slice(0, insertAt),
          moving,
          ...next[toCol].slice(insertAt),
        ];
        return next;
      });
    };

    return (
      <Stack>
        <Text variant="caption" color="inkMuted">
          Drag a card by its grip across columns — a bold dashed line marks where it lands. Pass
          `activationDelay` to require a long-press lift instead.
        </Text>
        <DragProvider onDrop={handleDrop}>
          <Row align="flex-start" gap="sm">
            {COLUMNS.map((col) => (
              <Box key={col.id} flex={1} gap="sm">
                <Row justify="space-between">
                  <Text variant="label" weight="bold">
                    {col.label}
                  </Text>
                  <Badge label={String(board[col.id].length)} tone={col.tone} />
                </Row>
                <Box
                  bg="surfaceAlt"
                  rounded="lg"
                  p="xs"
                  style={{ borderWidth: 1, borderColor: '#00000010' }}
                >
                  <DragColumn
                    id={col.id}
                    data={board[col.id]}
                    keyExtractor={(t) => t.id}
                    rowHeight={ROW_HEIGHT}
                    minHeight={ROW_HEIGHT * 2}
                    renderItem={({ item }) => (
                      <Box pb="sm" style={{ height: ROW_HEIGHT }}>
                        <Card flat p="sm" style={{ flex: 1, justifyContent: 'center' }}>
                          <Row gap="xs">
                            <Icon name="grip" size={14} color="inkFaint" />
                            <Text variant="label" numberOfLines={2} style={{ flex: 1 }}>
                              {item.title}
                            </Text>
                          </Row>
                        </Card>
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            ))}
          </Row>
        </DragProvider>
      </Stack>
    );
  },
};
