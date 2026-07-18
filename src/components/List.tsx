import React from 'react';
import Animated from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box, type BoxProps } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row, Spacer } from '../primitives/Stack';
import { Pressable } from '../primitives/Pressable';
import { settle, enter, exit } from '../motion';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Show a chevron affordance on the right. */
  chevron?: boolean;
  onPress?: () => void;
}

export function ListItem({ title, subtitle, left, right, chevron, onPress }: ListItemProps) {
  const content = (
    <Row px="md" py="md" gap="md">
      {left}
      <Box flex={1} gap="xxs">
        <Text variant="label" weight="medium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="inkMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {right}
      {chevron ? (
        <Text color="inkFaint" style={{ fontSize: 16, lineHeight: 20 }}>
          ›
        </Text>
      ) : null}
    </Row>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" pressScale={0.99} onPress={onPress}>
      {content}
    </Pressable>
  );
}

export interface ListProps extends BoxProps {
  /** Animate item add/remove: rows fade in/collapse out, neighbors glide. */
  animated?: boolean;
}

/**
 * Bordered list container. Children (usually ListItems) get dividers between
 * them; with `animated`, inline add/remove pushes rows smoothly.
 */
export function List({ animated = false, children, style, ...rest }: ListProps) {
  const theme = useTheme();
  const items = React.Children.toArray(children);

  return (
    <Box
      bg="surface"
      rounded="lg"
      style={[
        {
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {items.map((child, index) => {
        const wrapped = (
          <Box
            style={
              index > 0
                ? { borderTopWidth: theme.borders.thin, borderColor: theme.colors.border }
                : undefined
            }
          >
            {child}
          </Box>
        );
        const key = (React.isValidElement(child) && child.key) || index;
        if (!animated) return <React.Fragment key={key}>{wrapped}</React.Fragment>;
        return (
          <Animated.View
            key={key}
            entering={enter}
            exiting={exit}
            layout={settle(theme.motion.springs.gentle)}
          >
            {wrapped}
          </Animated.View>
        );
      })}
    </Box>
  );
}
