import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export interface EmptyStateProps {
  /** A single glyph or emoji standing in for an illustration. */
  glyph?: string;
  title: string;
  description?: string;
  /** Usually a Button. */
  action?: React.ReactNode;
}

/** Dashed placeholder region — the classic wireframe "nothing here yet" box. */
export function EmptyState({ glyph = '◎', title, description, action }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <Box
      p="xl"
      gap="sm"
      align="center"
      rounded="lg"
      style={{
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.inkFaint,
        borderStyle: theme.borders.sketchStyle,
      }}
    >
      <Text color="inkFaint" style={{ fontSize: 40, lineHeight: 48 }}>
        {glyph}
      </Text>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {description ? (
        <Text color="inkMuted" align="center" style={{ maxWidth: 280 }}>
          {description}
        </Text>
      ) : null}
      {action ? <Box mt="sm">{action}</Box> : null}
    </Box>
  );
}
