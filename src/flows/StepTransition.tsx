import React, { useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export type StepDirection = 'forward' | 'back';

/**
 * Step state for a flow: which screen is showing and which way the next
 * transition should slide. `go` pushes forward, `back` returns.
 */
export function useSteps<S extends string>(initial: S) {
  const [state, setState] = useState<{ step: S; direction: StepDirection }>({
    step: initial,
    direction: 'forward',
  });
  const go = (step: S) => setState({ step, direction: 'forward' });
  const back = (step: S) => setState({ step, direction: 'back' });
  return { step: state.step, direction: state.direction, go, back };
}

export interface StepTransitionProps {
  /** Identity of the current step; changing it triggers the transition. */
  stepKey: string;
  direction?: StepDirection;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Screen-to-screen transition for flows: on native the incoming step springs
 * in from the side (right going forward, left going back) while the outgoing
 * one fades underneath; on web it's a calm crossfade — timer-driven fades
 * recover gracefully in frame-throttled tabs, where a mid-flight slide would
 * leave the screen parked half-way.
 * No navigation library required: give the container room (it must resolve to
 * a real height, e.g. inside a flex:1 screen) and swap `stepKey`.
 */
export function StepTransition({
  stepKey,
  direction = 'forward',
  children,
  style,
}: StepTransitionProps) {
  const theme = useTheme();
  const spring = theme.motion.springs.gentle;
  const entering =
    Platform.OS === 'web'
      ? FadeIn.duration(theme.motion.durations.normal)
      : (direction === 'back' ? SlideInLeft : SlideInRight)
          .springify()
          .damping(spring.damping)
          .stiffness(spring.stiffness);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <Animated.View
        key={stepKey}
        entering={entering}
        exiting={FadeOut.duration(theme.motion.durations.fast)}
        style={StyleSheet.absoluteFill}
      >
        {children}
      </Animated.View>
    </View>
  );
}
