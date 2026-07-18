import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export interface AvatarProps {
  /** Full name — initials are derived. */
  name?: string;
  source?: ImageSourcePropType;
  size?: number;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Circle avatar. With no image it shows initials — or a crossed circle, the classic wireframe portrait stub. */
export function Avatar({ name, source, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const radius = size / 2;

  return (
    <Box
      accessibilityLabel={name}
      bg="surfaceAlt"
      align="center"
      justify="center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      {source ? (
        <Image source={source} style={{ width: size, height: size }} />
      ) : name ? (
        <Text weight="bold" style={{ fontSize: size * 0.38, lineHeight: size * 0.5 }}>
          {initialsOf(name)}
        </Text>
      ) : (
        <Text color="inkFaint" style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>
          ✕
        </Text>
      )}
    </Box>
  );
}
