import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Box } from '../../primitives/Box';
import { Stack, Row, Spacer } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Pressable } from '../../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { settle, enter, exit } from '../../motion';

/**
 * Engagement pack: keeping people in the loop and (politely) asking for the
 * favor back. Presentational — the app decides when to show these (version
 * checks, session counts) and persists dismissals.
 */

export interface WhatsNewHighlight {
  /** A single glyph standing in for an illustration, wireframe-style. */
  glyph: string;
  title: string;
  body: string;
}

export interface WhatsNewScreenProps {
  /** Shown under the title, e.g. "v2.4". */
  version?: string;
  appName?: string;
  highlights: WhatsNewHighlight[];
  /** Dismissed — persist the seen version so it shows once per release. */
  onContinue: () => void;
}

/** Apple-style "What's new in X" release-notes screen. */
export function WhatsNewScreen({ version, appName, highlights, onContinue }: WhatsNewScreenProps) {
  const theme = useTheme();
  return (
    <Box flex={1} bg="background">
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <Stack gap="lg" style={{ flex: 1 }}>
          <Stack gap="xs" style={{ alignItems: 'center' }}>
            <Text variant="title" style={{ textAlign: 'center' }}>
              {appName ? `What’s new in ${appName}` : 'What’s new'}
            </Text>
            {version ? (
              <Text variant="caption" color="inkMuted">
                {version}
              </Text>
            ) : null}
          </Stack>
          <Stack gap="md" style={{ flex: 1 }}>
            {highlights.map((h) => (
              <Row key={h.title} gap="md" style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 28, lineHeight: 34 }}>{h.glyph}</Text>
                <Stack gap="xxs" style={{ flex: 1 }}>
                  <Text variant="heading">{h.title}</Text>
                  <Text variant="caption" color="inkMuted">
                    {h.body}
                  </Text>
                </Stack>
              </Row>
            ))}
          </Stack>
          <Button label="Continue" block onPress={onContinue} />
        </Stack>
      </ScrollView>
    </Box>
  );
}

export interface RatePromptProps {
  appName?: string;
  /**
   * They're happy — trigger the store review prompt here
   * (e.g. expo-store-review's requestReview()).
   */
  onRate: () => void;
  /** They're not — route to your feedback/support form instead of the store. */
  onFeedback: () => void;
  /** Dismissed without answering; persist so you don't nag. */
  onDismiss?: () => void;
}

/**
 * Two-step rating card: ask how it's going first, and only send happy users
 * to the store — everyone else lands in your feedback form. Embed it inline
 * (a feed, the settings foot) or inside a BottomSheet.
 */
export function RatePrompt({ appName, onRate, onFeedback, onDismiss }: RatePromptProps) {
  const theme = useTheme();
  const [mood, setMood] = useState<'unset' | 'happy' | 'unhappy'>('unset');

  return (
    <Animated.View layout={settle(theme.motion.springs.gentle)}>
      <Card>
        {mood === 'unset' ? (
          <Animated.View entering={enter} exiting={exit}>
            <Stack gap="md">
              <Row>
                <Text variant="heading" style={{ flex: 1 }}>
                  {appName ? `Enjoying ${appName}?` : 'Enjoying the app?'}
                </Text>
                {onDismiss ? (
                  <Pressable onPress={onDismiss} accessibilityLabel="Dismiss" hitSlop={8}>
                    <Text variant="label" color="inkFaint">
                      ✕
                    </Text>
                  </Pressable>
                ) : null}
              </Row>
              <Row gap="sm">
                <Button
                  label="Yes!"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() => setMood('happy')}
                />
                <Button
                  label="Not really"
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={() => setMood('unhappy')}
                />
              </Row>
            </Stack>
          </Animated.View>
        ) : mood === 'happy' ? (
          <Animated.View entering={enter}>
            <Stack gap="md">
              <Text variant="heading">Glad to hear it ✦</Text>
              <Text variant="caption" color="inkMuted">
                A rating takes ten seconds and helps more than you’d think.
              </Text>
              <Row gap="sm">
                <Button label="Rate the app" style={{ flex: 1 }} onPress={onRate} />
                {onDismiss ? (
                  <Button label="Maybe later" variant="ghost" onPress={onDismiss} />
                ) : null}
              </Row>
            </Stack>
          </Animated.View>
        ) : (
          <Animated.View entering={enter}>
            <Stack gap="md">
              <Text variant="heading">Help us fix that</Text>
              <Text variant="caption" color="inkMuted">
                Tell us what’s wrong — it goes straight to the people building this.
              </Text>
              <Row gap="sm">
                <Button
                  label="Send feedback"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={onFeedback}
                />
                {onDismiss ? (
                  <Button label="Dismiss" variant="ghost" onPress={onDismiss} />
                ) : null}
              </Row>
            </Stack>
          </Animated.View>
        )}
      </Card>
    </Animated.View>
  );
}
