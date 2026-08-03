import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { resolveColor, type ColorValue } from '../primitives/Box';

export type IconName =
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'check'
  | 'close'
  | 'grip'
  | 'home'
  | 'search'
  | 'chart'
  | 'smile'
  | 'edit';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

/**
 * A small hand-drawn-feeling icon set built entirely from plain Views
 * (rotated bars, border-corner chevrons, dot grids) — no SVG dependency,
 * so consuming apps don't need to add react-native-svg on top of Reanimated
 * and Gesture Handler. Unlike Unicode glyphs (⌂ ▤ ⠿ …), every icon here is
 * guaranteed to render identically everywhere, independent of font/emoji
 * fallback coverage.
 */
export function Icon({ name, size = 18, color = 'ink' }: IconProps) {
  const theme = useTheme();
  const resolved = resolveColor(theme, color) ?? theme.colors.ink;
  // Ledger (the manifest theme) swaps the hand-drawn set for the crisp Carbon
  // Design System glyphs — a better fit for its ledger/ticket aesthetic. Every
  // other theme keeps the wireframe glyphs drawn from plain Views below.
  if (theme.name === 'manifest') {
    return <CarbonGlyph name={name} size={size} color={resolved} />;
  }
  switch (name) {
    case 'chevronLeft':
      return <Chevron size={size} color={resolved} direction="left" />;
    case 'chevronRight':
      return <Chevron size={size} color={resolved} direction="right" />;
    case 'chevronDown':
      return <Chevron size={size} color={resolved} direction="down" />;
    case 'check':
      return <Check size={size} color={resolved} />;
    case 'close':
      return <Close size={size} color={resolved} />;
    case 'grip':
      return <Grip size={size} color={resolved} />;
    case 'home':
      return <Home size={size} color={resolved} />;
    case 'search':
      return <Search size={size} color={resolved} />;
    case 'chart':
      return <Chart size={size} color={resolved} />;
    case 'smile':
      return <Smile size={size} color={resolved} />;
    case 'edit':
      return <Edit size={size} color={resolved} />;
  }
}

// Carbon Design System glyphs (Apache-2.0, sourced from @carbon/icons on a
// 32×32 grid), used by the Ledger theme via <CarbonGlyph>. Each entry is the
// icon's raw SVG path data — one string per <path>.
// https://carbondesignsystem.com/elements/icons/library
const CARBON_PATHS: Record<IconName, string[]> = {
  chevronLeft: ['M10 16 20 6 21.4 7.4 12.8 16 21.4 24.6 20 26z'],
  chevronRight: ['M22 16 12 26 10.6 24.6 19.2 16 10.6 7.4 12 6z'],
  chevronDown: ['M16 22 6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z'],
  check: ['M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z'],
  close: [
    'M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z',
  ],
  grip: [
    'M10 6H14V10H10z',
    'M18 6H22V10H18z',
    'M10 14H14V18H10z',
    'M18 14H22V18H18z',
    'M10 22H14V26H10z',
    'M18 22H22V26H18z',
  ],
  home: [
    'M16.6123,2.2138a1.01,1.01,0,0,0-1.2427,0L1,13.4194l1.2427,1.5717L4,13.6209V26a2.0041,2.0041,0,0,0,2,2H26a2.0037,2.0037,0,0,0,2-2V13.63L29.7573,15,31,13.4282ZM18,26H14V18h4Zm2,0V18a2.0023,2.0023,0,0,0-2-2H14a2.002,2.002,0,0,0-2,2v8H6V12.0615l10-7.79,10,7.8005V26Z',
  ],
  search: [
    'M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z',
  ],
  chart: ['M27,28V6H19V28H15V14H7V28H4V2H2V28a2,2,0,0,0,2,2H30V28ZM13,28H9V16h4Zm12,0H21V8h4Z'],
  smile: [
    'M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z',
    'M11.5,11A2.5,2.5,0,1,0,14,13.5,2.48,2.48,0,0,0,11.5,11Z',
    'M20.5,11A2.5,2.5,0,1,0,23,13.5,2.48,2.48,0,0,0,20.5,11Z',
    'M16,24a8,8,0,0,0,6.85-3.89l-1.71-1a6,6,0,0,1-10.28,0l-1.71,1A8,8,0,0,0,16,24Z',
  ],
  edit: [
    'M2 26H30V28H2z',
    'M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6 l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z',
  ],
};

