import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Switch } from '../components/Switch';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';
import {
  ForceUpgradeScreen,
  MaintenanceScreen,
  OfflineBanner,
} from '../flows/ops/OpsScreens';

const meta: Meta = {
  title: 'Flows/Ops',
  parameters: {
    docs: {
      description: {
        component:
          'The unglamorous screens every shipping app needs: force-upgrade gate, ' +
          'maintenance screen, offline banner. All prop-driven — your app decides when, ' +
          'these decide how.',
      },
    },
  },
};
export default meta;

function PhoneFrame({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      bg="background"
      style={{
        height: 640,
        borderWidth: theme.borders.thick,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

export const ForceUpgrade: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <PhoneFrame>
        <ForceUpgradeScreen
          appName="Fairway"
          onUpdatePress={() => toast.show('Would open the store listing')}
        />
      </PhoneFrame>
    );
  },
};

export const Maintenance: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <PhoneFrame>
        <MaintenanceScreen
          onRetry={() =>
            new Promise<void>((resolve) =>
              setTimeout(() => {
                toast.show('Still down — try again soon');
                resolve();
              }, 900),
            )
          }
        />
      </PhoneFrame>
    );
  },
};

export const Offline: StoryObj = {
  name: 'Offline banner',
  render: () => {
    const [offline, setOffline] = useState(true);
    return (
      <Stack gap="sm">
        <Row gap="sm">
          <Switch value={offline} onChange={setOffline} label="Offline" />
        </Row>
        <PhoneFrame>
          <OfflineBanner offline={offline} />
          <Box p="lg" gap="md">
            <Text variant="title">Your app</Text>
            <Card>
              <Text color="inkMuted">
                Content glides down when the banner springs open — nothing jumps.
              </Text>
            </Card>
            <Button label="Toggle from inside" variant="secondary" onPress={() => setOffline(!offline)} />
          </Box>
        </PhoneFrame>
      </Stack>
    );
  },
};
