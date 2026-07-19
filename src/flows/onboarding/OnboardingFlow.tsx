import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Box } from '../../primitives/Box';
import { Stack, Row, Spacer } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { settle } from '../../motion';
import { StepTransition, useSteps } from '../StepTransition';

export interface OnboardingSlide {
  /** A single glyph standing in for an illustration, wireframe-style. */
  glyph: string;
  title: string;
  body: string;
}

export type OnboardingPermission = 'notifications' | 'location';

export interface OnboardingProfile {
  name: string;
  /** Permissions the user tapped "Allow" on during priming. */
  granted: OnboardingPermission[];
}

export interface OnboardingFlowProps {
  /** All steps finished — persist the profile and enter the app. */
  onDone: (profile: OnboardingProfile) => void;
  appName?: string;
  /** Value-prop slides shown first. Defaults to a generic three. */
  slides?: OnboardingSlide[];
  /** Ask for the user's name after the slides. Default true. */
  askName?: boolean;
  /**
   * Permissions to prime for ("ask before the OS asks"). When the user taps
   * Allow, `onRequestPermission` runs — trigger the real OS prompt there
   * (e.g. expo-notifications / expo-location). Resolve `false` if denied.
   */
  permissions?: OnboardingPermission[];
  onRequestPermission?: (kind: OnboardingPermission) => Promise<boolean> | boolean;
}

const DEFAULT_SLIDES: OnboardingSlide[] = [
  {
    glyph: '✦',
    title: 'Welcome',
    body: 'Everything you need, sketched out and ready to make your own.',
  },
  {
    glyph: '⚡',
    title: 'Fast by default',
    body: 'Every interaction springs — nothing jumps, nothing blocks you.',
  },
  {
    glyph: '◎',
    title: 'Yours to shape',
    body: 'A couple of quick questions and the app is set up for you.',
  },
];

const PERMISSION_COPY: Record<
  OnboardingPermission,
  { glyph: string; title: string; body: string }
> = {
  notifications: {
    glyph: '✶',
    title: 'Notifications',
    body: 'Get a nudge when something needs you — never spam.',
  },
  location: {
    glyph: '➤',
    title: 'Location',
    body: 'Used to show what’s relevant nearby. Only while using the app.',
  },
};

function Dots({ count, active }: { count: number; active: number }) {
  const theme = useTheme();
  return (
    <Row gap="xs" justify="center">
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} layout={settle(theme.motion.springs.snappy)}>
          <View
            style={{
              width: i === active ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === active ? theme.colors.ink : theme.colors.inkFaint,
            }}
          />
        </Animated.View>
      ))}
    </Row>
  );
}

/**
 * Welcome slides → (optional) name → (optional) permission priming, as one
 * self-contained component with spring transitions. Purely presentational —
 * it hands the collected profile to `onDone` and never touches the backend,
 * so it works before or after sign-in.
 */
