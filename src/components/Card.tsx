import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box, type BoxProps } from '../primitives/Box';
import { Pressable, type PressableProps } from '../primitives/Pressable';

export interface CardProps extends BoxProps {
  /** Makes the whole card tappable with press feedback. */
  onPress?: PressableProps['onPress'];
  /** Strip the surface to bare content — no shadow, border, or background. */
  flat?: boolean;
}

/** Bordered surface with the wireframe's hard offset shadow. */
export function Card({ onPress, flat = false, children, style, ...rest }: CardProps) {
  const theme = useTheme();
  const surface: StyleProp<ViewStyle> = [
    {
      borderRadius: theme.radii.lg,
      ...(flat
        ? { backgroundColor: 'transparent', borderWidth: 0 }
        : {
            backgroundColor: theme.colors.surface,
            borderWidth: theme.borders.regular,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          }),
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
