import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Box } from '../../primitives/Box';
import { Stack, Row } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { FormField } from '../../components/FormField';
import { Select } from '../../components/Select';
import { Accordion } from '../../components/Accordion';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../theme/ThemeProvider';
import { emailError } from '../validate';
import { StepTransition, useSteps } from '../StepTransition';
import { AuthScaffold } from '../auth/AuthScaffold';
import { InlineError } from '../components/InlineError';

/**
 * Support pack: FAQ-first help that only escalates to a ticket when the
 * answers don't cut it.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SupportTicket {
  category: 'bug' | 'question' | 'feedback' | 'billing';
  message: string;
  email?: string;
}

export interface SupportFlowProps {
  /**
   * Deliver the ticket — POST it, email it, drop it in a channel. Reject to
   * show an error; resolve to reach the sent screen.
   */
  onSubmitTicket: (ticket: SupportTicket) => Promise<void> | void;
  /** Common questions shown before the contact form. */
  faq?: FaqItem[];
  /** Prefill from the signed-in user; otherwise the form asks for it. */
  userEmail?: string;
  onBack?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'bug', label: 'Something is broken' },
  { value: 'question', label: 'I have a question' },
  { value: 'feedback', label: 'Feedback or idea' },
  { value: 'billing', label: 'Billing' },
] as const;

/** FAQ hub → contact form → sent confirmation, with spring transitions. */
export function SupportFlow({ onSubmitTicket, faq = [], userEmail, onBack }: SupportFlowProps) {
  const theme = useTheme();
  const toast = useToast();
  const nav = useSteps<'hub' | 'form' | 'sent'>(faq.length > 0 ? 'hub' : 'form');

  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail ?? '');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ category?: string; message?: string; email?: string }>(
    {},
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async () => {
    const next = {
      category: category ? undefined : 'Pick a topic.',
      message: message.trim() ? undefined : 'Tell us what’s going on.',
      email: userEmail ? undefined : (emailError(email) ?? undefined),
    };
    setErrors(next);
    setServerError(null);
    if (next.category || next.message || next.email) return;
    setBusy(true);
    try {
      await onSubmitTicket({
        category: category as SupportTicket['category'],
        message: message.trim(),
        email: (userEmail ?? email).trim() || undefined,
      });
      toast.show('Message sent', { tone: 'success' });
      nav.go('sent');
    } catch {
      setServerError('Could not send your message — try again.');
    } finally {
      setBusy(false);
    }
  };

  let screen: React.ReactNode;
  if (nav.step === 'hub') {
    screen = (
      <AuthScaffold
        title="Help & support"
        subtitle="Quick answers first — a human if you need one."
        onBack={onBack}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Stack gap="lg">
            <Accordion
              items={faq.map((item, i) => ({
                key: String(i),
                title: item.question,
                content: (
                  <Text variant="caption" color="inkMuted">
                    {item.answer}
                  </Text>
                ),
              }))}
            />
            <Stack gap="sm">
              <Text variant="label" color="inkMuted">
                Still stuck?
              </Text>
              <Button label="Contact us" variant="secondary" block onPress={() => nav.go('form')} />
            </Stack>
          </Stack>
        </ScrollView>
      </AuthScaffold>
    );
  } else if (nav.step === 'form') {
    screen = (
      <AuthScaffold
        title="Contact us"
        subtitle="Goes straight to the people building this."
        onBack={faq.length > 0 ? () => nav.back('hub') : onBack}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Stack gap="md">
            <FormField label="Topic" error={errors.category}>
              <Select
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  if (errors.category) setErrors((p) => ({ ...p, category: undefined }));
                }}
                placeholder="Pick a topic"
                options={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </FormField>
            {!userEmail ? (
              <FormField label="Your email" hint="So we can reply." error={errors.email}>
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
            ) : null}
            <FormField label="Message" error={errors.message}>
              <TextArea
                value={message}
                onChangeText={(v) => {
                  setMessage(v);
                  if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
                }}
                placeholder="What’s going on?"
              />
            </FormField>
            <InlineError message={serverError} />
            <Button label="Send message" block loading={busy} onPress={submit} />
          </Stack>
        </ScrollView>
      </AuthScaffold>
    );
  } else {
    screen = (
      <Box flex={1} bg="background" p="lg" style={{ justifyContent: 'center' }}>
        <EmptyState
          glyph="✓"
          title="Message sent"
          description={
            (userEmail ?? email)
              ? `We’ll get back to you at ${userEmail ?? email}.`
              : 'We’ll get back to you soon.'
          }
          action={
            onBack ? (
              <Button label="Done" onPress={onBack} />
            ) : (
              <Button
                label="Send another"
                variant="secondary"
                onPress={() => {
                  setMessage('');
                  setCategory(null);
                  nav.back(faq.length > 0 ? 'hub' : 'form');
                }}
              />
            )
          }
        />
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
