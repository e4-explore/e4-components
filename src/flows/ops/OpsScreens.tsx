import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Expandable } from '../../components/Expandable';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Ops pack: the unglamorous screens every shipping app eventually needs.
 * All presentational and prop-driven — the app decides *when* to show them
 * (remote config, a version-check endpoint, NetInfo, …); these decide *how*.
 */

export interface ForceUpgradeScreenProps {
  appName?: string;
  /** App Store / Play Store listing; opened by the update button. */
  storeUrl?: string;
  /** Override the button behavior entirely (e.g. in-app update APIs). */
  onUpdatePress?: () => void;
  message?: string;
}

/** Hard version gate: this build is too old to keep running. */
export function ForceUpgradeScreen({
  appName,
  storeUrl,
  onUpdatePress,
  message = 'This version is no longer supported. Update to keep going — it only takes a minute.',
}: ForceUpgradeScreenProps) {
  const press = onUpdatePress ?? (storeUrl ? () => Linking.openURL(storeUrl) : undefined);
  return (
    <Box flex={1} bg="background" p="lg" gap="md" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 64, lineHeight: 76 }}>↻</Text>
      <Text variant="title" style={{ textAlign: 'center' }}>
        {appName ? `Update ${appName}` : 'Update required'}
      </Text>
      <Text variant="body" color="inkMuted" style={{ textAlign: 'center', maxWidth: 300 }}>
        {message}
      </Text>
      {press ? <Button label="Update now" onPress={press} /> : null}
    </Box>
  );
}

export interface MaintenanceScreenProps {
  message?: string;
  /** Re-check whether the backend is back; show a spinner while pending. */
  onRetry?: () => Promise<void> | void;
}

/** Scheduled-downtime screen with an optional retry. */
export function MaintenanceScreen({
  message = 'We’re doing some quick maintenance. Back shortly — your data is safe.',
  onRetry,
}: MaintenanceScreenProps) {
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    try {
      await onRetry?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box flex={1} bg="background" p="lg" gap="md" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 64, lineHeight: 76 }}>✕</Text>
      <Text variant="title" style={{ textAlign: 'center' }}>
        Down for maintenance
      </Text>
      <Text variant="body" color="inkMuted" style={{ textAlign: 'center', maxWidth: 300 }}>
        {message}
      </Text>
      {onRetry ? (
        <Button label="Check again" variant="secondary" loading={busy} onPress={retry} />
      ) : null}
    </Box>
  );
}

export interface OfflineBannerProps {
  /** Drive from your connectivity source (e.g. @react-native-community/netinfo). */
  offline: boolean;
  message?: string;
}

/**
 * Slim connectivity banner. Mount once above your app content; it springs
 * open/closed in place so the layout glides rather than jumping.
 */
export function OfflineBanner({
  offline,
  message = 'You’re offline — changes will sync when you’re back.',
}: OfflineBannerProps) {
  const theme = useTheme();
  return (
    <Expandable open={offline}>
      <Row
        px="md"
        py="sm"
        gap="sm"
        bg="surfaceAlt"
        style={{
          borderBottomWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          borderStyle: theme.borders.sketchStyle,
        }}
      >
        <Text variant="caption">⌁</Text>
        <Text variant="caption" color="inkMuted" style={{ flex: 1 }}>
          {message}
        </Text>
      </Row>
    </Expandable>
  );
}
