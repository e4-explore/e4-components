import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

function Dot({ selected }: { selected: boolean }) {
  const theme = useTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, theme.motion.springs.bouncy);
  }, [selected, progress, theme]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
  }));

  return (
    <Row
      justify="center"
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Animated.View
        style={[
          { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
          dotStyle,
        ]}
      />
    </Row>
  );
}

export interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({ options, value, onChange }: RadioGroupProps<T>) {
  return (
    <Box gap="sm" accessibilityRole="radiogroup">
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === option.value, disabled: !!option.disabled }}
          disabled={option.disabled}
          onPress={() => onChange(option.value)}
          style={{ alignSelf: 'flex-start' }}
        >
          <Row gap="sm">
            <Dot selected={value === option.value} />
            <Text color={option.disabled ? 'inkFaint' : 'ink'}>{option.label}</Text>
          </Row>
        </Pressable>
      ))}
    </Box>
  );
}
