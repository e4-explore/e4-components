import React, { useEffect, useState } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * Fires once the close animation has fully settled (not the moment `open`
   * flips false). Lets a host keep the sheet mounted through its slide-down,
   * then tear it down — e.g. an overlay entry that unregisters afterwards.
   */
  onClosed?: () => void;
  children: React.ReactNode;
}

const CLOSED_OFFSET = 600;

/**
 * Bottom sheet that springs up from the edge; drag it down (or tap the scrim)
 * to dismiss. Fills its nearest positioned ancestor — mount it at screen root.
 */
export function BottomSheet({ open, onClose, onClosed, children }: BottomSheetProps) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(open);
  const offset = useSharedValue(CLOSED_OFFSET);
  const scrim = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      offset.value = withSpring(0, theme.motion.springs.gentle);
      scrim.value = withTiming(1, { duration: theme.motion.durations.normal });
    } else {
      offset.value = withSpring(CLOSED_OFFSET, theme.motion.springs.gentle, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
          if (onClosed) runOnJS(onClosed)();
        }
      });
      scrim.value = withTiming(0, { duration: theme.motion.durations.normal });
    }
    // `onClosed` is intentionally excluded: it's captured at the render that
    // flips `open` false (the correct one), and adding it would re-run the
    // animation whenever the callback's identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, offset, scrim, theme]);

  const drag = Gesture.Pan()
    .onUpdate((e) => {
      // Resist upward drags, follow downward ones.
      offset.value = e.translationY > 0 ? e.translationY : e.translationY / 8;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        runOnJS(onClose)();
      } else {
        offset.value = withSpring(0, theme.motion.springs.snappy);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  if (!mounted) return null;

  return (
    <Box style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
        <RNPressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        />
      </Animated.View>
      <GestureDetector gesture={drag}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              borderWidth: theme.borders.regular,
              borderBottomWidth: 0,
              borderColor: theme.colors.border,
            },
            sheetStyle,
          ]}
        >
          <Box align="center" pt="sm">
            <Box
              bg="inkFaint"
              rounded="pill"
              style={{ width: 44, height: 5 }}
            />
          </Box>
          <Box p="lg" pb="xl">
            {children}
          </Box>
        </Animated.View>
      </GestureDetector>
    </Box>
  );
}
