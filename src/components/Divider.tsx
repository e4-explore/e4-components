import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';

export interface DividerProps {
  /** Optional centered label ("or", "Today", …). */
  label?: string;
  /** Use the sketchy dashed style. */
  sketch?: boolean;
}

export function Divider({ label, sketch = false }: DividerProps) {
  const theme = useTheme();
  const line = (
    <Box
      flex={1}
      style={{
        borderBottomWidth: theme.borders.thin,
        borderColor: theme.colors.border,
        borderStyle: sketch ? theme.borders.sketchStyle : 'solid',
        opacity: sketch ? 0.6 : 0.35,
      }}
    />
  );
  if (!label) return <Row my="sm">{line}</Row>;
  return (
    <Row my="sm" gap="sm">
      {line}
      <Text variant="caption" color="inkMuted">
        {label}
      </Text>
      {line}
    </Row>
  );
}
