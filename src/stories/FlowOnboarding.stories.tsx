import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { OnboardingFlow, type OnboardingProfile } from '../flows/onboarding/OnboardingFlow';

const meta: Meta = {
  title: 'Flows/Onboarding',
  parameters: {
    docs: {
      description: {
        component:
          'Welcome slides → name → permission priming. Purely presentational — ' +
          'the collected profile is handed to onDone, and Allow taps are where a real ' +
          'app triggers the OS permission prompts.',
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

function OnboardingDemo() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  return (
    <Stack gap="sm">
      <Text variant="caption" color="inkMuted">
        Click through the slides — Allow taps are where the real OS permission prompts would
        fire.
      </Text>
      <PhoneFrame>
        {profile ? (
          <Box flex={1} p="lg" style={{ justifyContent: 'center' }}>
            <Card>
              <Stack gap="md">
                <Stack gap="xxs" style={{ alignItems: 'center' }}>
                  <Avatar name={profile.name || '?'} size={56} />
                  <Text variant="heading">{profile.name || 'Anonymous'}</Text>
                  <Text variant="caption" color="inkMuted">
                    onDone fired — your app takes over from here.
                  </Text>
                </Stack>
                <Stack gap="xs" style={{ alignItems: 'center' }}>
                  <Text variant="label" color="inkMuted">
                    Permissions granted
                  </Text>
                  <Badge
                    label={profile.granted.length > 0 ? profile.granted.join(', ') : 'none'}
                    tone={profile.granted.length > 0 ? 'success' : 'neutral'}
                  />
                </Stack>
                <Button
                  label="Run it again"
                  variant="secondary"
                  onPress={() => setProfile(null)}
                />
              </Stack>
            </Card>
          </Box>
        ) : (
          <OnboardingFlow
            appName="Fairway"
            permissions={['notifications', 'location']}
            onDone={setProfile}
          />
        )}
      </PhoneFrame>
    </Stack>
  );
}

export const Complete: StoryObj = {
  name: 'Complete journey',
  render: () => <OnboardingDemo />,
};
