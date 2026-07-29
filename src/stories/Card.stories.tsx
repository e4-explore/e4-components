import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { useToast } from '../components/Toast';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    flat: false,
  },
  argTypes: {
    flat: { control: 'boolean' },
    onPress: { control: false },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args}>
      <Row gap="md">
        <Avatar name="Ethan Grove" />
        <Box flex={1}>
          <Text variant="heading">Card title</Text>
          <Text color="inkMuted">Toggle `flat` in Controls to strip the surface to bare content.</Text>
        </Box>
      </Row>
    </Card>
  ),
};

export const Variants: Story = {
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
          <Text color="inkMuted">Flat card — bare content, no surface, border, or shadow.</Text>
        </Card>
      </Stack>
    );
  },
};
