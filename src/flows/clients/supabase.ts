import type {
  AuthClient,
  BillingClient,
  FlowClients,
  FlowSession,
  FlowUser,
  ProfileClient,
} from './types';
import { FlowError } from './types';
import { createMockClients } from './mock';

/**
 * Structural slice of `@supabase/supabase-js`'s client — just the calls the
 * adapter uses. Typed here so the library needs no dependency on the package:
 * the app creates the real client and passes it in.
 */
export interface SupabaseLike {
  auth: {
    signUp(input: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }): Promise<SupabaseAuthResult>;
    verifyOtp(input: {
      email: string;
      token: string;
      type: 'signup' | 'recovery' | 'email' | 'email_change';
    }): Promise<SupabaseAuthResult>;
    resend(input: { type: 'signup'; email: string }): Promise<{ error: SupabaseError }>;
    signInWithPassword(input: { email: string; password: string }): Promise<SupabaseAuthResult>;
    resetPasswordForEmail(email: string): Promise<{ error: SupabaseError }>;
    updateUser(input: {
      email?: string;
      password?: string;
      data?: Record<string, unknown>;
    }): Promise<{
      data: { user: SupabaseUser | null; session?: SupabaseSession | null };
      error: SupabaseError;
    }>;
    getSession(): Promise<{
      data: { session: SupabaseSession | null };
      error: SupabaseError;
    }>;
    getUser(): Promise<{ data: { user: SupabaseUser | null }; error: SupabaseError }>;
    signOut(): Promise<{ error: SupabaseError }>;
  };
  functions: {
    invoke(
      name: string,
      options?: { body?: unknown },
    ): Promise<{ data: unknown; error: SupabaseError }>;
  };
}

type SupabaseError = { message: string; status?: number } | null;

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface SupabaseSession {
  access_token: string;
  user: SupabaseUser;
}

interface SupabaseAuthResult {
  data: { user: SupabaseUser | null; session: SupabaseSession | null };
  error: SupabaseError;
}

export interface SupabaseClientsOptions {
  /** The app's `createClient(url, anonKey)` instance. */
  supabase: SupabaseLike;
  /**
   * Billing implementation. Defaults to the in-memory mock — swap in a
   * RevenueCat/Stripe-backed BillingClient when you wire up payments.
   */
  billing?: BillingClient;
}

function toUser(user: SupabaseUser): FlowUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof meta.name === 'string' ? meta.name : undefined,
    avatarUrl: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
  };
}

function toSession(session: SupabaseSession): FlowSession {
  return { user: toUser(session.user), accessToken: session.access_token };
}

function mapError(error: NonNullable<SupabaseError>): FlowError {
  const message = error.message ?? 'Something went wrong.';
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return new FlowError('invalid-credentials', 'Incorrect email or password.');
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return new FlowError('email-taken', 'An account with this email already exists.');
  }
  if (lower.includes('otp') || lower.includes('token')) {
    return new FlowError('invalid-code', 'That code is not right — try again.');
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return new FlowError('network', 'Could not reach the server — check your connection.');
  }
  return new FlowError('unknown', message);
}

/**
 * Real backend for the flows, on Supabase auth. Requires (see the scaffolded
 * app's `supabase/README.md`):
 *   - the `profiles` migration applied (name/avatar per user, RLS'd)
 *   - the `delete-account` edge function deployed (App Store requirement)
 *   - "Confirm signup" & "Reset password" email templates including
 *     `{{ .Token }}` so users receive the 6-digit codes CodeInput expects
 *
 * Billing stays on the mock until a payments adapter is provided.
 */
export function createSupabaseClients(options: SupabaseClientsOptions): FlowClients {
  const { supabase } = options;
  const billing = options.billing ?? createMockClients().billing;

  const unwrapSession = (result: SupabaseAuthResult): FlowSession => {
    if (result.error) throw mapError(result.error);
    if (!result.data.session) {
      throw new FlowError('unknown', 'No session returned — is email confirmation pending?');
    }
    return toSession(result.data.session);
  };

  const auth: AuthClient = {
    async signUp({ email, password, name }) {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { name } : undefined },
      });
      if (result.error) throw mapError(result.error);
      return { requiresVerification: !result.data.session };
    },

    async verifyEmail({ email, code }) {
      return unwrapSession(await supabase.auth.verifyOtp({ email, token: code, type: 'signup' }));
    },

    async resendCode({ email }) {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw mapError(error);
    },

    async signIn({ email, password }) {
      return unwrapSession(await supabase.auth.signInWithPassword({ email, password }));
    },

    async requestPasswordReset({ email }) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw mapError(error);
    },

    async resetPassword({ email, code, newPassword }) {
      const verified = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
      if (verified.error) throw mapError(verified.error);
      const updated = await supabase.auth.updateUser({ password: newPassword });
      if (updated.error) throw mapError(updated.error);
      if (verified.data.session) return toSession(verified.data.session);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw mapError(error);
      if (!data.session) throw new FlowError('unknown', 'Password updated — sign in again.');
      return toSession(data.session);
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async deleteAccount() {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw mapError(error);
      await supabase.auth.signOut();
    },

    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;
      return toSession(data.session);
    },
  };

  const profile: ProfileClient = {
    async updateProfile(input) {
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.avatarUrl !== undefined) data.avatar_url = input.avatarUrl;
      const result = await supabase.auth.updateUser({ data });
      if (result.error) throw mapError(result.error);
      if (!result.data.user) throw new FlowError('unknown', 'Could not update profile.');
      return toUser(result.data.user);
    },

    async changePassword({ currentPassword, newPassword }) {
      // Supabase has no "verify current password" call; re-authenticate to
      // check it before updating.
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user?.email) throw new FlowError('unknown', 'You are signed out.');
      const check = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password: currentPassword,
      });
      if (check.error) {
        throw new FlowError('invalid-credentials', 'Current password is incorrect.');
      }
      const updated = await supabase.auth.updateUser({ password: newPassword });
      if (updated.error) throw mapError(updated.error);
    },

    async changeEmail({ newEmail, password }) {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user?.email) throw new FlowError('unknown', 'You are signed out.');
      const check = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password,
      });
      if (check.error) {
        throw new FlowError('invalid-credentials', 'Password is incorrect.');
      }
      const updated = await supabase.auth.updateUser({ email: newEmail });
      if (updated.error) throw mapError(updated.error);
      // Supabase emails a confirmation to the new address before switching.
      return { requiresVerification: true };
    },
  };

  return { auth, profile, billing };
}
