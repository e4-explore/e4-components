import React from 'react';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Pressable } from '../../primitives/Pressable';
import { DismissKeyboard } from '../../primitives/DismissKeyboard';
import { Icon } from '../../icons/Icon';

export interface AuthScaffoldProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

/** Shared chrome for auth steps: back chevron, big title, form body. */
export function AuthScaffold({ title, subtitle, onBack, children }: AuthScaffoldProps) {
  return (
    <DismissKeyboard>
      <Box flex={1} p="lg" gap="lg" bg="background">
        <Stack gap="xs">
          {onBack ? (
            <Row style={{ marginBottom: 4 }}>
              <Pressable onPress={onBack} accessibilityLabel="Back" hitSlop={8}>
                <Icon name="chevronLeft" size={22} />
              </Pressable>
            </Row>
          ) : null}
          <Text variant="title">{title}</Text>
          {subtitle ? (
            <Text variant="body" color="inkMuted">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
        {children}
      </Box>
    </DismissKeyboard>
  );
}

/** Inline tappable text, e.g. "Forgot password?". */
export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={6}>
      <Text variant="label" color="accent">
        {label}
      </Text>
    </Pressable>
  );
}
