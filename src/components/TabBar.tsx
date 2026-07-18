import React, { useState } from 'react';
import type { LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';

export interface TabItem<T extends string> {
  key: T;
  label: string;
  /** Optional glyph shown above the label. */
  icon?: string;
}

export interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
}

/**
 * Tab bar with a sliding ink indicator: the highlight pill springs between
 * tabs rather than teleporting.
 */
export function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
  const theme = useTheme();
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const target = layouts[active];
  const spring = theme.motion.springs.snappy;

  const indicatorStyle = useAnimatedStyle(() => {
    if (!target) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [{ translateX: withSpring(target.x, spring) }],
      width: withSpring(target.width, spring),
    };
  }, [target]);

  return (
    <Box
      bg="surface"
      style={{
        borderTopWidth: theme.borders.regular,
        borderColor: theme.colors.border,
      }}
    >
      <Row gap="none" px="sm" py="sm" style={{ position: 'relative' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: theme.spacing.sm,
              bottom: theme.spacing.sm,
              left: 0,
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.surfaceAlt,
              borderWidth: theme.borders.regular,
              borderColor: theme.colors.border,
            },
            indicatorStyle,
          ]}
        />
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              pressScale={0.96}
              onPress={() => onChange(tab.key)}
              style={{ flex: 1 }}
              onLayout={(e) =>
                setLayouts((prev) => ({ ...prev, [tab.key]: e.nativeEvent.layout }))
              }
            >
              <Box py="xs" align="center" gap="xxs">
                {tab.icon ? (
                  <Text style={{ fontSize: 18, lineHeight: 22 }} color={isActive ? 'ink' : 'inkFaint'}>
                    {tab.icon}
                  </Text>
                ) : null}
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? 'ink' : 'inkMuted'}
                >
                  {tab.label}
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </Row>
    </Box>
  );
}
