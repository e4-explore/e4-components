import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Outlined box; the check springs in with a playful overshoot. */
export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  const theme = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, theme.motion.springs.bouncy);
  }, [checked, progress, theme]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{ alignSelf: 'flex-start' }}
    >
      <Row gap="sm">
        <Row
          justify="center"
          style={{
            width: 24,
            height: 24,
            borderRadius: theme.radii.sm,
            borderWidth: theme.borders.regular,
            borderColor: theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
          }}
        >
          <Animated.View style={markStyle}>
            <Text weight="bold" color="onPrimary" style={{ fontSize: 15, lineHeight: 18 }}>
              ✓
            </Text>
          </Animated.View>
        </Row>
        {label ? <Text>{label}</Text> : null}
      </Row>
    </Pressable>
  );
}
