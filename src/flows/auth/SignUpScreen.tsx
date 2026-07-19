import React, { useState } from 'react';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { Checkbox } from '../../components/Checkbox';
import { useFlowServices } from '../FlowServices';
import type { FlowSession } from '../clients/types';
import { FlowError } from '../clients/types';
import { emailError, passwordError } from '../validate';
import { AuthScaffold, TextLink } from './AuthScaffold';
import { InlineError } from '../components/InlineError';

export interface SignUpScreenProps {
  appName?: string;
  onSignIn: () => void;
  /** Account created, email verification pending. */
  onVerify: (email: string) => void;
  /** Account created and immediately live (backend skips verification). */
  onDone: (session: FlowSession) => void;
}

export function SignUpScreen({ appName, onSignIn, onVerify, onDone }: SignUpScreenProps) {
  const { auth } = useFlowServices();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async () => {
    const next = {
      email: emailError(email) ?? undefined,
      password: passwordError(password) ?? undefined,
      terms: agreed ? undefined : 'Please accept the terms to continue.',
    };
    setErrors(next);
    setServerError(null);
    if (next.email || next.password || next.terms) return;
    setBusy(true);
    try {
      const { requiresVerification } = await auth.signUp({
        email,
        password,
        name: name.trim() || undefined,
      });
      if (requiresVerification) {
        onVerify(email);
      } else {
        onDone(await auth.signIn({ email, password }));
      }
    } catch (e) {
      setServerError(e instanceof FlowError ? e.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title="Create account"
      subtitle={appName ? `Join ${appName} in under a minute.` : 'Join in under a minute.'}
    >
      <Stack gap="md">
        <FormField label="Name" optional>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ethan Grove"
            autoComplete="name"
          />
        </FormField>
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
          />
        </FormField>
        <FormField label="Password" hint="At least 8 characters." error={errors.password}>
          <Input
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="••••••••"
            secureTextEntry={!show}
            autoComplete="new-password"
            right={<TextLink label={show ? 'Hide' : 'Show'} onPress={() => setShow(!show)} />}
          />
        </FormField>
        <FormField label="Terms" error={errors.terms}>
          <Checkbox
            checked={agreed}
            onChange={(v) => {
              setAgreed(v);
              if (errors.terms) setErrors((p) => ({ ...p, terms: undefined }));
            }}
            label="I agree to the Terms of Service and Privacy Policy"
          />
        </FormField>
        <InlineError message={serverError} />
        <Button label="Create account" block loading={busy} onPress={submit} />
        <Row justify="center" gap="xs">
          <Text variant="label" color="inkMuted">
            Already have an account?
          </Text>
          <TextLink label="Sign in" onPress={onSignIn} />
        </Row>
      </Stack>
    </AuthScaffold>
  );
}
