import React, { useEffect } from 'react';
import { Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Box } from '../primitives/Box';

const AnimatedText = Animated.createAnimatedComponent(RNText);

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface FilterBaseProps<T extends string> {
  options: FilterOption<T>[];
}

/**
 * Filter props are a discriminated union on `multiple`:
 * - single-select (default): `value` is `T | null`, re-tapping the active chip clears it.
 * - multi-select (`multiple`): `value` is `T[]`, each chip toggles its membership.
 */
export type FilterProps<T extends string> =
  | (FilterBaseProps<T> & {
      multiple?: false;
      value: T | null;
      onChange: (value: T | null) => void;
    })
  | (FilterBaseProps<T> & {
      multiple: true;
      value: T[];
      onChange: (value: T[]) => void;
    });

/**
 * A wrapping row of toggleable filter chips. Selecting a chip springs its fill,
 * border, and label color from paper to ink — nothing jumps. Supports single-
 * select (with tap-to-clear) or `multiple` for multi-select.
 */
export function Filter<T extends string>(props: FilterProps<T>) {
  const { options } = props;

  const isSelected = (value: T) =>
    props.multiple ? props.value.includes(value) : props.value === value;

  const toggle = (value: T) => {
    if (props.multiple) {
      const next = props.value.includes(value)
        ? props.value.filter((v) => v !== value)
        : [...props.value, value];
      props.onChange(next);
    } else {
      // Tap the active chip again to clear the filter.
      props.onChange(props.value === value ? null : value);
    }
  };

  return (
    <Box row wrap gap="sm">
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={isSelected(option.value)}
          disabled={option.disabled}
          onPress={() => toggle(option.value)}
        />
      ))}
    </Box>
  );
}

function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, theme.motion.springs.snappy);
  }, [selected, progress, theme]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.ink, theme.colors.onPrimary],
    ),
  }));

  const v = theme.typography.variants.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      pressScale={0.95}
      onPress={onPress}
      style={{ alignSelf: 'flex-start' }}
    >
      <Animated.View
        style={[
          {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs + 2,
            borderRadius: theme.radii.pill,
            borderWidth: theme.borders.regular,
          },
          chipStyle,
        ]}
      >
        <AnimatedText
          style={[
            {
              fontSize: v.fontSize,
              lineHeight: v.lineHeight,
              fontFamily: v.face.fontFamily,
              fontWeight: v.face.fontWeight,
              letterSpacing: v.letterSpacing,
              textTransform: v.textTransform,
            },
            textStyle,
          ]}
        >
          {label}
        </AnimatedText>
      </Animated.View>
    </Pressable>
  );
}
