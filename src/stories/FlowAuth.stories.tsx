import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { FlowServicesProvider } from '../flows/FlowServices';
import { createMockClients, MOCK_CODE } from '../flows/clients/mock';
import { AuthFlow } from '../flows/auth/AuthFlow';
import type { FlowSession } from '../flows/clients/types';

const meta: Meta = {
  title: 'Flows/Auth',
  parameters: {
    docs: {
      description: {
        component:
          'The complete auth journey running against the in-memory mock backend. ' +
          `Every emailed code is ${MOCK_CODE}; demo@e4.app / demo1234 already exists.`,
      },
    },
  },
};
export default meta;

/** The device outline used by full-screen examples. */
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

function MockHint() {
  return (
    <Text variant="caption" color="inkMuted">
      Mock backend — every emailed code is {MOCK_CODE}. Existing account: demo@e4.app /
      demo1234.
    </Text>
  );
}

/** What the story shows once the flow hands back a session. */
function SignedIn({ session, onSignOut }: { session: FlowSession; onSignOut: () => void }) {
  return (
    <Box flex={1} p="lg" style={{ justifyContent: 'center' }}>
      <Card>
        <Stack gap="md">
          <Row gap="md">
            <Avatar name={session.user.name ?? session.user.email} size={44} />
            <Stack gap="xxs" style={{ flex: 1 }}>
              <Text variant="heading">{session.user.name ?? 'Signed in'}</Text>
              <Text variant="caption" color="inkMuted">
                {session.user.email}
              </Text>
            </Stack>
            <Badge label="Authenticated" tone="success" />
          </Row>
          <Text variant="body" color="inkMuted">
            onAuthenticated fired — your app takes over from here.
          </Text>
          <Button label="Sign out (restart flow)" variant="secondary" onPress={onSignOut} />
        </Stack>
      </Card>
    </Box>
  );
}

function AuthDemo({ initialStep }: { initialStep: 'signIn' | 'signUp' }) {
  const clients = useMemo(
    () =>
      createMockClients({
        seedUsers: [{ email: 'demo@e4.app', password: 'demo1234', name: 'Demo Grover' }],
      }),
    [],
  );
  const [session, setSession] = useState<FlowSession | null>(null);
  const [epoch, setEpoch] = useState(0);

  const signOut = async () => {
    await clients.auth.signOut();
    setSession(null);
    setEpoch((n) => n + 1); // remount the flow so it starts fresh
  };

  return (
    <FlowServicesProvider clients={clients}>
      <Stack gap="sm">
        <MockHint />
        <PhoneFrame>
          {session ? (
            <SignedIn session={session} onSignOut={signOut} />
          ) : (
            <AuthFlow
              key={epoch}
              appName="Fairway"
              initialStep={initialStep}
              onAuthenticated={setSession}
            />
          )}
        </PhoneFrame>
      </Stack>
    </FlowServicesProvider>
  );
}

export const SignIn: StoryObj = {
  name: 'Sign in entry',
  render: () => <AuthDemo initialStep="signIn" />,
};

export const SignUp: StoryObj = {
  name: 'Sign up entry',
  render: () => <AuthDemo initialStep="signUp" />,
};
