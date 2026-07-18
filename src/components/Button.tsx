import React from 'react';
import { ActivityIndicator, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable, type PressableProps } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Optional adornments, e.g. an icon glyph. */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Stretch to fill the row. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 34, px: 12, fontSize: 14 },
  md: { height: 44, px: 18, fontSize: 16 },
  lg: { height: 54, px: 24, fontSize: 18 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  left,
  right,
  block = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const dims = SIZES[size];

  const filled = variant === 'primary' || variant === 'danger';
  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.surface
          : 'transparent';
  const fg = filled ? theme.colors.onPrimary : theme.colors.ink;

  const container: ViewStyle = {
    height: dims.height,
    paddingHorizontal: dims.px,
    borderRadius: theme.radii.md,
    backgroundColor: bg,
    borderWidth: variant === 'ghost' ? 0 : theme.borders.regular,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: block ? 'stretch' : 'flex-start',
    ...(variant === 'primary' ? theme.shadows.card : null),
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: loading }}
      disabled={disabled || loading}
      style={[container, style]}
      {...rest}
    >
      <Row gap="sm">
        {loading ? <ActivityIndicator size="small" color={fg} /> : left}
        <Text
          variant="label"
          weight="bold"
          color={fg}
          style={{ fontSize: dims.fontSize, lineHeight: dims.fontSize * 1.3 }}
        >
          {label}
        </Text>
        {right}
      </Row>
    </Pressable>
  );
}
