import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row, Spacer } from '../primitives/Stack';
import { Pressable } from '../primitives/Pressable';
import { GlassSurface } from '../primitives/GlassSurface';
import { Icon } from '../icons/Icon';

export interface HeaderProps {
  title: string;
  /** Renders a back chevron; called on press. */
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

/** App bar. On glass themes it renders as a translucent, blurred chrome bar. */
export function Header({ title, onBack, left, right }: HeaderProps) {
  const theme = useTheme();
  const glass = !!theme.material;
  const row = (
    <Row
      px="md"
      gap="md"
      bg={glass ? undefined : 'background'}
      style={{
        height: 56,
        // On glass, a hairline base edge separates the bar from scrolled content.
        ...(glass
          ? { borderBottomWidth: theme.borders.thin, borderBottomColor: theme.colors.border }
          : null),
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

  if (glass) {
    return (
      <GlassSurface intensity="thin" highlight={false}>
        {row}
      </GlassSurface>
    );
  }
  return row;
}
