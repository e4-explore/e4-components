import React from 'react';
import { View } from 'react-native';
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
