import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ProgressBar } from '../components/ProgressBar';
import { Stack, Row } from '../primitives/Stack';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: {
    progress: 0.35,
    label: 'Uploading wireframes',
    showValue: true,
    height: 14,
  },
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
    height: { control: { type: 'range', min: 6, max: 32, step: 2 } },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ProgressBar {...args} label={args.label || undefined} />,
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0.35);
    return (
      <Stack gap="lg">
        <ProgressBar progress={progress} label="Uploading wireframes" showValue />
        <Row>
          <Button
            label="More progress"
            size="sm"
            variant="secondary"
            onPress={() => setProgress((p) => (p >= 1 ? 0.1 : p + 0.25))}
          />
        </Row>
      </Stack>
    );
  },
};
