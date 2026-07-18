import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';

const meta: Meta = { title: 'Components/App shell' };
export default meta;

export const Headers: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <Stack gap="lg">
        <Header title="Home" right={<Badge label="beta" tone="accent" />} />
        <Header title="Detail screen" onBack={() => toast.show('Back!')} />
      </Stack>
    );
  },
};

export const Tabs: StoryObj = {
  render: () => {
    const [tab, setTab] = useState<'home' | 'search' | 'stats' | 'me'>('home');
    return (
      <Stack gap="lg">
        <Text variant="caption" color="inkMuted">
          The indicator pill springs between tabs.
        </Text>
        <TabBar
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'home', label: 'Home', icon: 'home' },
            { key: 'search', label: 'Search', icon: 'search' },
            { key: 'stats', label: 'Stats', icon: 'chart' },
            { key: 'me', label: 'Me', icon: 'smile' },
          ]}
        />
        <Text align="center" color="inkMuted">
          Active: {tab}
        </Text>
      </Stack>
    );
  },
};

export const Sheet: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    return (
      <Box style={{ height: 520, borderWidth: theme.borders.regular, borderColor: theme.colors.border, borderRadius: theme.radii.lg, overflow: 'hidden' }}>
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

export const Toasts: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <Row wrap>
        <Button label="Neutral" variant="secondary" onPress={() => toast.show('Sketch saved')} />
        <Button
          label="Success"
          variant="secondary"
          onPress={() => toast.show('Round synced!', { tone: 'success' })}
        />
        <Button
          label="Danger"
          variant="secondary"
          onPress={() => toast.show('Connection lost', { tone: 'danger' })}
        />
      </Row>
    );
  },
};
