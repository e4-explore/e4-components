import React, { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

export interface CodeInputProps {
  /** Number of digits. Default 6. */
  length?: number;
  value: string;
  onChange: (code: string) => void;
  /** Called once when the final digit lands. */
  onFilled?: (code: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * One-time-code entry: a row of digit cells backed by a single invisible
 * input, so paste, autofill, and the numeric keyboard all just work. The
 * active cell lifts off the page like a focused Input.
 */
export function CodeInput({
  length = 6,
  value,
  onChange,
  onFilled,
  invalid = false,
  disabled = false,
  autoFocus = false,
}: CodeInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.split('').slice(0, length);
  const activeIndex = Math.min(digits.length, length - 1);

  const handleChange = (raw: string) => {
    const next = raw.replace(/\D/g, '').slice(0, length);
    onChange(next);
    if (next.length === length && value.length !== length) onFilled?.(next);
  };

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      disabled={disabled}
      accessibilityLabel={`${length}-digit code`}
    >
      <Row gap="sm" justify="center">
        {Array.from({ length }).map((_, i) => {
          const active = focused && i === activeIndex && digits.length < length;
          return (
            <View
              key={i}
              style={{
                width: 44,
                height: 54,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radii.md,
                borderWidth: active ? theme.borders.thick : theme.borders.regular,
                borderColor: invalid
                  ? theme.colors.danger
                  : active
                    ? theme.colors.borderStrong
                    : theme.colors.border,
                backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surface,
                opacity: disabled ? 0.6 : 1,
                ...(active ? theme.shadows.card : theme.shadows.none),
              }}
            >
              <Text variant="heading">{digits[i] ?? ''}</Text>
            </View>
          );
        })}
      </Row>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        caretHidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
        }}
      />
    </Pressable>
  );
}
