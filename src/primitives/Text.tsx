import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { TextVariantName } from '../theme/tokens';
import { resolveColor, type ColorValue } from './Box';

export interface TextProps extends RNTextProps {
  variant?: TextVariantName;
  /** Theme color key or raw color. Defaults to ink. */
  color?: ColorValue;
  /** Override the variant's face weight. */
  weight?: 'regular' | 'medium' | 'bold';
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

export function Text({
  variant = 'body',
  color = 'ink',
  weight,
  align,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const v = theme.typography.variants[variant];
  const face = weight ? theme.typography.faces[weight] : v.face;
  const base: TextStyle = {
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontFamily: face.fontFamily,
    fontWeight: face.fontWeight,
    color: resolveColor(theme, color),
  };
  if (v.letterSpacing !== undefined) base.letterSpacing = v.letterSpacing;
  if (v.textTransform !== undefined) base.textTransform = v.textTransform;
  if (align) base.textAlign = align;
  return <RNText {...rest} style={[base, style]} />;
}
