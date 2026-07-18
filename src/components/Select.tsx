import React, { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';
import { Expandable } from './Expandable';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * No-modal select: options expand inline right under the trigger, pushing
 * content below out of the way with a spring. Chevron rotates with the state.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  invalid = false,
  disabled = false,
}: SelectProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(open ? 180 : 0, theme.motion.springs.snappy);
  }, [open, rotation, theme]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const selected = options.find((o) => o.value === value);

  return (
    <Box
      rounded="md"
      style={{
        borderWidth: theme.borders.regular,
        borderColor: invalid
          ? theme.colors.danger
          : open
            ? theme.colors.borderStrong
            : theme.colors.border,
        backgroundColor: theme.colors.surface,
        opacity: disabled ? 0.6 : 1,
        ...(open ? theme.shadows.card : theme.shadows.none),
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        pressScale={1}
        onPress={() => setOpen((o) => !o)}
      >
        <Row px="md" justify="space-between" style={{ minHeight: 46 }}>
          <Text color={selected ? 'ink' : 'inkFaint'}>{selected?.label ?? placeholder}</Text>
          <Animated.View style={chevronStyle}>
            <Text color="inkMuted" style={{ fontSize: 13, lineHeight: 16 }}>
              ▼
            </Text>
          </Animated.View>
        </Row>
      </Pressable>
      <Expandable open={open}>
        <Box pb="xs">
          <Box
            mx="md"
            style={{
              borderTopWidth: theme.borders.thin,
              borderColor: theme.colors.border,
              borderStyle: theme.borders.sketchStyle,
              opacity: 0.99,
            }}
          />
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                pressScale={0.99}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Row px="md" py="sm" justify="space-between">
                  <Text weight={isSelected ? 'bold' : 'regular'}>{option.label}</Text>
                  {isSelected ? <Text weight="bold">✓</Text> : null}
                </Row>
              </Pressable>
            );
          })}
        </Box>
      </Expandable>
    </Box>
  );
}
