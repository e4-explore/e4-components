import React, { useState } from 'react';
import type { LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';
import { GlassSurface } from '../primitives/GlassSurface';
import { Icon, type IconName } from '../icons/Icon';

export interface TabItem<T extends string> {
  key: T;
  label: string;
  /** Optional icon shown above the label. */
  icon?: IconName;
}

export interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  /**
   * Detach the bar from the screen edges so it reads as a floating card —
   * inset margins, rounded corners, a border, and a lifted shadow. Defaults
   * to `true`; pass `false` for the flush, full-bleed look.
   */
  floating?: boolean;
}

/**
 * Tab bar with a sliding ink indicator: the highlight pill springs between
 * tabs rather than teleporting.
 */
export function TabBar<T extends string>({ tabs, active, onChange, floating = true }: TabBarProps<T>) {
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

  const bar = (
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
                {tab.icon ? <Icon name={tab.icon} size={18} color={isActive ? 'ink' : 'inkFaint'} /> : null}
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
  );

  // Glass floating bar: a blurred, translucent pill that hovers over content.
  if (floating && theme.material) {
    return (
      <Box mx="md" mb="md" style={{ borderRadius: theme.radii.lg, ...theme.shadows.lifted }}>
        <GlassSurface style={{ borderRadius: theme.radii.lg, overflow: 'hidden' }}>
          {bar}
        </GlassSurface>
      </Box>
    );
  }

  return (
    <Box
      bg="surface"
      mx={floating ? 'md' : undefined}
      mb={floating ? 'md' : undefined}
      rounded={floating ? 'lg' : undefined}
      border={floating ? theme.borders.thick : undefined}
      borderColor="borderStrong"
      shadow={floating ? 'lifted' : undefined}
    >
      {bar}
    </Box>
  );
}
