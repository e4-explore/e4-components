import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View, type ViewProps } from 'react-native';

export interface DismissKeyboardProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * Wraps a screen so that tapping anywhere outside a focused input blurs it and
 * dismisses the keyboard. Taps that land on an interactive child (buttons,
 * inputs, etc.) are handled by that child and never reach here, so this only
 * fires on "empty" background taps.
 *
 * Mount it as the screen's outermost flex container. `Keyboard.dismiss()` blurs
 * the active TextInput, which drives Input's focus state back to its resting
 * look — no more stranded, still-selected fields.
 */
export function DismissKeyboard({ children, style, ...rest }: DismissKeyboardProps) {
  return (
    <TouchableWithoutFeedback accessible={false} onPress={() => Keyboard.dismiss()}>
      <View style={[{ flex: 1 }, style]} {...rest}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
