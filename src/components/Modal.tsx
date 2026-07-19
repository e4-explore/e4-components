import React, { useEffect, useState } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import { Icon } from '../icons/Icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Cap the panel width — content still scrolls naturally if it's taller than the viewport. */
  maxWidth?: number;
  children: React.ReactNode;
}

/**
 * Centered dialog that scales+fades in over a scrim; tap the scrim or the
 * close button to dismiss. Mount at screen root, same as BottomSheet.
 */
export function Modal({ open, onClose, title, maxWidth = 480, children }: ModalProps) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(open);
  const scale = useSharedValue(0.95);
  const scrim = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      scale.value = withSpring(1, theme.motion.springs.gentle);
      scrim.value = withTiming(1, { duration: theme.motion.durations.normal });
    } else {
      scale.value = withSpring(0.95, theme.motion.springs.gentle);
      scrim.value = withTiming(0, { duration: theme.motion.durations.normal }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [open, scale, scrim, theme]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scrim.value,
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  if (!mounted) return null;

  return (
    <Box style={StyleSheet.absoluteFill} pointerEvents="box-none" align="center" justify="center">
      <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
        <RNPressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            width: '90%',
            maxWidth,
            maxHeight: '85%',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            borderWidth: theme.borders.regular,
            borderColor: theme.colors.border,
          },
          panelStyle,
        ]}
      >
        {title ? (
          <Row p="lg" pb="md" align="center" justify="space-between">
            <Text variant="heading">{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={8}>
              <Icon name="close" size={18} />
            </Pressable>
          </Row>
        ) : null}
        <Box p="lg" pt={title ? undefined : 'lg'} style={{ flexShrink: 1 }}>
          {children}
        </Box>
      </Animated.View>
    </Box>
  );
}
