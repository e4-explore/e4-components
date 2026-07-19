import React, { useEffect, useState } from 'react';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { useFlowServices } from '../FlowServices';
import type { FlowSession } from '../clients/types';
import { FlowError } from '../clients/types';
import { AuthScaffold } from './AuthScaffold';
import { CodeInput } from '../components/CodeInput';
import { InlineError } from '../components/InlineError';

const RESEND_SECONDS = 30;

export interface VerifyEmailScreenProps {
  email: string;
  onDone: (session: FlowSession) => void;
  onBack: () => void;
}

export function VerifyEmailScreen({ email, onDone, onBack }: VerifyEmailScreenProps) {
  const { auth } = useFlowServices();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (filled: string) => {
    setBusy(true);
    setError(null);
    try {
      const session = await auth.verifyEmail({ email, code: filled });
      toast.show('Email verified', { tone: 'success' });
      onDone(session);
    } catch (e) {
      setError(e instanceof FlowError ? e.message : 'Something went wrong — try again.');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setCooldown(RESEND_SECONDS);
    await auth.resendCode({ email });
    toast.show('Code sent', { tone: 'success' });
  };

  return (
    <AuthScaffold
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}.`}
      onBack={onBack}
    >
      <Stack gap="lg">
        <CodeInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(null);
          }}
          onFilled={submit}
          invalid={!!error}
          disabled={busy}
          autoFocus
        />
        <InlineError message={error} />
        <Row justify="center" gap="xs">
          <Text variant="label" color="inkMuted">
            Didn’t get it?
          </Text>
          <Button
            label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            size="sm"
            variant="ghost"
            disabled={cooldown > 0}
            onPress={resend}
          />
        </Row>
        <Button
          label="Verify"
          block
          loading={busy}
          disabled={code.length < 6}
          onPress={() => submit(code)}
        />
      </Stack>
    </AuthScaffold>
  );
}
