import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box, type BoxProps } from '../primitives/Box';
import { Pressable, type PressableProps } from '../primitives/Pressable';

export interface CardProps extends BoxProps {
  /** Makes the whole card tappable with press feedback. */
  onPress?: PressableProps['onPress'];
  /** Drop the offset shadow (flat card). */
  flat?: boolean;
}

/** Bordered surface with the wireframe's hard offset shadow. */
export function Card({ onPress, flat = false, children, style, ...rest }: CardProps) {
  const theme = useTheme();
  const surface: StyleProp<ViewStyle> = [
    {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borders.regular,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      ...(flat ? null : theme.shadows.card),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={surface}>
        <Box p="md" {...rest}>
          {children}
        </Box>
      </Pressable>
    );
  }
  return (
    <Box p="md" {...rest} style={surface}>
      {children}
    </Box>
  );
}
