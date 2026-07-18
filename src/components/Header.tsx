import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row, Spacer } from '../primitives/Stack';
import { Pressable } from '../primitives/Pressable';
import { Icon } from '../icons/Icon';

export interface HeaderProps {
  title: string;
  /** Renders a back chevron; called on press. */
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

/** App bar: ruled bottom edge, title in the wireframe hand. */
export function Header({ title, onBack, left, right }: HeaderProps) {
  const theme = useTheme();
  return (
    <Row
      px="md"
      gap="md"
      bg="background"
      style={{
        height: 56,
        borderBottomWidth: theme.borders.regular,
        borderColor: theme.colors.border,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={{ padding: theme.spacing.xs }}
        >
          <Icon name="chevronLeft" size={20} />
        </Pressable>
      ) : (
        left
      )}
      <Text variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>
        {title}
      </Text>
      <Spacer />
      {right}
    </Row>
  );
}
