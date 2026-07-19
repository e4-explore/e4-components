import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../theme/ThemeProvider';
import { FlowServicesProvider } from '../flows/FlowServices';
import { createMockClients } from '../flows/clients/mock';
import { SettingsFlow } from '../flows/settings/SettingsFlow';
import { PaywallScreen } from '../flows/billing/PaywallScreen';
import type { FlowSession } from '../flows/clients/types';

const meta: Meta = {
  title: 'Flows/Settings',
  parameters: {
    docs: {
      description: {
        component:
          'Settings hub with edit profile, change password/email, notification ' +
          'preferences, subscription management, sign out, and inline delete-account ' +
          'confirm — all against the mock backend (password: demo1234).',
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

function SettingsDemo() {
  // Recreated on every restart (sign-out / delete) so demo mutations — like a
  // changed password — never strand the demo.
  const [epoch, setEpoch] = useState(0);
  const clients = useMemo(
    () =>
      createMockClients({
        seedUsers: [{ email: 'demo@e4.app', password: 'demo1234', name: 'Demo Grover' }],
      }),
    [epoch],
  );
  const [session, setSession] = useState<FlowSession | null>(null);
  const [screen, setScreen] = useState<'settings' | 'paywall'>('settings');

  // Sign the demo user in so the flow has a session.
  React.useEffect(() => {
    let cancelled = false;
    setSession(null);
    clients.auth.signIn({ email: 'demo@e4.app', password: 'demo1234' }).then(
      (s) => {
        if (!cancelled) setSession(s);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [clients]);

  return (
    <FlowServicesProvider clients={clients}>
      <Stack gap="sm">
        <Text variant="caption" color="inkMuted">
          Signed in as demo@e4.app (password: demo1234 — needed for the change password/email
          screens). Delete account and sign out restart the demo.
        </Text>
        <PhoneFrame>
          {!session ? null : screen === 'paywall' ? (
            <PaywallScreen
              onPurchased={() => setScreen('settings')}
              onSkip={() => setScreen('settings')}
            />
          ) : (
            <SettingsFlow
              key={session.user.id}
              session={session}
              appVersion="demo v0.1"
              onSignedOut={() => setEpoch((n) => n + 1)}
              onChangePlan={() => setScreen('paywall')}
            />
          )}
        </PhoneFrame>
      </Stack>
    </FlowServicesProvider>
  );
}

export const Hub: StoryObj = {
  name: 'Settings hub',
  render: () => <SettingsDemo />,
};
