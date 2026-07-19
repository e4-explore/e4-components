import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';

interface Hole extends Record<string, unknown> {
  hole: number;
  par: number;
  score: number;
  result: string;
}

const data: Hole[] = [
  { hole: 1, par: 4, score: 4, result: 'Par' },
  { hole: 2, par: 3, score: 2, result: 'Birdie' },
  { hole: 3, par: 5, score: 6, result: 'Bogey' },
  { hole: 4, par: 4, score: 4, result: 'Par' },
];

const meta = {
  title: 'Components/Table',
  component: Table<Hole>,
  args: {
    columns: [],
    data,
    keyExtractor: (row) => String(row.hole),
  },
  argTypes: {
    columns: { control: false },
    data: { control: false },
    keyExtractor: { control: false },
  },
} satisfies Meta<typeof Table<Hole>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Table
      keyExtractor={(row) => String(row.hole)}
      data={data}
      columns={[
        { key: 'hole', title: 'Hole', flex: 1 },
        { key: 'par', title: 'Par', flex: 1, align: 'center' },
        { key: 'score', title: 'Score', flex: 1, align: 'center' },
        {
          key: 'result',
          title: 'Result',
          flex: 2,
          render: (row) => (
            <Badge
              label={String(row.result)}
              tone={row.result === 'Birdie' ? 'success' : row.result === 'Bogey' ? 'warning' : 'neutral'}
            />
          ),
        },
      ]}
    />
  ),
};
