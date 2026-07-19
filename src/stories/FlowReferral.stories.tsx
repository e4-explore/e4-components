import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Box } from '../primitives/Box';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { ReferralScreen } from '../flows/referral/ReferralScreen';

const meta: Meta = {
  title: 'Flows/Referral',
  parameters: {
    docs: {
      description: {
        component:
          'Invite hub: share or copy your code, and redeem a friend’s inline. ' +
          'In the demo, redeeming FRIEND-1 succeeds and anything else fails.',
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

export const Invite: StoryObj = {
  name: 'Invite & redeem',
  render: () => (
    <Stack gap="sm">
      <Text variant="caption" color="inkMuted">
        Try redeeming FRIEND-1 (works) or anything else (inline error).
      </Text>
      <PhoneFrame>
        <ReferralScreen
          code="E4-GROVE"
          inviteCount={3}
          onRedeem={(code) =>
            new Promise<void>((resolve, reject) =>
              setTimeout(() => {
                if (code === 'FRIEND-1') resolve();
                else reject(new Error('That code didn’t work — check it and try again.'));
              }, 800),
            )
          }
        />
      </PhoneFrame>
    </Stack>
  ),
};
