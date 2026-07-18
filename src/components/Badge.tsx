import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Filled instead of outlined. */
  solid?: boolean;
}

export function Badge({ label, tone = 'neutral', solid = false }: BadgeProps) {
  const theme = useTheme();
  const toneColor =
    tone === 'neutral'
      ? theme.colors.ink
      : theme.colors[tone === 'accent' ? 'accent' : tone];

  return (
    <Box
      px="sm"
      py="xxs"
      rounded="pill"
      alignSelf="flex-start"
      style={{
        borderWidth: theme.borders.regular,
        borderColor: toneColor,
        backgroundColor: solid ? toneColor : 'transparent',
      }}
    >
      <Text variant="caption" weight="bold" color={solid ? theme.colors.surface : toneColor}>
        {label}
      </Text>
    </Box>
  );
}
