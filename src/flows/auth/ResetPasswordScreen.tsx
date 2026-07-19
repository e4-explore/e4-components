import React, { useState } from 'react';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/Toast';
import { useFlowServices } from '../FlowServices';
import type { FlowSession } from '../clients/types';
import { FlowError } from '../clients/types';
import { passwordError } from '../validate';
import { AuthScaffold, TextLink } from './AuthScaffold';
import { CodeInput } from '../components/CodeInput';
import { InlineError } from '../components/InlineError';

export interface ResetPasswordScreenProps {
  email: string;
  onDone: (session: FlowSession) => void;
  onBack: () => void;
}

export function ResetPasswordScreen({ email, onDone, onBack }: ResetPasswordScreenProps) {
  const { auth } = useFlowServices();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async () => {
    const err = passwordError(password);
    setFieldError(err ?? undefined);
    setServerError(null);
    if (err || code.length < 6) return;
    setBusy(true);
    try {
      const session = await auth.resetPassword({ email, code, newPassword: password });
      toast.show('Password updated', { tone: 'success' });
      onDone(session);
    } catch (e) {
      setServerError(e instanceof FlowError ? e.message : 'Something went wrong — try again.');
      if (e instanceof FlowError && e.code === 'invalid-code') setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title="Reset password"
      subtitle={`Enter the code we sent to ${email}, then pick a new password.`}
      onBack={onBack}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text variant="label">Code</Text>
          <CodeInput
            value={code}
            onChange={(v) => {
              setCode(v);
              if (serverError) setServerError(null);
            }}
            invalid={!!serverError}
            disabled={busy}
            autoFocus
          />
        </Stack>
        <FormField label="New password" hint="At least 8 characters." error={fieldError}>
          <Input
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (fieldError) setFieldError(undefined);
            }}
            placeholder="••••••••"
            secureTextEntry={!show}
            autoComplete="new-password"
            onSubmitEditing={submit}
            right={<TextLink label={show ? 'Hide' : 'Show'} onPress={() => setShow(!show)} />}
          />
        </FormField>
        <InlineError message={serverError} />
        <Button
          label="Set new password"
          block
          loading={busy}
          disabled={code.length < 6}
          onPress={submit}
        />
      </Stack>
    </AuthScaffold>
  );
}
