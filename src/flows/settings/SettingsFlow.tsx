import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { List, ListItem } from '../../components/List';
import { Switch } from '../../components/Switch';
import { Expandable } from '../../components/Expandable';
import { Pressable } from '../../primitives/Pressable';
import { useToast } from '../../components/Toast';
import { useFlowServices } from '../FlowServices';
import type { FlowSession, FlowUser } from '../clients/types';
import { FlowError } from '../clients/types';
import { emailError, passwordError } from '../validate';
import { StepTransition, useSteps } from '../StepTransition';
import { AuthScaffold, TextLink } from '../auth/AuthScaffold';
import { InlineError } from '../components/InlineError';
import { ManageSubscriptionScreen } from '../billing/ManageSubscriptionScreen';

export type SettingsStep =
  | 'hub'
  | 'profile'
  | 'password'
  | 'email'
  | 'notifications'
  | 'subscription';

export interface SettingsFlowProps {
  session: FlowSession;
  /** Fired when profile edits change the user (name, email). */
  onUserChange?: (user: FlowUser) => void;
  onSignedOut: () => void;
  /** After account deletion; defaults to onSignedOut. */
  onDeleted?: () => void;
  /** Leave settings back to the app (renders the back chevron on the hub). */
  onClose?: () => void;
  /** Route to the paywall from the subscription screen. */
  onChangePlan?: () => void;
  /** Shown at the foot of the hub, e.g. "v1.0.2". */
  appVersion?: string;
}

/**
 * The whole settings surface: hub → edit profile / change password / change
 * email / notification preferences / manage subscription, plus sign-out and
 * a delete-account confirm (inline — no modal). Wired to Auth/Profile/Billing
 * clients; App Store's delete-account requirement is covered out of the box.
 */
