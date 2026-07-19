import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, type View } from 'react-native';
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
import { BottomSheet } from './BottomSheet';

/**
 * Below this viewport width the options open in a bottom sheet instead of an
 * anchored dropdown. Phones (portrait ~360–430pt) get the sheet; tablets and
 * web keep the dropdown. The sheet path needs no `measureInWindow`, which is
 * why it also sidesteps the native trigger-measurement positioning issues the
 * anchored dropdown is prone to on a soft-keyboard-resized window.
 */
const SHEET_MAX_WIDTH = 600;

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
  const { width: viewportWidth } = useWindowDimensions();
  const useSheet = viewportWidth < SHEET_MAX_WIDTH;
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

  // Sheet variant (narrow viewports): options in a dismissible bottom sheet.
  // No trigger measurement — the sheet anchors itself to the screen edge.
  const renderSheet = () => (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      onClosed={() => {
        if (overlayIdRef.current !== null) {
          overlay.hide(overlayIdRef.current);
          overlayIdRef.current = null;
        }
      }}
    >
      {placeholder ? (
        <Box pb="sm">
          <Text variant="heading">{placeholder}</Text>
        </Box>
      ) : null}
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
            <Row py="md" justify="space-between">
              <Text weight={isSelected ? 'bold' : 'regular'}>{option.label}</Text>
              {isSelected ? <Icon name="check" size={16} /> : null}
            </Row>
          </Pressable>
        );
      })}
    </BottomSheet>
  );

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

  // Open/close. Sheet path: register a full-layer entry and let the sheet
  // manage its own dismissal (it unregisters via onClosed once its slide-down
  // finishes, so the exit animation isn't cut off). Dropdown path: measure the
  // trigger's screen position and register a floating panel anchored under it,
  // hidden again on close.
  useEffect(() => {
    if (!open) return;
    if (useSheet) {
      overlayIdRef.current = overlay.show({ x: 0, y: 0, width: 0, fill: true }, renderSheet);
      return;
    }
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
  }, [open, useSheet]);

  // Keep the registered entry's rendered content current: as options/value
  // change, and — crucially for the sheet — so it sees `open` flip to false
  // and can animate out. Runs while any entry is registered (the overlay host
  // only re-invokes the render function currently registered).
  useEffect(() => {
    if (overlayIdRef.current !== null) {
      overlay.update(overlayIdRef.current, { render: useSheet ? renderSheet : renderPanel });
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
