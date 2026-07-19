import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';
import { LegalConsentScreen, TrackingConsentScreen } from '../flows/legal/LegalScreens';

const meta: Meta = {
  title: 'Flows/Legal',
  parameters: {
    docs: {
      description: {
        component:
          'First-run consent gate and iOS tracking-prompt priming. Presentational — ' +
          'the app persists acceptance and triggers the real OS prompt in the callbacks.',
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

export const Consent: StoryObj = {
  name: 'Terms & privacy consent',
  render: () => {
    const toast = useToast();
    const [accepted, setAccepted] = useState(false);
    return (
      <PhoneFrame>
        {accepted ? (
          <Box flex={1} p="lg" style={{ justifyContent: 'center' }}>
            <Card>
              <Stack gap="md" style={{ alignItems: 'center' }}>
                <Badge label="Consented" tone="success" />
                <Text variant="body" color="inkMuted" style={{ textAlign: 'center' }}>
                  onAccepted fired — persist it and never ask again.
                </Text>
                <Button label="Run it again" variant="secondary" onPress={() => setAccepted(false)} />
              </Stack>
            </Card>
          </Box>
        ) : (
          <LegalConsentScreen
            appName="Fairway"
            onOpenTerms={() => toast.show('Would open the Terms of Service')}
            onOpenPrivacy={() => toast.show('Would open the Privacy Policy')}
            onAccepted={() => setAccepted(true)}
          />
        )}
      </PhoneFrame>
    );
  },
};

export const Tracking: StoryObj = {
  name: 'Tracking priming (ATT)',
  render: () => {
    const toast = useToast();
    return (
      <PhoneFrame>
        <TrackingConsentScreen
          appName="Fairway"
          onContinue={(allow) =>
            toast.show(allow ? 'Would show the OS tracking prompt' : 'Skipped — never tracked')
          }
        />
      </PhoneFrame>
    );
  },
};
