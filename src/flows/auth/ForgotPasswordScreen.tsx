import React, { useState } from 'react';
import { Stack } from '../../primitives/Stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/Toast';
import { useFlowServices } from '../FlowServices';
import { FlowError } from '../clients/types';
import { emailError } from '../validate';
import { AuthScaffold } from './AuthScaffold';
import { InlineError } from '../components/InlineError';

export interface ForgotPasswordScreenProps {
  /** Prefill, usually carried over from the sign-in form. */
  initialEmail?: string;
  onBack: () => void;
  /** Reset code sent; move on to the reset screen. */
  onSent: (email: string) => void;
}

export function ForgotPasswordScreen({
  initialEmail = '',
  onBack,
  onSent,
}: ForgotPasswordScreenProps) {
  const { auth } = useFlowServices();
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async () => {
    const err = emailError(email);
    setFieldError(err ?? undefined);
    setServerError(null);
    if (err) return;
    setBusy(true);
    try {
      await auth.requestPasswordReset({ email });
      toast.show('Reset code sent', { tone: 'success' });
      onSent(email);
    } catch (e) {
      setServerError(e instanceof FlowError ? e.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title="Forgot password"
      subtitle="Enter your email and we’ll send you a reset code."
      onBack={onBack}
    >
      <Stack gap="md">
        <FormField label="Email" error={fieldError}>
          <Input
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (fieldError) setFieldError(undefined);
            }}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onSubmitEditing={submit}
            autoFocus={!initialEmail}
          />
        </FormField>
        <InlineError message={serverError} />
        <Button label="Send reset code" block loading={busy} onPress={submit} />
      </Stack>
    </AuthScaffold>
  );
}
