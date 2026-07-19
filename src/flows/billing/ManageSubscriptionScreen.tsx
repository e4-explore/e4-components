import React, { useCallback, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Box } from '../../primitives/Box';
import { Stack, Row, Spacer } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { EmptyState } from '../../components/EmptyState';
import { Expandable } from '../../components/Expandable';
import { Skeleton, SkeletonRow } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { settle } from '../../motion';
import { useFlowServices } from '../FlowServices';
import type { BillingTier, Entitlement } from '../clients/types';
import { AuthScaffold } from '../auth/AuthScaffold';

export interface ManageSubscriptionScreenProps {
  /** Route to the paywall (upgrade, or resubscribe after cancel). */
  onChangePlan?: () => void;
  onBack?: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Current-plan overview with restore and inline cancel confirmation (no modal
 * — the confirm springs open in place). Reads everything from BillingClient.
 */
export function ManageSubscriptionScreen({ onChangePlan, onBack }: ManageSubscriptionScreenProps) {
  const { billing } = useFlowServices();
  const theme = useTheme();
  const toast = useToast();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [tiers, setTiers] = useState<BillingTier[] | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState<'cancel' | 'restore' | null>(null);

  const refresh = useCallback(() => {
    billing.getEntitlement().then(setEntitlement, () => setEntitlement(null));
    billing.getTiers().then(setTiers, () => setTiers([]));
  }, [billing]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loading = entitlement === null || tiers === null;
  const tier = entitlement?.tierId
    ? (tiers ?? []).find((t) => t.id === entitlement.tierId)
    : undefined;

  const cancel = async () => {
    setBusy('cancel');
    try {
      const next = await billing.cancel();
      setEntitlement(next);
      setConfirmingCancel(false);
      toast.show('Subscription canceled');
    } catch {
      toast.show('Could not cancel — try again.', { tone: 'danger' });
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const next = await billing.restorePurchases();
      setEntitlement(next);
      toast.show(next.status === 'active' ? 'Purchases restored' : 'No previous purchases found', {
        tone: next.status === 'active' ? 'success' : undefined,
      });
    } catch {
      toast.show('Could not restore purchases.', { tone: 'danger' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthScaffold title="Subscription" onBack={onBack}>
      {loading ? (
        <Card flat>
          <Stack gap="sm">
            <SkeletonRow />
            <Skeleton width="40%" />
          </Stack>
        </Card>
      ) : entitlement.status === 'none' || !tier ? (
        <EmptyState
          glyph="✦"
          title="You're on the free plan"
          description="Upgrade to unlock everything."
          action={
            onChangePlan ? <Button label="See plans" onPress={onChangePlan} /> : undefined
          }
        />
      ) : (
        <Animated.View layout={settle(theme.motion.springs.gentle)}>
          <Stack gap="lg">
            <Card>
              <Stack gap="sm">
                <Row gap="sm">
                  <Text variant="heading">{tier.name}</Text>
                  <Badge
                    label={entitlement.status === 'active' ? 'Active' : 'Canceled'}
                    tone={entitlement.status === 'active' ? 'success' : 'warning'}
                  />
                  <Spacer />
                  <Text variant="label" color="inkMuted">
                    {entitlement.period === 'annual' ? 'Billed yearly' : 'Billed monthly'}
                  </Text>
                </Row>
                <Text variant="caption" color="inkMuted">
                  {entitlement.status === 'active'
                    ? `Renews ${formatDate(entitlement.renewsAt)}`
                    : `Access until ${formatDate(entitlement.renewsAt)}`}
                </Text>
              </Stack>
            </Card>

            <Stack gap="sm">
              {onChangePlan ? (
                <Button label="Change plan" variant="secondary" block onPress={onChangePlan} />
              ) : null}
              <Button
                label="Restore purchases"
                variant="ghost"
                block
                loading={busy === 'restore'}
                disabled={busy !== null}
                onPress={restore}
              />
            </Stack>

            {entitlement.status === 'active' ? (
              <Stack gap="sm">
                <Divider />
                {!confirmingCancel ? (
                  <Button
                    label="Cancel subscription"
                    variant="ghost"
                    block
                    onPress={() => setConfirmingCancel(true)}
                  />
                ) : null}
                <Expandable open={confirmingCancel}>
                  <Box
                    p="md"
                    rounded="md"
                    style={{
                      borderWidth: theme.borders.regular,
                      borderColor: theme.colors.danger,
                      borderStyle: theme.borders.sketchStyle,
                    }}
                  >
                    <Stack gap="sm">
                      <Text variant="label">
                        Cancel your subscription? You keep access until{' '}
                        {formatDate(entitlement.renewsAt)}.
                      </Text>
                      <Row gap="sm">
                        <Button
                          label="Keep plan"
                          size="sm"
                          variant="secondary"
                          onPress={() => setConfirmingCancel(false)}
                        />
                        <Button
                          label="Yes, cancel"
                          size="sm"
                          variant="danger"
                          loading={busy === 'cancel'}
                          onPress={cancel}
                        />
                      </Row>
                    </Stack>
                  </Box>
                </Expandable>
              </Stack>
            ) : null}
          </Stack>
        </Animated.View>
      )}
    </AuthScaffold>
  );
}
