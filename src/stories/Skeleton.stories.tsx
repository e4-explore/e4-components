import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Skeleton, SkeletonRow } from '../components/Skeleton';
import { Stack, Row } from '../primitives/Stack';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    width: 200,
    height: 16,
    round: false,
  },
  argTypes: {
    width: { control: { type: 'range', min: 40, max: 320, step: 10 } },
    height: { control: { type: 'range', min: 8, max: 80, step: 4 } },
    round: { control: 'boolean' },
    radius: { control: { type: 'range', min: 0, max: 24, step: 2 } },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LoadingRows: Story = {
  render: () => (
    <Stack gap="lg">
      <Stack gap="none">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </Stack>
      <Row gap="md">
        <Skeleton round height={56} />
        <Skeleton height={56} width={120} radius={12} />
        <Skeleton height={56} width={80} />
      </Row>
    </Stack>
  ),
};
