import React from 'react';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';

export interface TableColumn<T> {
  key: string;
  title: string;
  flex?: number;
  align?: TextStyle['textAlign'];
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
}

/** Simple wireframe data table: outlined, hatched header, ruled rows. */
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
}: TableProps<T>) {
  const theme = useTheme();

  return (
    <Box
      bg="surface"
      rounded="md"
      style={{
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      <Row bg="surfaceAlt" px="md" py="sm" gap="sm">
        {columns.map((col) => (
          <Box key={col.key} flex={col.flex ?? 1}>
            <Text variant="caption" weight="bold" color="inkMuted" align={col.align}>
              {col.title.toUpperCase()}
            </Text>
          </Box>
        ))}
      </Row>
      {data.map((row, index) => (
        <Row
          key={keyExtractor(row, index)}
          px="md"
          py="sm"
          gap="sm"
          style={{ borderTopWidth: theme.borders.thin, borderColor: theme.colors.border }}
        >
          {columns.map((col) => (
            <Box key={col.key} flex={col.flex ?? 1}>
              {col.render ? (
                col.render(row)
              ) : (
                <Text variant="label" align={col.align} numberOfLines={1}>
                  {String(row[col.key] ?? '—')}
                </Text>
              )}
            </Box>
          ))}
        </Row>
      ))}
    </Box>
  );
}