export function SettingsFlow({
  session,
  onUserChange,
  onSignedOut,
  onDeleted,
  onClose,
  onChangePlan,
  appVersion,
}: SettingsFlowProps) {
  const { auth, profile } = useFlowServices();
  const theme = useTheme();
  const toast = useToast();
  const nav = useSteps<SettingsStep>('hub');
  const [user, setUser] = useState<FlowUser>(session.user);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Notification preferences are app-side wiring (push tokens, topics); the
  // flow just gives them a home so every app starts with the screen.
  const [prefs, setPrefs] = useState({ push: true, email: false, reminders: true });

  const changeUser = (next: FlowUser) => {
    setUser(next);
    onUserChange?.(next);
  };

  const signOut = async () => {
    setBusy('signout');
    try {
      await auth.signOut();
      onSignedOut();
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    setBusy('delete');
    try {
      await auth.deleteAccount();
      toast.show('Account deleted');
      (onDeleted ?? onSignedOut)();
    } catch {
      toast.show('Could not delete your account — try again.', { tone: 'danger' });
    } finally {
      setBusy(null);
    }
  };

  let screen: React.ReactNode;
  switch (nav.step) {
    case 'hub':
      screen = (
        <AuthScaffold title="Settings" onBack={onClose}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Stack gap="lg">
              <Pressable onPress={() => nav.go('profile')}>
                <Card>
                  <Row gap="md">
                    <Avatar name={user.name ?? user.email} size={44} />
                    <Stack gap="xxs" style={{ flex: 1 }}>
                      <Text variant="heading">{user.name ?? 'Add your name'}</Text>
                      <Text variant="caption" color="inkMuted">
                        {user.email}
                      </Text>
                    </Stack>
                    <TextLink label="Edit" onPress={() => nav.go('profile')} />
                  </Row>
                </Card>
              </Pressable>

              <Stack gap="xs">
                <Text variant="label" color="inkMuted">
                  Account
                </Text>
                <List>
                  <ListItem title="Edit profile" chevron onPress={() => nav.go('profile')} />
                  <ListItem title="Change password" chevron onPress={() => nav.go('password')} />
                  <ListItem title="Change email" chevron onPress={() => nav.go('email')} />
                </List>
              </Stack>

              <Stack gap="xs">
                <Text variant="label" color="inkMuted">
                  Preferences
                </Text>
                <List>
                  <ListItem
                    title="Notifications"
                    chevron
                    onPress={() => nav.go('notifications')}
                  />
                  <ListItem
                    title="Subscription"
                    chevron
                    onPress={() => nav.go('subscription')}
                  />
                </List>
              </Stack>

              <Stack gap="sm">
                <Button
                  label="Sign out"
                  variant="secondary"
                  block
                  loading={busy === 'signout'}
                  onPress={signOut}
                />
                {!confirmingDelete ? (
                  <Button
                    label="Delete account"
                    variant="ghost"
                    block
                    onPress={() => setConfirmingDelete(true)}
                  />
                ) : null}
                <Expandable open={confirmingDelete}>
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
                        Delete your account and all of its data? This can’t be undone.
                      </Text>
                      <Row gap="sm">
                        <Button
                          label="Keep account"
                          size="sm"
                          variant="secondary"
                          onPress={() => setConfirmingDelete(false)}
                        />
                        <Button
                          label="Delete forever"
                          size="sm"
                          variant="danger"
                          loading={busy === 'delete'}
                          onPress={deleteAccount}
                        />
                      </Row>
                    </Stack>
                  </Box>
                </Expandable>
                {appVersion ? (
                  <Text variant="caption" color="inkFaint" style={{ textAlign: 'center' }}>
                    {appVersion}
                  </Text>
                ) : null}
              </Stack>
            </Stack>
          </ScrollView>
        </AuthScaffold>
      );
      break;

    case 'profile':
      screen = (
        <EditProfileScreen
          user={user}
          onBack={() => nav.back('hub')}
          onSaved={(next) => {
            changeUser(next);
            nav.back('hub');
          }}
        />
      );
      break;

    case 'password':
      screen = <ChangePasswordScreen onBack={() => nav.back('hub')} onDone={() => nav.back('hub')} />;
      break;

    case 'email':
      screen = (
        <ChangeEmailScreen
          onBack={() => nav.back('hub')}
          onDone={(newEmail) => {
            changeUser({ ...user, email: newEmail });
            nav.back('hub');
          }}
        />
      );
      break;

    case 'notifications':
      screen = (
        <AuthScaffold
          title="Notifications"
          subtitle="Choose what’s worth interrupting you for."
          onBack={() => nav.back('hub')}
        >
          <List>
            <ListItem
              title="Push notifications"
              subtitle="Time-sensitive updates"
              right={
                <Switch value={prefs.push} onChange={(v) => setPrefs({ ...prefs, push: v })} />
              }
            />
            <ListItem
              title="Email updates"
              subtitle="News and product announcements"
              right={
                <Switch value={prefs.email} onChange={(v) => setPrefs({ ...prefs, email: v })} />
              }
            />
            <ListItem
              title="Reminders"
              subtitle="Nudges about things you started"
              right={
                <Switch
                  value={prefs.reminders}
                  onChange={(v) => setPrefs({ ...prefs, reminders: v })}
                />
              }
            />
          </List>
        </AuthScaffold>
      );
      break;

    case 'subscription':
      screen = (
        <ManageSubscriptionScreen onBack={() => nav.back('hub')} onChangePlan={onChangePlan} />
      );
      break;
  }

  return (
    <StepTransition stepKey={nav.step} direction={nav.direction}>
      <Box flex={1} bg="background">
        {screen}
      </Box>
    </StepTransition>
  );
}

function EditProfileScreen({
  user,
  onBack,
  onSaved,
}: {
  user: FlowUser;
  onBack: () => void;
  onSaved: (user: FlowUser) => void;
}) {
  const { profile } = useFlowServices();
  const toast = useToast();
  const [name, setName] = useState(user.name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await profile.updateProfile({ name: name.trim() || undefined });
      toast.show('Profile updated', { tone: 'success' });
      onSaved(next);
    } catch (e) {
      setError(e instanceof FlowError ? e.message : 'Could not save — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold title="Edit profile" onBack={onBack}>
      <Stack gap="lg">
        <Row justify="center">
          <Avatar name={name.trim() || user.email} size={72} />
        </Row>
        <FormField label="Name">
          <Input value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" />
        </FormField>
        <InlineError message={error} />
        <Button label="Save" block loading={busy} onPress={save} />
      </Stack>
    </AuthScaffold>
  );
}

function ChangePasswordScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { profile } = useFlowServices();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const err = passwordError(next);
    setFieldError(err ?? undefined);
    setError(null);
    if (err || !current) return;
    setBusy(true);
    try {
      await profile.changePassword({ currentPassword: current, newPassword: next });
      toast.show('Password changed', { tone: 'success' });
      onDone();
    } catch (e) {
      setError(e instanceof FlowError ? e.message : 'Could not change password — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold title="Change password" onBack={onBack}>
      <Stack gap="md">
        <FormField label="Current password">
          <Input
            value={current}
            onChangeText={setCurrent}
            placeholder="••••••••"
            secureTextEntry={!show}
            autoComplete="current-password"
          />
        </FormField>
        <FormField label="New password" hint="At least 8 characters." error={fieldError}>
          <Input
            value={next}
            onChangeText={(v) => {
              setNext(v);
              if (fieldError) setFieldError(undefined);
            }}
            placeholder="••••••••"
            secureTextEntry={!show}
            autoComplete="new-password"
            right={<TextLink label={show ? 'Hide' : 'Show'} onPress={() => setShow(!show)} />}
          />
        </FormField>
        <InlineError message={error} />
        <Button
          label="Change password"
          block
          loading={busy}
          disabled={!current || !next}
          onPress={save}
        />
      </Stack>
    </AuthScaffold>
  );
}

function ChangeEmailScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (newEmail: string) => void;
}) {
  const { profile } = useFlowServices();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const err = emailError(email);
    setFieldError(err ?? undefined);
    setError(null);
    if (err || !password) return;
    setBusy(true);
    try {
      const { requiresVerification } = await profile.changeEmail({
        newEmail: email,
        password,
      });
      toast.show(
        requiresVerification ? 'Check your new inbox to confirm' : 'Email changed',
        { tone: 'success' },
      );
      onDone(email.trim().toLowerCase());
    } catch (e) {
      setError(e instanceof FlowError ? e.message : 'Could not change email — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title="Change email"
      subtitle="You’ll confirm the new address before it takes over."
      onBack={onBack}
    >
      <Stack gap="md">
        <FormField label="New email" error={fieldError}>
          <Input
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (fieldError) setFieldError(undefined);
            }}
            placeholder="new@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
        </FormField>
        <FormField label="Password" hint="Confirms it’s really you.">
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="current-password"
          />
        </FormField>
        <InlineError message={error} />
        <Button
          label="Change email"
          block
          loading={busy}
          disabled={!email || !password}
          onPress={save}
        />
      </Stack>
    </AuthScaffold>
  );
}
