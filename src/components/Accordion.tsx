import React, { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';
import { Expandable } from './Expandable';
import { Icon } from '../icons/Icon';

export interface AccordionItem {
  key: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several sections open at once. */
  multiple?: boolean;
  /** Keys open initially. */
  defaultOpen?: string[];
}

function Chevron({ open }: { open: boolean }) {
  const theme = useTheme();
  const rotation = useSharedValue(open ? 90 : 0);
  useEffect(() => {
    rotation.value = withSpring(open ? 90 : 0, theme.motion.springs.snappy);
  }, [open, rotation, theme]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Animated.View style={style}>
      <Icon name="chevronRight" size={14} color="inkMuted" />
    </Animated.View>
  );
}

/** Sections that expand in place, pushing neighbors smoothly. */
export function Accordion({ items, multiple = false, defaultOpen = [] }: AccordionProps) {
  const theme = useTheme();
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpen);

  const toggle = (key: string) => {
    setOpenKeys((keys) => {
      if (keys.includes(key)) return keys.filter((k) => k !== key);
      return multiple ? [...keys, key] : [key];
    });
  };

  return (
    <Box
      rounded="lg"
      bg="surface"
      style={{ borderWidth: theme.borders.regular, borderColor: theme.colors.border, overflow: 'hidden' }}
    >
      {items.map((item, index) => {
        const open = openKeys.includes(item.key);
        return (
          <Box
            key={item.key}
            style={
              index > 0
                ? { borderTopWidth: theme.borders.thin, borderColor: theme.colors.border }
                : undefined
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              pressScale={0.995}
              onPress={() => toggle(item.key)}
            >
              <Row px="md" py="md" gap="sm">
                <Chevron open={open} />
                <Text variant="label" weight="bold">
                  {item.title}
                </Text>
              </Row>
            </Pressable>
            <Expandable open={open}>
              <Box px="md" pb="md" pl="xl">
                {typeof item.content === 'string' ? <Text color="inkMuted">{item.content}</Text> : item.content}
              </Box>
            </Expandable>
          </Box>
        );
      })}
    </Box>
  );
}
