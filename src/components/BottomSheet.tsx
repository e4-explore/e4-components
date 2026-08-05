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
import { GlassSurface } from '../primitives/GlassSurface';

/**
 * Wraps the sheet body in a blurred glass panel on glass themes (top corners
 * rounded, thick blur for a heavy over-content sheet); a passthrough otherwise.
 */
function SheetPanel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  if (!theme.material) return <>{children}</>;
  return (
    <GlassSurface
      intensity="thick"
      style={{
        borderTopLeftRadius: theme.radii.lg,
        borderTopRightRadius: theme.radii.lg,
        overflow: 'hidden',
      }}
    >
      {children}
    </GlassSurface>
  );
}

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
// Fallback for tearing the sheet down after the close animation. Reanimated's
// withSpring completion callback isn't reliably invoked on every target (it
// silently never fires under react-native-web + Vite, at least) — without a
// backstop, `mounted` sticks at `true` forever and the full-screen scrim
// Pressable stays mounted (just invisible), permanently swallowing every tap
// on the app. Sized comfortably longer than the spring should ever take to
// settle; whichever of the callback or this timer fires first wins.
const CLOSE_FALLBACK_MS = 600;

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
      return;
    }

    let closed = false;
    const finishClose = () => {
      if (closed) return;
      closed = true;
      setMounted(false);
      onClosed?.();
    };
    offset.value = withSpring(CLOSED_OFFSET, theme.motion.springs.gentle, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
    scrim.value = withTiming(0, { duration: theme.motion.durations.normal });
    const fallback = setTimeout(finishClose, CLOSE_FALLBACK_MS);
    return () => clearTimeout(fallback);
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
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              // On glass, the GlassSurface below paints the fill + edge; on flat
              // themes the panel is a solid bordered surface.
              ...(theme.material
                ? {}
                : {
                    backgroundColor: theme.colors.surface,
                    borderWidth: theme.borders.regular,
                    borderBottomWidth: 0,
                    borderColor: theme.colors.border,
                  }),
            },
            sheetStyle,
          ]}
        >
          <SheetPanel>
            <Box align="center" pt="sm">
              <Box bg="inkFaint" rounded="pill" style={{ width: 44, height: 5 }} />
            </Box>
            <Box p="lg" pb="xl">
              {children}
            </Box>
          </SheetPanel>
        </Animated.View>
      </GestureDetector>
    </Box>
  );
}
