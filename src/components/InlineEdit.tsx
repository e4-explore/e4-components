import React, { useRef, useState } from 'react';
import { TextInput, type StyleProp, type TextStyle, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { TextVariantName } from '../theme/tokens';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface InlineEditProps {
  value: string;
  onCommit: (value: string) => void;
  variant?: TextVariantName;
  placeholder?: string;
  /** Multi-line editing. */
  multiline?: boolean;
}

/**
 * Tap text to edit it in place — no modal, no navigation. The display text
 * and the editor share identical font metrics and padding, so the swap is
 * pixel-stable: nothing moves, the caret just appears.
 */
export function InlineEdit({
  value,
  onCommit,
  variant = 'body',
  placeholder = 'Tap to edit',
  multiline = false,
}: InlineEditProps) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<TextInput>(null);

  const v = theme.typography.variants[variant];
  // Shared metrics: any drift between these two styles would cause a visible
  // shift at the moment of the swap.
  const sharedText: TextStyle = {
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontFamily: v.face.fontFamily,
    fontWeight: v.face.fontWeight,
    color: theme.colors.ink,
    paddingVertical: theme.spacing.xxs,
    paddingHorizontal: 0,
    margin: 0,
  };

  // A multiline TextInput renders as a <textarea> on web, which defaults to a
  // browser-chosen multi-row height taller than one line of text — pushing
  // the underline below where the single-line placeholder's dashed line
  // sits. Pin it to exactly one line until real content grows it. RNW boxes
  // are border-box, so the Text's auto height (which folds in its own
  // border-bottom) only matches an explicit height here if that height
  // accounts for the border too — otherwise the input renders `regular`
  // pixels short and its border sits that much higher.
  const singleLineHeight = v.lineHeight + theme.spacing.xxs * 2 + theme.borders.regular;
  const [inputHeight, setInputHeight] = useState(singleLineHeight);

  const onContentSizeChange = (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    setInputHeight(Math.max(singleLineHeight, e.nativeEvent.contentSize.height + theme.borders.regular));
  };

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value) onCommit(next);
  };

  if (editing) {
    return (
      <TextInput
        ref={inputRef}
        autoFocus
        value={draft}
        multiline={multiline}
        onChangeText={setDraft}
        onContentSizeChange={multiline ? onContentSizeChange : undefined}
        onBlur={commit}
        onSubmitEditing={multiline ? undefined : commit}
        blurOnSubmit={!multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkFaint}
        style={[
          sharedText,
          multiline ? { height: inputHeight } : null,
          {
            borderBottomWidth: theme.borders.regular,
            borderColor: theme.colors.accent,
            outlineWidth: 0,
            outlineStyle: 'none',
            marginBottom: -theme.borders.regular,
          } as unknown as StyleProp<TextStyle>,
        ]}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Tap to edit"
      pressScale={1}
      pressOpacity={0.6}
      onPress={() => {
        setDraft(value);
        setInputHeight(singleLineHeight);
        setEditing(true);
      }}
    >
      <Text
        color={value ? 'ink' : 'inkFaint'}
        style={[
          sharedText,
          value
            ? null
            : {
                borderBottomWidth: theme.borders.regular,
                borderColor: theme.colors.inkFaint,
                borderStyle: theme.borders.sketchStyle,
                marginBottom: -theme.borders.regular,
              },
        ]}
      >
        {value || placeholder}
      </Text>
    </Pressable>
  );
}
