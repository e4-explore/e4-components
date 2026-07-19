import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { List, ListItem } from '../../components/List';

/**
 * Legal pack: first-run consent and tracking-permission priming. Both are
 * presentational — the app persists the acceptance (and, for tracking,
 * triggers the real OS prompt) in the callbacks.
 */

export interface LegalConsentScreenProps {
  /** Consent given — persist it (e.g. AsyncStorage) and move on. */
  onAccepted: () => void;
  appName?: string;
  /** Opened with Linking; use the callbacks instead for in-app viewers. */
  termsUrl?: string;
  privacyUrl?: string;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

/** First-run Terms & Privacy acceptance gate. */
export function LegalConsentScreen({
  onAccepted,
  appName,
  termsUrl,
  privacyUrl,
  onOpenTerms,
  onOpenPrivacy,
}: LegalConsentScreenProps) {
  const [agreed, setAgreed] = useState(false);
  const openTerms = onOpenTerms ?? (termsUrl ? () => Linking.openURL(termsUrl) : undefined);
  const openPrivacy = onOpenPrivacy ?? (privacyUrl ? () => Linking.openURL(privacyUrl) : undefined);

  return (
    <Box flex={1} bg="background" p="lg" gap="lg">
      <Stack gap="xs">
        <Text variant="title">Before you start</Text>
        <Text variant="body" color="inkMuted">
          {appName ? `${appName} works` : 'This app works'} under two short documents. Give
          them a look, then agree to continue.
        </Text>
      </Stack>
      <List>
        <ListItem title="Terms of Service" chevron onPress={openTerms} />
        <ListItem title="Privacy Policy" chevron onPress={openPrivacy} />
      </List>
      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        label="I agree to the Terms of Service and Privacy Policy"
      />
      <Box flex={1} />
      <Button label="Agree and continue" block disabled={!agreed} onPress={onAccepted} />
    </Box>
  );
}

export interface TrackingConsentScreenProps {
  /**
   * The user's choice. On `true`, trigger the real OS prompt (iOS App
   * Tracking Transparency via e.g. expo-tracking-transparency); on `false`,
   * skip it and never ask again this session.
   */
  onContinue: (allow: boolean) => void;
  appName?: string;
  /** What tracking buys the user — be honest and specific. */
  reason?: string;
}

/** "Ask before the OS asks" priming for the iOS tracking prompt. */
export function TrackingConsentScreen({
  onContinue,
  appName,
  reason = 'It helps us understand what’s working so the app keeps getting better. Nothing is sold, ever.',
}: TrackingConsentScreenProps) {
  return (
    <Box flex={1} bg="background" p="lg" gap="md" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 64, lineHeight: 76 }}>◉</Text>
      <Text variant="title" style={{ textAlign: 'center' }}>
        {appName ? `Help improve ${appName}?` : 'Help improve the app?'}
      </Text>
      <Text variant="body" color="inkMuted" style={{ textAlign: 'center', maxWidth: 300 }}>
        {reason}
      </Text>
      <Stack gap="sm" style={{ alignSelf: 'stretch' }}>
        <Button label="Continue" block onPress={() => onContinue(true)} />
        <Button
          label="Ask me not to track"
          variant="ghost"
          size="sm"
          block
          onPress={() => onContinue(false)}
        />
      </Stack>
    </Box>
  );
}
