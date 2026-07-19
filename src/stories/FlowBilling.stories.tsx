import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { useTheme } from '../theme/ThemeProvider';
import { FlowServicesProvider } from '../flows/FlowServices';
import { createMockClients } from '../flows/clients/mock';
import { PaywallScreen } from '../flows/billing/PaywallScreen';
import { ManageSubscriptionScreen } from '../flows/billing/ManageSubscriptionScreen';

const meta: Meta = {
  title: 'Flows/Subscription',
  parameters: {
    docs: {
      description: {
        component:
          'Paywall and subscription management running against the in-memory mock ' +
          'billing client — purchases complete instantly and cost nothing.',
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

/**
 * The full loop in one demo: paywall → purchase → manage screen →
 * cancel (or change plan, which returns to the paywall).
 */
function BillingDemo() {
  const clients = useMemo(() => createMockClients(), []);
  const [screen, setScreen] = useState<'paywall' | 'manage'>('paywall');

  return (
    <FlowServicesProvider clients={clients}>
      <Stack gap="sm">
        <Text variant="caption" color="inkMuted">
          Mock billing — purchases are instant and free. Buy a plan, then cancel it from the
          manage screen.
        </Text>
        <PhoneFrame>
          {screen === 'paywall' ? (
            <PaywallScreen
              onPurchased={() => setScreen('manage')}
              onSkip={() => setScreen('manage')}
            />
          ) : (
            <ManageSubscriptionScreen onChangePlan={() => setScreen('paywall')} />
          )}
        </PhoneFrame>
      </Stack>
    </FlowServicesProvider>
  );
}

export const PaywallToManage: StoryObj = {
  name: 'Paywall → manage',
  render: () => <BillingDemo />,
};
