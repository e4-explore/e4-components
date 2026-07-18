import React, { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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

  const target = open ? measured : 0;
  useDerivedValue(() => {
    height.value = withSpring(target, theme.motion.springs.gentle);
  }, [target]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden' as const,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== measured) setMeasured(h);
  };

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
        onLayout={onLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
}
