import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { withAlpha } from '../theme/color';
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

  // Soft tint of the tone color as the fill. Derived from the (theme-aware)
  // tone color, so it tracks light/dark automatically; dark surfaces need a
  // touch more opacity for the tint to read.
  const tintFill = withAlpha(toneColor, theme.dark ? 0.22 : 0.14);

  return (
    <Box
      px="sm"
      py="xxs"
      rounded="pill"
      alignSelf="flex-start"
      style={{
        borderWidth: theme.borders.regular,
        borderColor: toneColor,
        backgroundColor: solid ? toneColor : tintFill,
      }}
    >
      <Text variant="caption" weight="bold" color={solid ? theme.colors.surface : toneColor}>
        {label}
      </Text>
    </Box>
  );
}
