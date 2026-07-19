import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { useTheme } from '../theme/ThemeProvider';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    open: false,
    onClose: () => {},
    children: null,
  },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    return (
      <Box
        style={{
          height: 420,
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          overflow: 'hidden',
        }}
      >
        <Box p="lg" flex={1}>
          <Text variant="caption" color="inkMuted">
            Scales and fades in over a scrim; tap the scrim or the close button to dismiss.
          </Text>
          <Box mt="md">
            <Button label="Open modal" onPress={() => setOpen(true)} />
          </Box>
        </Box>
        <Modal open={open} onClose={() => setOpen(false)} title="Delete project?">
          <Stack gap="md">
            <Text color="inkMuted">
              This removes the project and everything in it. This can&apos;t be undone.
            </Text>
            <Row>
              <Button label="Cancel" size="sm" variant="secondary" onPress={() => setOpen(false)} />
              <Spacer />
              <Button label="Delete" size="sm" variant="danger" onPress={() => setOpen(false)} />
            </Row>
          </Stack>
        </Modal>
      </Box>
    );
  },
};
