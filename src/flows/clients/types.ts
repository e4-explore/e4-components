/**
 * Backend contracts for e4 flows.
 *
 * Flows never talk to a backend directly — they call these interfaces via
 * FlowServicesProvider. The library ships two implementations:
 *   - createMockClients() — in-memory fakes powering the Storybook demos
 *   - (coming with e4-backend) Supabase + RevenueCat/Stripe adapters
 * Consumer apps can also hand-roll an implementation against any backend.
 */

export interface FlowUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface FlowSession {
  user: FlowUser;
  accessToken: string;
}

/**
 * Error thrown by flow clients. `code` is stable across implementations so
 * screens can branch on it; `message` is already user-presentable.
 */
export class FlowError extends Error {
  code:
    | 'invalid-credentials'
    | 'email-taken'
    | 'invalid-code'
    | 'user-not-found'
    | 'network'
    | 'unknown';

  constructor(code: FlowError['code'], message: string) {
    super(message);
    this.name = 'FlowError';
    this.code = code;
  }
}

export interface AuthClient {
  /** Create an account. Resolves to whether email verification is required. */
  signUp(input: { email: string; password: string; name?: string }): Promise<{
    requiresVerification: boolean;
  }>;
  /** Confirm the emailed one-time code; resolves to a live session. */
  verifyEmail(input: { email: string; code: string }): Promise<FlowSession>;
  resendCode(input: { email: string }): Promise<void>;
  signIn(input: { email: string; password: string }): Promise<FlowSession>;
  /** Kick off forgot-password: emails a reset code. */
  requestPasswordReset(input: { email: string }): Promise<void>;
  /** Complete forgot-password with the emailed code; signs the user in. */
  resetPassword(input: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<FlowSession>;
  signOut(): Promise<void>;
  /** Permanently delete the signed-in account (App Store requirement). */
  deleteAccount(): Promise<void>;
  getSession(): Promise<FlowSession | null>;
}

export interface ProfileClient {
  updateProfile(input: { name?: string; avatarUrl?: string }): Promise<FlowUser>;
  changePassword(input: { currentPassword: string; newPassword: string }): Promise<void>;
  changeEmail(input: { newEmail: string; password: string }): Promise<{
    requiresVerification: boolean;
  }>;
}

/** A purchasable subscription tier as shown on the paywall. */
export interface BillingTier {
  id: string;
  name: string;
  description: string;
  features: string[];
  /** Display prices, already localized/formatted (e.g. "$4.99"). */
  priceMonthly: string;
  priceAnnual: string;
  /** Optional callout, e.g. "Most popular". */
  badge?: string;
}

export interface Entitlement {
  /** null = free / not subscribed. */
  tierId: string | null;
  period: 'monthly' | 'annual' | null;
  /** ISO date the subscription renews or expires. */
  renewsAt?: string;
  status: 'active' | 'canceled' | 'none';
}

export interface BillingClient {
  getTiers(): Promise<BillingTier[]>;
  purchase(input: {
    tierId: string;
    period: 'monthly' | 'annual';
  }): Promise<Entitlement>;
  getEntitlement(): Promise<Entitlement>;
  restorePurchases(): Promise<Entitlement>;
  /** Cancel at period end (mock) or open the platform manage screen (stores). */
  cancel(): Promise<Entitlement>;
}

export interface FlowClients {
  auth: AuthClient;
  profile: ProfileClient;
  billing: BillingClient;
}
