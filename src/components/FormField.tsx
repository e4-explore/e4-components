import React from 'react';
import Animated from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { settle, enter, exit } from '../motion';

export interface FormFieldProps {
  label: string;
  /** Marks the field optional in the label row. */
  optional?: boolean;
  hint?: string;
  /** When set, replaces the hint and turns the field red. */
  error?: string;
  children: React.ReactNode;
}

/**
 * Label + control + hint/error. The error slides in with a layout spring so
 * surrounding fields glide out of the way instead of jumping.
 */
export function FormField({ label, optional = false, hint, error, children }: FormFieldProps) {
  const theme = useTheme();
  const message = error ?? hint;
  const child = React.isValidElement<{ invalid?: boolean }>(children)
    ? React.cloneElement(children, { invalid: !!error })
    : children;

  return (
    <Animated.View layout={settle(theme.motion.springs.gentle)}>
      <Box gap="xs">
        <Row justify="space-between">
          <Text variant="label">{label}</Text>
          {optional ? (
            <Text variant="caption" color="inkFaint">
              optional
            </Text>
          ) : null}
        </Row>
        {child}
        {message ? (
          <Animated.View entering={enter} exiting={exit} layout={settle(theme.motion.springs.gentle)}>
            <Text variant="caption" color={error ? 'danger' : 'inkMuted'}>
              {message}
            </Text>
          </Animated.View>
        ) : null}
      </Box>
    </Animated.View>
  );
}
