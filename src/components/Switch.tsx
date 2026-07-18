import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';

const TRACK_W = 52;
const TRACK_H = 30;
const THUMB = 22;
const PAD = (TRACK_H - THUMB) / 2 - 1.5;

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Custom outlined switch; the thumb glides on a spring, the track inks in. */
export function Switch({ value, onChange, label, disabled }: SwitchProps) {
  const theme = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, theme.motion.springs.snappy);
  }, [value, progress, theme]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_W - THUMB - PAD * 2 - 3) }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.ink, theme.colors.surface],
    ),
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={{ alignSelf: 'flex-start' }}
    >
      <Row gap="sm">
        <Animated.View
          style={[
            {
              width: TRACK_W,
              height: TRACK_H,
              borderRadius: TRACK_H / 2,
              borderWidth: theme.borders.regular,
              borderColor: theme.colors.border,
              justifyContent: 'center',
              paddingHorizontal: PAD,
            },
            trackStyle,
          ]}
        >
          <Animated.View
            style={[{ width: THUMB, height: THUMB, borderRadius: THUMB / 2 }, thumbStyle]}
          />
        </Animated.View>
        {label ? <Text>{label}</Text> : null}
      </Row>
    </Pressable>
  );
}
