import React from 'react';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { settle, enter, exit } from '../../motion';

/**
 * Server-side error banner for flow forms (wrong password, taken email…).
 * Springs into the layout so the form glides apart instead of jumping.
 */
export function InlineError({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) return null;
  return (
    <Animated.View entering={enter} exiting={exit} layout={settle(theme.motion.springs.gentle)}>
      <Box
        p="sm"
        px="md"
        rounded="md"
        style={{
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.danger,
          borderStyle: theme.borders.sketchStyle,
        }}
      >
        <Text variant="label" color="danger">
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}
