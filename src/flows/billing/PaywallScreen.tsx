import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Box } from '../../primitives/Box';
import { Stack, Row, Spacer } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Pressable } from '../../primitives/Pressable';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Filter } from '../../components/Filter';
import { Skeleton, SkeletonRow } from '../../components/Skeleton';
import { Icon } from '../../icons/Icon';
import { useToast } from '../../components/Toast';
import { settle } from '../../motion';
import { useFlowServices } from '../FlowServices';
import type { BillingTier, Entitlement } from '../clients/types';
import { FlowError } from '../clients/types';
import { InlineError } from '../components/InlineError';

type Period = 'monthly' | 'annual';

export interface PaywallScreenProps {
  /** Purchase (or restore) succeeded — unlock the app. */
  onPurchased: (entitlement: Entitlement) => void;
  /** Render a "Maybe later" escape hatch (soft paywalls). */
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
}

function TierCard({
  tier,
  period,
  selected,
  onSelect,
}: {
  tier: BillingTier;
  period: Period;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onSelect} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Card
        flat={!selected}
        style={{
          borderWidth: selected ? theme.borders.thick : theme.borders.regular,
          borderColor: selected ? theme.colors.borderStrong : theme.colors.border,
        }}
      >
        <Stack gap="sm">
          <Row gap="sm">
            <Text variant="heading">{tier.name}</Text>
            {tier.badge ? <Badge label={tier.badge} tone="accent" /> : null}
            <Spacer />
            <Row gap="xxs" align="baseline">
              <Text variant="heading">
                {period === 'monthly' ? tier.priceMonthly : tier.priceAnnual}
              </Text>
              <Text variant="caption" color="inkMuted">
                {period === 'monthly' ? '/ mo' : '/ yr'}
              </Text>
            </Row>
          </Row>
          <Text variant="caption" color="inkMuted">
            {tier.description}
          </Text>
          <Stack gap="xs">
            {tier.features.map((feature) => (
              <Row key={feature} gap="sm">
                <Icon name="check" size={14} color={selected ? 'accent' : 'inkMuted'} />
                <Text variant="caption">{feature}</Text>
              </Row>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Pressable>
  );
}

/**
 * Tier picker + checkout. Backed by BillingClient — the mock completes
 * purchases instantly; real adapters (RevenueCat / Stripe) drop in without
 * touching this screen.
 */
export function PaywallScreen({
  onPurchased,
  onSkip,
  title = 'Choose your plan',
  subtitle = 'Try everything free for 7 days. Cancel anytime.',
}: PaywallScreenProps) {
  const { billing } = useFlowServices();
  const theme = useTheme();
  const toast = useToast();
  const [tiers, setTiers] = useState<BillingTier[] | null>(null);
  const [period, setPeriod] = useState<Period>('monthly');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    billing.getTiers().then(
      (loaded) => {
        if (cancelled) return;
        setTiers(loaded);
        // Preselect the highlighted tier (or the first one).
        setSelectedId((loaded.find((t) => t.badge) ?? loaded[0])?.id ?? null);
      },
      () => {
        if (!cancelled) setError('Could not load plans — try again.');
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = tiers?.find((t) => t.id === selectedId) ?? null;

  const purchase = async () => {
    if (!selected) return;
    setBusy('purchase');
    setError(null);
    try {
      const entitlement = await billing.purchase({ tierId: selected.id, period });
      toast.show(`Welcome to ${selected.name}!`, { tone: 'success' });
      onPurchased(entitlement);
    } catch (e) {
      setError(e instanceof FlowError ? e.message : 'Purchase failed — you were not charged.');
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    setError(null);
    try {
      const entitlement = await billing.restorePurchases();
      if (entitlement.status === 'active') {
        toast.show('Purchases restored', { tone: 'success' });
        onPurchased(entitlement);
      } else {
        toast.show('No previous purchases found');
      }
    } catch {
      setError('Could not restore purchases — try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box flex={1} bg="background">
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="title">{title}</Text>
            <Text variant="body" color="inkMuted">
              {subtitle}
            </Text>
          </Stack>

          <Filter<Period>
            value={period}
            onChange={(v) => {
              if (v) setPeriod(v);
            }}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
            ]}
          />

          {tiers === null && !error ? (
            <Stack gap="md">
              <Card flat>
                <Stack gap="sm">
                  <SkeletonRow />
                  <Skeleton width="60%" />
                </Stack>
              </Card>
              <Card flat>
                <Stack gap="sm">
                  <SkeletonRow />
                  <Skeleton width="60%" />
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Animated.View layout={settle(theme.motion.springs.gentle)}>
              <Stack gap="md">
                {(tiers ?? []).map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    period={period}
                    selected={tier.id === selectedId}
                    onSelect={() => setSelectedId(tier.id)}
                  />
                ))}
              </Stack>
            </Animated.View>
          )}

          <InlineError message={error} />

          <Button
            label={
              selected
                ? `Continue — ${period === 'monthly' ? selected.priceMonthly : selected.priceAnnual}${period === 'monthly' ? '/mo' : '/yr'}`
                : 'Continue'
            }
            block
            loading={busy === 'purchase'}
            disabled={!selected || busy !== null}
            onPress={purchase}
          />
          <Row justify="center" gap="md">
            <Button
              label="Restore purchases"
              size="sm"
              variant="ghost"
              loading={busy === 'restore'}
              disabled={busy !== null}
              onPress={restore}
            />
            {onSkip ? (
              <Button label="Maybe later" size="sm" variant="ghost" onPress={onSkip} />
            ) : null}
          </Row>
        </Stack>
      </ScrollView>
    </Box>
  );
}
