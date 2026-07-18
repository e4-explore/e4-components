import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row, Spacer } from '../primitives/Stack';

export interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  label?: string;
  /** Show a percentage readout. */
  showValue?: boolean;
  height?: number;
}

/** Outlined track; the fill springs to each new value. */
export function ProgressBar({ progress, label, showValue = false, height = 14 }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const value = useSharedValue(clamped);

  useEffect(() => {
    value.value = withSpring(clamped, theme.motion.springs.gentle);
  }, [clamped, value, theme]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <Box gap="xs">
      {label || showValue ? (
        <Row>
          {label ? <Text variant="caption" color="inkMuted">{label}</Text> : null}
          <Spacer />
          {showValue ? (
            <Text variant="caption" weight="bold">{Math.round(clamped * 100)}%</Text>
          ) : null}
        </Row>
      ) : null}
      <Box
        style={{
          height,
          borderRadius: height / 2,
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
          padding: 2,
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: theme.colors.primary,
            },
            fillStyle,
          ]}
        />
      </Box>
    </Box>
  );
}
