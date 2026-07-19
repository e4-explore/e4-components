import React from 'react';
import { ActivityIndicator, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable, type PressableProps } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Icon, type IconName } from '../icons/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button text. Omit (while passing `icon`) for a square, icon-only button. */
  label?: string;
  /** Library icon shown before the label — or on its own for an icon-only button. */
  icon?: IconName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Optional adornments, e.g. a custom glyph. Ignored in icon-only mode. */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Stretch to fill the row. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<ButtonSize, { height: number; px: number; fontSize: number; icon: number }> = {
  sm: { height: 34, px: 12, fontSize: 14, icon: 16 },
  md: { height: 44, px: 18, fontSize: 16, icon: 20 },
  lg: { height: 54, px: 24, fontSize: 18, icon: 24 },
};

export function Button({
  label,
  icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  left,
  right,
  block = false,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const dims = SIZES[size];

  // No label but an icon → square, icon-only button.
  const iconOnly = !label && !!icon;

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
    ...(iconOnly ? { width: dims.height } : { paddingHorizontal: dims.px }),
    borderRadius: theme.radii.md,
    backgroundColor: bg,
    borderWidth: variant === 'ghost' ? 0 : theme.borders.regular,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: block ? 'stretch' : 'flex-start',
    ...(variant === 'primary' ? theme.shadows.card : null),
  };

  const spinner = <ActivityIndicator size="small" color={fg} />;
  const iconEl = icon ? <Icon name={icon} size={dims.icon} color={fg} /> : null;

  return (
    <Pressable
      accessibilityRole="button"
      // Icon-only buttons have no visible text, so lean on the caller's label.
      accessibilityLabel={accessibilityLabel ?? (iconOnly ? undefined : label)}
      accessibilityState={{ disabled: !!disabled, busy: loading }}
      disabled={disabled || loading}
      style={[container, style]}
      {...rest}
    >
      {iconOnly ? (
        loading ? spinner : iconEl
      ) : (
        <Row gap="sm">
          {loading ? spinner : (iconEl ?? left)}
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
      )}
    </Pressable>
  );
}
