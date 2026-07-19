import React, { useState } from 'react';
import { Stack, Row, Spacer } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { useFlowServices } from '../FlowServices';
import type { FlowSession } from '../clients/types';
import { FlowError } from '../clients/types';
import { emailError, passwordError } from '../validate';
import { AuthScaffold, TextLink } from './AuthScaffold';
import { InlineError } from '../components/InlineError';

export interface SignInScreenProps {
  appName?: string;
  onDone: (session: FlowSession) => void;
  onForgot: (email: string) => void;
  onSignUp: () => void;
}

export function SignInScreen({ appName, onDone, onForgot, onSignUp }: SignInScreenProps) {
  const { auth } = useFlowServices();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async () => {
    const next = {
      email: emailError(email) ?? undefined,
      password: password ? undefined : 'Password is required.',
    };
    setErrors(next);
    setServerError(null);
    if (next.email || next.password) return;
    setBusy(true);
    try {
      onDone(await auth.signIn({ email, password }));
    } catch (e) {
      setServerError(e instanceof FlowError ? e.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle={appName ? `Sign in to ${appName}.` : 'Sign in to continue.'}
    >
      <Stack gap="md">
        <FormField label="Email" error={errors.email}>
          <Input
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onSubmitEditing={submit}
          />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <Input
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="••••••••"
            secureTextEntry={!show}
            autoComplete="current-password"
            onSubmitEditing={submit}
            right={<TextLink label={show ? 'Hide' : 'Show'} onPress={() => setShow(!show)} />}
          />
        </FormField>
        <InlineError message={serverError} />
        <Row>
          <Spacer />
          <TextLink label="Forgot password?" onPress={() => onForgot(email)} />
        </Row>
        <Button label="Sign in" block loading={busy} onPress={submit} />
        <Row justify="center" gap="xs">
          <Text variant="label" color="inkMuted">
            New here?
          </Text>
          <TextLink label="Create an account" onPress={onSignUp} />
        </Row>
      </Stack>
    </AuthScaffold>
  );
}
