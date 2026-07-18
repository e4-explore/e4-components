import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Row } from '../primitives/Stack';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  /** Circle (avatars). */
  round?: boolean;
  radius?: number;
}

/** Pulsing placeholder block. */
export function Skeleton({ width = '100%', height = 16, round = false, radius }: SkeletonProps) {
  const theme = useTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        {
          width: round ? height : width,
          height,
          borderRadius: round ? height / 2 : (radius ?? theme.radii.sm),
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: theme.borders.thin,
          borderColor: theme.colors.inkFaint,
          borderStyle: theme.borders.sketchStyle,
        },
        style,
      ]}
    />
  );
}

/** Ready-made loading row: circle + two lines. */
export function SkeletonRow() {
  return (
    <Row gap="md" py="sm">
      <Skeleton round height={40} />
      <Box flex={1} gap="sm">
        <Skeleton height={14} width="60%" />
        <Skeleton height={11} width="90%" />
      </Box>
    </Row>
  );
}
