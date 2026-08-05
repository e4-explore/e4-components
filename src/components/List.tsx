import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box, type BoxProps } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Pressable } from '../primitives/Pressable';
import { GlassSurface } from '../primitives/GlassSurface';
import { Icon } from '../icons/Icon';
import { settle } from '../motion';

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
      {chevron ? <Icon name="chevronRight" size={15} color="inkFaint" /> : null}
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
  /** Animate item add/remove: rows slide+fade in/out and neighbors glide. */
  animated?: boolean;
}

/**
 * Bordered list container. Children (usually ListItems) get dividers between
 * them; with `animated`, inline add/remove slides rows in/out on a spring while
 * their neighbors glide, so nothing pops in before the rest has settled.
 */
export function List({ animated = false, children, style, ...rest }: ListProps) {
  const theme = useTheme();
  const items = React.Children.toArray(children);
  const spring = theme.motion.springs.gentle;
  // The exit runs on the faster `snappy` spring: a removed row should clear out
  // ahead of its neighbors' glide, so the collapse leads the reflow instead of
  // lagging it. The enter stays on `gentle` to move in step with the list.
  const exitSpring = theme.motion.springs.snappy;

  const rowEnter = FadeInDown.springify()
    .damping(spring.damping)
    .stiffness(spring.stiffness)
    .mass(spring.mass);
  const rowExit = FadeOutUp.springify()
    .damping(exitSpring.damping)
    .stiffness(exitSpring.stiffness)
    .mass(exitSpring.mass);

  const glass = !!theme.material;

  return (
    <Box
      bg={glass ? undefined : 'surface'}
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
      {glass ? (
        <GlassSurface highlight={false} pointerEvents="none" style={StyleSheet.absoluteFill} />
      ) : null}
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
          <Animated.View key={key} entering={rowEnter} exiting={rowExit} layout={settle(spring)}>
            {wrapped}
          </Animated.View>
        );
      })}
    </Box>
  );
}
