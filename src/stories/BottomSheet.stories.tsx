import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { useTheme } from '../theme/ThemeProvider';

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
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
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    return (
      <Box
        style={{
          height: 520,
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          overflow: 'hidden',
        }}
      >
        <Box p="lg" flex={1}>
          <Text variant="caption" color="inkMuted">
            Springs up from the edge; drag down or tap the scrim to dismiss.
          </Text>
          <Box mt="md">
            <Button label="Open sheet" onPress={() => setOpen(true)} />
          </Box>
        </Box>
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <Stack>
            <Text variant="heading">Quick actions</Text>
            <Row>
              <Button label="Share" size="sm" variant="secondary" />
              <Button label="Duplicate" size="sm" variant="secondary" />
              <Spacer />
              <Button label="Delete" size="sm" variant="danger" />
            </Row>
          </Stack>
        </BottomSheet>
      </Box>
    );
  },
};
