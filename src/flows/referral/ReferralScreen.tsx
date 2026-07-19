import React, { useState } from 'react';
import { Share, Platform } from 'react-native';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { Expandable } from '../../components/Expandable';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../theme/ThemeProvider';
import { AuthScaffold, TextLink } from '../auth/AuthScaffold';
import { InlineError } from '../components/InlineError';

/**
 * Referral pack: give friends a code, let new users redeem one.
 */

export interface ReferralScreenProps {
  /** The user's own invite code. */
  code: string;
  /** What both sides get — keep it concrete: "You both get a free month." */
  reward?: string;
  /** Prebuilt share message; defaults to the code + reward. */
  shareMessage?: string;
  /** Successful invites so far. */
  inviteCount?: number;
  /**
   * Redeem a friend's code. Reject with an Error whose message is shown
   * inline (unknown code, own code, already redeemed…).
   */
  onRedeem?: (code: string) => Promise<void> | void;
  onBack?: () => void;
}

/** Invite hub: your code (copy/share), progress, and an inline redeem form. */
export function ReferralScreen({
  code,
  reward = 'You both get a free month of Pro.',
  shareMessage,
  inviteCount,
  onRedeem,
  onBack,
}: ReferralScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [redeeming, setRedeeming] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = shareMessage ?? `Use my invite code ${code} — ${reward}`;

  const copy = async () => {
    try {
      // Clipboard without a native dependency: web API when present; native
      // falls back to the share sheet, which includes Copy.
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        toast.show('Code copied', { tone: 'success' });
      } else {
        await Share.share({ message: code });
      }
    } catch {
      toast.show('Could not copy the code', { tone: 'danger' });
    }
  };

  const share = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as { share: (data: { text: string }) => Promise<void> }).share({
          text: message,
        });
      } else {
        await Share.share({ message });
      }
    } catch {
      // Share sheet dismissed — not an error.
    }
  };

  const redeem = async () => {
    const trimmed = friendCode.trim().toUpperCase();
    setError(null);
    if (!trimmed) {
      setError('Enter a code first.');
      return;
    }
    setBusy(true);
    try {
      await onRedeem?.(trimmed);
      toast.show('Code redeemed!', { tone: 'success' });
      setRedeeming(false);
      setFriendCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code didn’t work — check it and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold title="Invite friends" subtitle={reward} onBack={onBack}>
      <Stack gap="lg">
        <Card>
          <Stack gap="md">
            <Text variant="label" color="inkMuted">
              Your code
            </Text>
            <Box
              p="md"
              rounded="md"
              bg="surfaceAlt"
              style={{
                borderWidth: theme.borders.regular,
                borderColor: theme.colors.border,
                borderStyle: theme.borders.sketchStyle,
                alignItems: 'center',
              }}
            >
              <Text variant="title" style={{ letterSpacing: 2 }}>
                {code}
              </Text>
            </Box>
            <Row gap="sm">
              <Button label="Share" style={{ flex: 1 }} onPress={share} />
              <Button label="Copy" variant="secondary" onPress={copy} />
            </Row>
            {inviteCount !== undefined ? (
              <Text variant="caption" color="inkMuted" style={{ textAlign: 'center' }}>
                {inviteCount === 0
                  ? 'No invites yet — send the first one.'
                  : `${inviteCount} friend${inviteCount === 1 ? '' : 's'} joined with your code.`}
              </Text>
            ) : null}
          </Stack>
        </Card>

        {onRedeem ? (
          <Stack gap="sm">
            {!redeeming ? (
              <Row justify="center" gap="xs">
                <Text variant="label" color="inkMuted">
                  Got a code from a friend?
                </Text>
                <TextLink label="Redeem it" onPress={() => setRedeeming(true)} />
              </Row>
            ) : null}
            <Expandable open={redeeming}>
              <Stack gap="md">
                <FormField label="Friend’s code">
                  <Input
                    value={friendCode}
                    onChangeText={(v) => {
                      setFriendCode(v);
                      if (error) setError(null);
                    }}
                    placeholder="E4-XXXX"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onSubmitEditing={redeem}
                  />
                </FormField>
                <InlineError message={error} />
                <Row gap="sm">
                  <Button label="Redeem" style={{ flex: 1 }} loading={busy} onPress={redeem} />
                  <Button label="Cancel" variant="ghost" onPress={() => setRedeeming(false)} />
                </Row>
              </Stack>
            </Expandable>
          </Stack>
        ) : null}
      </Stack>
    </AuthScaffold>
  );
}
