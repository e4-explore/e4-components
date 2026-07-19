import React, { useState } from 'react';
import type { FlowSession } from '../clients/types';
import { StepTransition, useSteps } from '../StepTransition';
import { SignInScreen } from './SignInScreen';
import { SignUpScreen } from './SignUpScreen';
import { VerifyEmailScreen } from './VerifyEmailScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';

export type AuthStep = 'signIn' | 'signUp' | 'verify' | 'forgot' | 'reset';

export interface AuthFlowProps {
  /** Fires once the user holds a live session — route into the app here. */
  onAuthenticated: (session: FlowSession) => void;
  /** Used in headings ("Sign in to <appName>"). */
  appName?: string;
  initialStep?: 'signIn' | 'signUp';
}

/**
 * The complete auth journey — sign in, sign up, email verification, and
 * forgot/reset password — as one self-contained component with spring
 * transitions between steps. No navigation library required: render it as
 * your app's logged-out state and switch on `onAuthenticated`.
 *
 * Backends plug in via FlowServicesProvider (mock clients for prototyping,
 * real adapters in production).
 */
export function AuthFlow({ onAuthenticated, appName, initialStep = 'signIn' }: AuthFlowProps) {
  const nav = useSteps<AuthStep>(initialStep);
  // Email being verified / reset, carried between steps.
  const [pendingEmail, setPendingEmail] = useState('');

  const screen = (() => {
    switch (nav.step) {
      case 'signIn':
        return (
          <SignInScreen
            appName={appName}
            onDone={onAuthenticated}
            onSignUp={() => nav.go('signUp')}
            onForgot={(email) => {
              setPendingEmail(email);
              nav.go('forgot');
            }}
          />
        );
      case 'signUp':
        return (
          <SignUpScreen
            appName={appName}
            onSignIn={() => nav.back('signIn')}
            onDone={onAuthenticated}
            onVerify={(email) => {
              setPendingEmail(email);
              nav.go('verify');
            }}
          />
        );
      case 'verify':
        return (
          <VerifyEmailScreen
            email={pendingEmail}
            onDone={onAuthenticated}
            onBack={() => nav.back('signUp')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordScreen
            initialEmail={pendingEmail}
            onBack={() => nav.back('signIn')}
            onSent={(email) => {
              setPendingEmail(email);
              nav.go('reset');
            }}
          />
        );
      case 'reset':
        return (
          <ResetPasswordScreen
            email={pendingEmail}
            onDone={onAuthenticated}
            onBack={() => nav.back('forgot')}
          />
        );
    }
  })();

  return (
    <StepTransition stepKey={nav.step} direction={nav.direction}>
      {screen}
    </StepTransition>
  );
}
