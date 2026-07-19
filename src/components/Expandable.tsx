import React, { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export interface ExpandableProps {
  open: boolean;
  children: React.ReactNode;
}

/**
 * In-place expansion engine. Measures its content and springs the container
 * height between 0 and the measured size, so content below is *pushed*
 * continuously — never a jump-cut. Powers Select, Accordion, and anything
 * that grows inline.
 */
export function Expandable({ open, children }: ExpandableProps) {
  const theme = useTheme();
  const [measured, setMeasured] = useState(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const target = open ? measured : 0;
  useDerivedValue(() => {
    height.value = withSpring(target, theme.motion.springs.gentle);
    // Content fades in/out faster than the height settles, so the still-
    // growing container reads as content gently emerging rather than a hard
    // edge slicing through not-yet-revealed text.
    opacity.value = withTiming(open ? 1 : 0, { duration: theme.motion.durations.fast });
  }, [target]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden' as const,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== measured) setMeasured(h);
  };

  return (
    <Animated.View style={containerStyle}>
      <Animated.View
        style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, contentStyle]}
        onLayout={onLayout}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
