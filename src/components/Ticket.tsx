import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row, Stack } from '../primitives/Stack';
import { Icon } from '../icons/Icon';

export interface TicketProps {
  /** Small classification line above the title, e.g. "VV / ECONOMY OF WORDS". */
  eyebrow: string;
  /** The large ledger word, e.g. "WRITE". */
  title: string;
  /** Position within the set, rendered "#current/total". */
  index: number;
  total: number;
  /** Binary-looking identifier printed next to the barcode, e.g. "11111110100". */
  code: string;
  /** Short reference suffix, e.g. "R641". */
  reference: string;
  /** Shows a filled checkmark badge before the tag. */
  verified?: boolean;
  /** Small solid tag chip, e.g. "G2". */
  tag: string;
  /** Footer left column, e.g. "LAYERS LEN 5 INI W LV 8 BIT 8". */
  meta: string;
  /** Footer right column, e.g. "ONE OF ONE". */
  detail?: string;
}

/**
 * A single ledger/manifest entry: eyebrow + index, a large title, a
 * barcode-and-reference row with verification tag, and a footer meta line.
 * Matches the manifest theme's ticket-stub aesthetic — built for dense,
 * tabular lists of scanned or catalogued items.
 */
export function Ticket({
  eyebrow,
  title,
  index,
  total,
  code,
  reference,
  verified = true,
  tag,
  meta,
  detail = 'ONE OF ONE',
}: TicketProps) {
  const theme = useTheme();
  return (
    <Stack gap="xs">
      <Row justify="space-between">
        <Text variant="caption" color="inkMuted">
          {eyebrow}
        </Text>
        <Text variant="caption" color="inkMuted">
          #{index.toLocaleString()}/{total.toLocaleString()}
        </Text>
      </Row>

      <Text variant="display">{title}</Text>

      <Row gap="sm" justify="space-between">
        <Row gap="sm" style={{ flexShrink: 1 }}>
          <Barcode seed={code} />
          <Text variant="body" style={{ letterSpacing: 1 }}>
            {code} {reference}
          </Text>
        </Row>
        <Row gap="xs">
          {verified ? (
            <Box
              rounded="pill"
              align="center"
              justify="center"
              bg="ink"
              style={{ width: 20, height: 20 }}
            >
              <Icon name="check" size={12} color={theme.colors.surface} />
            </Box>
          ) : null}
          <Box bg="ink" px="xs" py="xxs" rounded="sm">
            <Text variant="label" color="surface">
              {tag}
            </Text>
          </Box>
        </Row>
      </Row>

      <Box
        style={{ borderTopWidth: theme.borders.thin, borderColor: theme.colors.border, opacity: 0.35 }}
        pt="xs"
      >
        <Row justify="space-between">
          <Text variant="caption" color="inkFaint">
            {meta}
          </Text>
          <Text variant="caption" color="inkFaint">
            {detail}
          </Text>
        </Row>
      </Box>
    </Stack>
  );
}

/** Deterministic decorative barcode — bar widths hashed from `seed`, not a real symbology. */
function Barcode({ seed }: { seed: string }) {
  const theme = useTheme();
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const bars = Array.from({ length: 9 }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    const wide = (h >> (i % 24)) % 3 === 0;
    return wide ? 3 : 1.5;
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', height: 16, gap: 1 }}>
      {bars.map((w, i) => (
        <View key={i} style={{ width: w, backgroundColor: theme.colors.ink }} />
      ))}
    </View>
  );
}
