import React, { useState } from 'react';
import {
  TextInput,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Row } from '../primitives/Stack';

export interface InputProps extends TextInputProps {
  /** Optional adornments (glyphs, buttons). */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Visually mark as invalid (usually driven by FormField). */
  invalid?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Single-line text input. On focus the field "lifts off the page" with the
 * hard offset shadow — emphasis with zero layout shift.
 */
export const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { left, right, invalid = false, containerStyle, style, onFocus, onBlur, editable, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const disabled = editable === false;

  const container: ViewStyle = {
    minHeight: 46,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: theme.borders.regular,
    borderColor: invalid
      ? theme.colors.danger
      : focused
        ? theme.colors.borderStrong
        : theme.colors.border,
    backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surface,
    opacity: disabled ? 0.6 : 1,
    ...(focused ? theme.shadows.card : theme.shadows.none),
  };

  const body = theme.typography.variants.body;
  return (
    <Row gap="sm" style={[container, containerStyle]}>
      {left}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.inkFaint}
        editable={editable}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            flex: 1,
            paddingVertical: theme.spacing.sm + 2,
            fontSize: body.fontSize,
            fontFamily: body.face.fontFamily,
            fontWeight: body.face.fontWeight,
            color: theme.colors.ink,
            outlineWidth: 0,
            outlineStyle: 'none',
          } as unknown as StyleProp<ViewStyle>,
          style,
        ]}
        {...rest}
      />
      {right}
    </Row>
  );
});

export interface TextAreaProps extends InputProps {
  rows?: number;
}

/** Multi-line input sharing Input's look and focus behavior. */
export const TextArea = React.forwardRef<TextInput, TextAreaProps>(function TextArea(
  { rows = 4, containerStyle, style, ...rest },
  ref,
) {
  const theme = useTheme();
  const body = theme.typography.variants.body;
  return (
    <Input
      ref={ref}
      multiline
      textAlignVertical="top"
      containerStyle={[{ alignItems: 'flex-start', paddingVertical: 0 }, containerStyle]}
      style={[{ minHeight: rows * body.lineHeight + theme.spacing.md }, style]}
      {...rest}
    />
  );
});