function CarbonGlyph({ name, size, color }: { name: IconName; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {CARBON_PATHS[name].map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

const ROTATE: Record<'left' | 'right' | 'down' | 'up', string> = {
  right: '-45deg',
  left: '135deg',
  down: '45deg',
  up: '-135deg',
};

function Chevron({ size, color, direction }: { size: number; color: string; direction: 'left' | 'right' | 'down' }) {
  const stroke = Math.max(2, size / 8);
  const arm = size * 0.5;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: arm,
          height: arm,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          borderBottomRightRadius: stroke / 2,
          transform: [{ rotate: ROTATE[direction] }],
        }}
      />
    </View>
  );
}

function Check({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size / 9);
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.12,
          top: size * 0.46,
          width: size * 0.32,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.32,
          top: size * 0.22,
          width: size * 0.6,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '-52deg' }],
        }}
      />
    </View>
  );
}

function Close({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size / 9);
  const len = size * 0.66;
  const base = {
    position: 'absolute' as const,
    left: (size - len) / 2,
    top: (size - stroke) / 2,
    width: len,
    height: stroke,
    backgroundColor: color,
    borderRadius: stroke / 2,
  };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[base, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[base, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

function Grip({ size, color }: { size: number; color: string }) {
  const dot = Math.max(2.5, size / 7);
  const gapX = size * 0.32;
  const gapY = size * 0.28;
  const cx = size / 2;
  const cy = size / 2;
  const positions: Array<[number, number]> = [
    [-gapX / 2, -gapY],
    [gapX / 2, -gapY],
    [-gapX / 2, 0],
    [gapX / 2, 0],
    [-gapX / 2, gapY],
    [gapX / 2, gapY],
  ];
  return (
    <View style={{ width: size, height: size }}>
      {positions.map(([dx, dy], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: color,
            left: cx + dx - dot / 2,
            top: cy + dy - dot / 2,
          }}
        />
      ))}
    </View>
  );
}

function Home({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size / 9);
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.06,
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.34,
          borderRightWidth: size * 0.34,
          borderBottomWidth: size * 0.32,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          width: size * 0.5,
          height: size * 0.44,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
        }}
      />
    </View>
  );
}

function Search({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size / 9);
  const circle = size * 0.6;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.04,
          top: size * 0.02,
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.04,
          bottom: size * 0.06,
          width: size * 0.3,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function Chart({ size, color }: { size: number; color: string }) {
  const w = Math.max(2.5, size / 6);
  const heights = [size * 0.4, size * 0.72, size * 0.56];
  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: w * 0.7,
      }}
    >
      {heights.map((h, i) => (
        <View key={i} style={{ width: w, height: h, backgroundColor: color, borderRadius: 1.5 }} />
      ))}
    </View>
  );
}

function Smile({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size / 10);
  const circle = size * 0.78;
  const eye = Math.max(1.6, size / 10);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: circle, height: circle, borderRadius: circle / 2, borderWidth: stroke, borderColor: color }} />
      <View
        style={{
          position: 'absolute',
          width: eye,
          height: eye,
          borderRadius: eye / 2,
          backgroundColor: color,
          left: size * 0.32,
          top: size * 0.36,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: eye,
          height: eye,
          borderRadius: eye / 2,
          backgroundColor: color,
          right: size * 0.32,
          top: size * 0.36,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.3,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          bottom: size * 0.26,
        }}
      />
    </View>
  );
}

function Edit({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2.4, size / 8);
  const len = size * 0.62;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.2,
          top: size * 0.46,
          width: len,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.1,
          top: size * 0.64,
          width: 0,
          height: 0,
          borderLeftWidth: stroke * 0.9,
          borderRightWidth: stroke * 0.9,
          borderTopWidth: stroke * 1.4,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}
