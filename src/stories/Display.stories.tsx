import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Divider } from '../components/Divider';
import { EmptyState } from '../components/EmptyState';
import { Skeleton, SkeletonRow } from '../components/Skeleton';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

const meta: Meta = { title: 'Components/Display' };
export default meta;

export const Cards: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <Stack gap="lg">
        <Card>
          <Row gap="md">
            <Avatar name="Ethan Grove" />
            <Box flex={1}>
              <Text variant="heading">Static card</Text>
              <Text color="inkMuted">Bordered surface with the hard offset shadow.</Text>
            </Box>
          </Row>
        </Card>
        <Card onPress={() => toast.show('Card pressed')}>
          <Row>
            <Text variant="heading">Pressable card</Text>
            <Spacer />
            <Badge label="Tap me" tone="accent" />
          </Row>
        </Card>
        <Card flat>
          <Text color="inkMuted">Flat card — border only, no shadow.</Text>
        </Card>
      </Stack>
    );
  },
};

export const AvatarsAndBadges: StoryObj = {
  render: () => (
    <Stack gap="lg">
      <Row gap="md">
        <Avatar name="Ethan Grove" size={56} />
        <Avatar name="Wire Frame" />
        <Avatar size={40} />
        <Avatar name="Solo" size={32} />
      </Row>
      <Row wrap gap="sm">
        <Badge label="Neutral" />
        <Badge label="Accent" tone="accent" />
        <Badge label="Success" tone="success" />
        <Badge label="Warning" tone="warning" />
        <Badge label="Danger" tone="danger" />
        <Badge label="Solid" tone="accent" solid />
      </Row>
      <Stack gap="sm">
        <Divider />
        <Divider label="or" />
        <Divider label="sketchy" sketch />
      </Stack>
    </Stack>
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <EmptyState
      glyph="✎"
      title="Nothing here yet"
      description="This is the classic wireframe placeholder box. Add something to fill it in."
      action={<Button label="Add item" size="sm" />}
    />
  ),
};

export const Loading: StoryObj = {
  render: () => {
    const [progress, setProgress] = useState(0.35);
    return (
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
