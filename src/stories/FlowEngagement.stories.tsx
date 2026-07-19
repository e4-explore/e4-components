import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';
import { WhatsNewScreen, RatePrompt } from '../flows/engagement/EngagementScreens';

const meta: Meta = {
  title: 'Flows/Engagement',
  parameters: {
    docs: {
      description: {
        component:
          'Release-notes screen (show once per version) and the two-step rating card — ' +
          'happy users go to the store, unhappy ones go to your feedback form.',
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

export const WhatsNew: StoryObj = {
  name: "What's new",
  render: () => {
    const toast = useToast();
    return (
      <PhoneFrame>
        <WhatsNewScreen
          appName="Fairway"
          version="v2.4"
          highlights={[
            {
              glyph: '⚡',
              title: 'Faster round entry',
              body: 'Log a hole in two taps — scores spring into place as you go.',
            },
            {
              glyph: '◎',
              title: 'Practice goals',
              body: 'Set a weekly target and watch the progress ring fill up.',
            },
            {
              glyph: '✦',
              title: 'Dark mode polish',
              body: 'Every screen re-inked for late-night range sessions.',
            },
          ]}
          onContinue={() => toast.show('Persist the seen version, then continue')}
        />
      </PhoneFrame>
    );
  },
};

export const Rate: StoryObj = {
  name: 'Rate prompt',
  render: () => {
    const toast = useToast();
    const [visible, setVisible] = useState(true);
    return (
      <PhoneFrame>
        <Box p="lg" gap="md">
          <Text variant="title">Your feed</Text>
          <Card>
            <Text color="inkMuted">Some app content above the prompt…</Text>
          </Card>
          {visible ? (
            <RatePrompt
              appName="Fairway"
              onRate={() => toast.show('Would call StoreReview.requestReview()')}
              onFeedback={() => toast.show('Would open the support form')}
              onDismiss={() => setVisible(false)}
            />
          ) : (
            <Button label="Show it again" variant="ghost" onPress={() => setVisible(true)} />
          )}
          <Card>
            <Text color="inkMuted">…and more below. It springs away on dismiss.</Text>
          </Card>
        </Box>
      </PhoneFrame>
    );
  },
};
