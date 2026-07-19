import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Divider } from '../components/Divider';
import { Ticket } from '../components/Ticket';

const meta: Meta = { title: 'Components/Ticket' };
export default meta;

const entries = [
  { eyebrow: 'VV / ECONOMY OF WORDS', title: 'WRITE', index: 2037, total: 2048, code: '11111110100', reference: 'R641', tag: 'G2', meta: 'LAYERS LEN 5 INI W LV 8 BIT 8' },
  { eyebrow: 'VV / ECONOMY OF WORDS', title: 'WRONG', index: 2038, total: 2048, code: '11111110101', reference: 'R343', tag: 'G3', meta: 'LAYERS LEN 5 INI W LV 9 BIT 9' },
  { eyebrow: 'VV / ECONOMY OF WORDS', title: 'YOU', index: 2042, total: 2048, code: '11111111001', reference: 'R3', tag: 'G9', meta: 'LAYERS LEN 3 INI Y LV 6 BIT 9' },
  { eyebrow: 'VV / ECONOMY OF WORDS', title: 'ZERO', index: 2046, total: 2048, code: '11111111101', reference: 'R5', tag: 'G9', meta: 'LAYERS LEN 4 INI Z LV 13 BIT 10' },
  { eyebrow: 'VV / ECONOMY OF WORDS', title: 'ZOO', index: 2048, total: 2048, code: '11111111111', reference: 'R1', tag: 'G10', meta: 'LAYERS LEN 3 INI Z LV 12 BIT 11' },
];

export const Manifest: StoryObj = {
  render: () => (
    <Stack gap="md">
      {entries.map((entry, i) => (
        <React.Fragment key={entry.title}>
          <Ticket {...entry} />
          {i < entries.length - 1 ? <Divider /> : null}
        </React.Fragment>
      ))}
    </Stack>
  ),
};

export const SingleTicket: StoryObj = {
  render: () => <Ticket {...entries[0]} />,
};
