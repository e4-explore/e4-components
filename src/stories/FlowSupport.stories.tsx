import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Box } from '../primitives/Box';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { SupportFlow } from '../flows/support/SupportFlow';

const meta: Meta = {
  title: 'Flows/Support',
  parameters: {
    docs: {
      description: {
        component:
          'FAQ-first help that escalates to a contact form. onSubmitTicket is where the ' +
          'app delivers the message (endpoint, email, Slack…) — the demo just waits a beat.',
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

const FAQ = [
  {
    question: 'Does it work offline?',
    answer: 'Yes — everything you log is saved on the device and syncs when you’re back online.',
  },
  {
    question: 'How do I change my plan?',
    answer: 'Settings → Subscription → Change plan. Downgrades apply at the next renewal.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Email us from this form and we’ll send a full export within 48 hours.',
  },
];

export const Complete: StoryObj = {
  name: 'FAQ → contact form',
  render: () => (
    <Stack gap="sm">
      <Text variant="caption" color="inkMuted">
        Open a question, or go through Contact us — sending fakes a one-second network call.
      </Text>
      <PhoneFrame>
        <SupportFlow
          faq={FAQ}
          userEmail="demo@e4.app"
          onSubmitTicket={(ticket) =>
            new Promise<void>((resolve) => {
              // eslint-disable-next-line no-console
              console.log('ticket', ticket);
              setTimeout(resolve, 1000);
            })
          }
        />
      </PhoneFrame>
    </Stack>
  ),
};
