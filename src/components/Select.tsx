import React, { useEffect, useRef, useState } from 'react';
import type { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { Box } from '../primitives/Box';
import { Icon } from '../icons/Icon';
import { useOverlay } from '../overlay/OverlayHost';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

interface MeasurableView extends View {
  measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) => void;
}

/**
 * Select with a floating options panel: it overlays the content below the
 * trigger instead of pushing it down. Chevron rotates with the state.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  invalid = false,
  disabled = false,
}: SelectProps<T>) {
  const theme = useTheme();
  const overlay = useOverlay();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const overlayIdRef = useRef<number | null>(null);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(open ? 180 : 0, theme.motion.springs.snappy);
  }, [open, rotation, theme]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const selected = options.find((o) => o.value === value);

  const renderPanel = () => (
    <Animated.View
      entering={FadeInDown.duration(160)}
      exiting={FadeOutUp.duration(120)}
      style={{
        marginTop: theme.spacing.xs,
        borderRadius: theme.radii.md,
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.borderStrong,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        ...theme.shadows.lifted,
      }}
    >
      <Box pt="xs" pb="xs">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="menuitem"
              pressScale={0.99}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <Row px="md" py="sm" justify="space-between">
                <Text weight={isSelected ? 'bold' : 'regular'}>{option.label}</Text>
                {isSelected ? <Icon name="check" size={15} /> : null}
              </Row>
            </Pressable>
          );
        })}
      </Box>
    </Animated.View>
  );

  // Open/close: measure the trigger's screen position and register the
  // floating panel with the overlay host, which paints above everything
  // else regardless of what follows the Select in the layout.
  useEffect(() => {
    if (!open) return;
    const node = triggerRef.current as MeasurableView | null;
    if (!node) return;
    node.measureInWindow((x, y, width, height) => {
      overlayIdRef.current = overlay.show({ x, y: y + height, width }, renderPanel);
    });
    return () => {
      if (overlayIdRef.current !== null) {
        overlay.hide(overlayIdRef.current);
        overlayIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the panel's rendered content current if options/value/onChange
  // change while it's open (the overlay host only re-invokes whatever
  // render function is currently registered, so it needs refreshing).
  useEffect(() => {
    if (open && overlayIdRef.current !== null) {
      overlay.update(overlayIdRef.current, { render: renderPanel });
    }
  });

  return (
    <Box ref={triggerRef as never} rounded="md" style={{ position: 'relative' }}>
      <Box
        rounded="md"
        style={{
          borderWidth: theme.borders.regular,
          borderColor: invalid
            ? theme.colors.danger
            : open
              ? theme.colors.borderStrong
              : theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: disabled ? 0.6 : 1,
          ...(open ? theme.shadows.card : theme.shadows.none),
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          pressScale={1}
          onPress={() => setOpen((o) => !o)}
        >
          <Row px="md" justify="space-between" style={{ minHeight: 46 }}>
            <Text color={selected ? 'ink' : 'inkFaint'}>{selected?.label ?? placeholder}</Text>
            <Animated.View style={chevronStyle}>
              <Icon name="chevronDown" size={14} color="inkMuted" />
            </Animated.View>
          </Row>
        </Pressable>
      </Box>
    </Box>
  );
}