export function OnboardingFlow({
  onDone,
  appName,
  slides = DEFAULT_SLIDES,
  askName = true,
  permissions = ['notifications'],
  onRequestPermission,
}: OnboardingFlowProps) {
  const theme = useTheme();
  type Step = `slide-${number}` | 'profile' | 'permissions';
  const nav = useSteps<Step>('slide-0');
  const [name, setName] = useState('');
  const [granted, setGranted] = useState<OnboardingPermission[]>([]);
  const [asked, setAsked] = useState<OnboardingPermission[]>([]);

  const finish = (finalName = name) => onDone({ name: finalName.trim(), granted });

  const afterSlides = (): void => {
    if (askName) nav.go('profile');
    else if (permissions.length > 0) nav.go('permissions');
    else finish();
  };
  const afterProfile = (): void => {
    if (permissions.length > 0) nav.go('permissions');
    else finish();
  };

  const slideIndex = nav.step.startsWith('slide-')
    ? Number(nav.step.slice('slide-'.length))
    : -1;

  const ask = async (kind: OnboardingPermission) => {
    setAsked((prev) => (prev.includes(kind) ? prev : [...prev, kind]));
    const result = onRequestPermission ? await onRequestPermission(kind) : true;
    if (result !== false) {
      setGranted((prev) => (prev.includes(kind) ? prev : [...prev, kind]));
    }
  };

  let screen: React.ReactNode;
  if (slideIndex >= 0) {
    const slide = slides[slideIndex];
    screen = (
      <Box flex={1} p="lg">
        <Row>
          <Spacer />
          <Button label="Skip" size="sm" variant="ghost" onPress={afterSlides} />
        </Row>
        <Box flex={1} gap="md" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 64, lineHeight: 76 }}>{slide.glyph}</Text>
          <Text variant="title" style={{ textAlign: 'center' }}>
            {slideIndex === 0 && appName ? `${slide.title} to ${appName}` : slide.title}
          </Text>
          <Text
            variant="body"
            color="inkMuted"
            style={{ textAlign: 'center', maxWidth: 280 }}
          >
            {slide.body}
          </Text>
        </Box>
        <Stack gap="lg">
          <Dots count={slides.length} active={slideIndex} />
          <Button
            label={slideIndex < slides.length - 1 ? 'Next' : 'Get started'}
            block
            onPress={() =>
              slideIndex < slides.length - 1 ? nav.go(`slide-${slideIndex + 1}`) : afterSlides()
            }
          />
        </Stack>
      </Box>
    );
  } else if (nav.step === 'profile') {
    screen = (
      <Box flex={1} p="lg" gap="lg">
        <Stack gap="xs">
          <Text variant="title">What should we call you?</Text>
          <Text variant="body" color="inkMuted">
            Shown on your profile — you can change it anytime.
          </Text>
        </Stack>
        <Row justify="center">
          <Avatar name={name.trim() || '?'} size={72} />
        </Row>
        <FormField label="Name">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ethan Grove"
            autoComplete="name"
            autoFocus
            onSubmitEditing={afterProfile}
          />
        </FormField>
        <Spacer />
        <Stack gap="sm">
          <Button label="Continue" block disabled={!name.trim()} onPress={afterProfile} />
          <Button label="Skip for now" variant="ghost" size="sm" block onPress={afterProfile} />
        </Stack>
      </Box>
    );
  } else {
    screen = (
      <Box flex={1} p="lg" gap="lg">
        <Stack gap="xs">
          <Text variant="title">Before you dive in</Text>
          <Text variant="body" color="inkMuted">
            A couple of things the app works better with. Your call.
          </Text>
        </Stack>
        <Stack gap="md">
          {permissions.map((kind) => {
            const copy = PERMISSION_COPY[kind];
            const isGranted = granted.includes(kind);
            const wasAsked = asked.includes(kind);
            return (
              <Card key={kind} flat={!isGranted}>
                <Row gap="md">
                  <Text style={{ fontSize: 28, lineHeight: 34 }}>{copy.glyph}</Text>
                  <Stack gap="xxs" style={{ flex: 1 }}>
                    <Text variant="heading">{copy.title}</Text>
                    <Text variant="caption" color="inkMuted">
                      {copy.body}
                    </Text>
                  </Stack>
                  {isGranted ? (
                    <Badge label="On" tone="success" />
                  ) : wasAsked ? (
                    <Badge label="Off" tone="neutral" />
                  ) : (
                    <Button label="Allow" size="sm" variant="secondary" onPress={() => ask(kind)} />
                  )}
                </Row>
              </Card>
            );
          })}
        </Stack>
        <Spacer />
        <Animated.View layout={settle(theme.motion.springs.gentle)}>
          <Button
            label={granted.length > 0 || asked.length > 0 ? 'Done' : 'Not now'}
            block
            onPress={() => finish()}
          />
        </Animated.View>
      </Box>
    );
  }

  return (
    <StepTransition stepKey={nav.step} direction={nav.direction}>
      <Box flex={1} bg="background">
        {screen}
      </Box>
    </StepTransition>
  );
}
