import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box, type BoxProps } from '../primitives/Box';
import { Pressable, type PressableProps } from '../primitives/Pressable';
import { GlassSurface } from '../primitives/GlassSurface';

export interface CardProps extends BoxProps {
  /** Makes the whole card tappable with press feedback. */
  onPress?: PressableProps['onPress'];
  /** Strip the surface to bare content — no shadow, border, or background. */
  flat?: boolean;
}

/**
 * Bordered surface. On flat themes it's the wireframe's hard offset shadow; on
 * a glass theme (`theme.material` present) it renders as a translucent,
 * blurred glass panel via `<GlassSurface>`.
 */
export function Card({ onPress, flat = false, children, style, ...rest }: CardProps) {
  const theme = useTheme();

  // Glass path: the soft shadow lives on an outer wrapper (the blur clips its
  // own children), the GlassSurface carries the radius + blur + specular edge.
  if (theme.material && !flat) {
    const glass = (
      <GlassSurface style={{ borderRadius: theme.radii.lg }}>
        <Box p="md" {...rest}>
          {children}
        </Box>
      </GlassSurface>
    );
    const outer: StyleProp<ViewStyle> = [
      { borderRadius: theme.radii.lg, ...theme.shadows.card },
      style,
    ];
    if (onPress) {
      return (
        <Pressable accessibilityRole="button" onPress={onPress} style={outer}>
          {glass}
        </Pressable>
      );
    }
    return <Box style={outer}>{glass}</Box>;
  }

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
