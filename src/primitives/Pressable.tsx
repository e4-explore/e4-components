import React from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  /** How far to scale down while pressed. */
  pressScale?: number;
  /** Also dim slightly while pressed. */
  pressOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pressable with springy scale feedback — the shared "feel" of every tappable
 * thing in the library. Scales down on touch, springs back on release.
 */
export const Pressable = React.forwardRef<View, PressableProps>(function Pressable(
  { pressScale = 0.97, pressOpacity = 1, disabled, style, onPressIn, onPressOut, ...rest },
  ref,
) {
  const theme = useTheme();
  const pressed = useSharedValue(0);
  const spring = theme.motion.springs.snappy;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pressed.value * (pressScale - 1) }],
    opacity: disabled ? 0.4 : 1 + pressed.value * (pressOpacity - 1),
  }));

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={(e) => {
        pressed.value = withSpring(1, spring);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withSpring(0, spring);
        onPressOut?.(e);
      }}
      style={[animatedStyle, style]}
      {...rest}
    />
  );
});
