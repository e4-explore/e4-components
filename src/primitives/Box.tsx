import React from 'react';
import { View, type ViewProps, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme, ThemeColors, ThemeSpacing, ThemeRadii } from '../theme/tokens';

export type SpaceValue = keyof ThemeSpacing | number;
export type ColorValue = keyof ThemeColors | (string & {});
export type RadiusValue = keyof ThemeRadii | number;

export function resolveSpace(theme: Theme, value: SpaceValue | undefined): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? value : theme.spacing[value];
}

export function resolveColor(theme: Theme, value: ColorValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value in theme.colors ? theme.colors[value as keyof ThemeColors] : (value as string);
}

export function resolveRadius(theme: Theme, value: RadiusValue | undefined): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? value : theme.radii[value];
}

export interface BoxProps extends ViewProps {
  /** Padding shorthands — theme spacing keys or raw numbers. */
  p?: SpaceValue;
  px?: SpaceValue;
  py?: SpaceValue;
  pt?: SpaceValue;
  pb?: SpaceValue;
  pl?: SpaceValue;
  pr?: SpaceValue;
  /** Margin shorthands. */
  m?: SpaceValue;
  mx?: SpaceValue;
  my?: SpaceValue;
  mt?: SpaceValue;
  mb?: SpaceValue;
  ml?: SpaceValue;
  mr?: SpaceValue;
  /** Background — theme color key or raw color string. */
  bg?: ColorValue;
  /** Border radius — theme radius key or raw number. */
  rounded?: RadiusValue;
  /** Draw a border. `true` = regular width; or pass a width number. */
  border?: boolean | number;
  borderColor?: ColorValue;
  borderStyle?: ViewStyle['borderStyle'];
  /** Hard offset shadow from the theme. */
  shadow?: 'card' | 'lifted';
  flex?: number;
  row?: boolean;
  wrap?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  alignSelf?: ViewStyle['alignSelf'];
  gap?: SpaceValue;
  style?: StyleProp<ViewStyle>;
}

export function useBoxStyle(props: BoxProps): ViewStyle {
  const theme = useTheme();
  const s: ViewStyle = {};
  const sp = (v: SpaceValue | undefined) => resolveSpace(theme, v);

  if (props.p !== undefined) s.padding = sp(props.p);
  if (props.px !== undefined) s.paddingHorizontal = sp(props.px);
  if (props.py !== undefined) s.paddingVertical = sp(props.py);
  if (props.pt !== undefined) s.paddingTop = sp(props.pt);
  if (props.pb !== undefined) s.paddingBottom = sp(props.pb);
  if (props.pl !== undefined) s.paddingLeft = sp(props.pl);
  if (props.pr !== undefined) s.paddingRight = sp(props.pr);
  if (props.m !== undefined) s.margin = sp(props.m);
  if (props.mx !== undefined) s.marginHorizontal = sp(props.mx);
  if (props.my !== undefined) s.marginVertical = sp(props.my);
  if (props.mt !== undefined) s.marginTop = sp(props.mt);
  if (props.mb !== undefined) s.marginBottom = sp(props.mb);
  if (props.ml !== undefined) s.marginLeft = sp(props.ml);
  if (props.mr !== undefined) s.marginRight = sp(props.mr);
  if (props.bg !== undefined) s.backgroundColor = resolveColor(theme, props.bg);
  if (props.rounded !== undefined) s.borderRadius = resolveRadius(theme, props.rounded);
  if (props.border) {
    s.borderWidth = props.border === true ? theme.borders.regular : props.border;
    s.borderColor = resolveColor(theme, props.borderColor) ?? theme.colors.border;
  }
  if (props.borderStyle) s.borderStyle = props.borderStyle;
  if (props.shadow) Object.assign(s, theme.shadows[props.shadow]);
  if (props.flex !== undefined) s.flex = props.flex;
  if (props.row) s.flexDirection = 'row';
  if (props.wrap) s.flexWrap = 'wrap';
  if (props.align) s.alignItems = props.align;
  if (props.justify) s.justifyContent = props.justify;
  if (props.alignSelf) s.alignSelf = props.alignSelf;
  if (props.gap !== undefined) s.gap = sp(props.gap);
  return s;
}

const BOX_PROP_KEYS = [
  'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr',
  'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
  'bg', 'rounded', 'border', 'borderColor', 'borderStyle', 'shadow',
  'flex', 'row', 'wrap', 'align', 'justify', 'alignSelf', 'gap',
] as const;

export function splitBoxProps<P extends BoxProps>(props: P) {
  const box: BoxProps = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((BOX_PROP_KEYS as readonly string[]).includes(key)) {
      (box as Record<string, unknown>)[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return { box, rest: rest as Omit<P, (typeof BOX_PROP_KEYS)[number]> };
}

/** The universal container. A View with token-aware style props. */
export const Box = React.forwardRef<View, BoxProps>(function Box(props, ref) {
  const { box, rest } = splitBoxProps(props);
  const { style, ...viewProps } = rest as ViewProps & { style?: StyleProp<ViewStyle> };
  const boxStyle = useBoxStyle(box);
  return <View ref={ref} {...viewProps} style={[boxStyle, style]} />;
});
