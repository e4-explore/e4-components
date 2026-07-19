import type {
  AuthClient,
  BillingClient,
  BillingTier,
  Entitlement,
  FlowClients,
  FlowSession,
  FlowUser,
  ProfileClient,
} from './types';
import { FlowError } from './types';

/** The one-time code every mock email "sends". Shown in Storybook captions. */
export const MOCK_CODE = '123456';

export interface MockClientsOptions {
  /** Simulated network delay so loading states are visible. Default 700ms. */
  latencyMs?: number;
  /** Accounts that exist from the start (password for all: their `password`). */
  seedUsers?: Array<{ email: string; password: string; name?: string }>;
  /** Paywall contents; sensible defaults provided. */
  tiers?: BillingTier[];
}

const DEFAULT_TIERS: BillingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'The essentials, ad-free.',
    features: ['Everything in Free', 'No ads', 'Unlimited saves'],
    priceMonthly: '$2.99',
    priceAnnual: '$24.99',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'The full experience.',
    features: ['Everything in Basic', 'Advanced stats', 'Priority support', 'Early features'],
    priceMonthly: '$7.99',
    priceAnnual: '$59.99',
    badge: 'Most popular',
  },
];

interface MockAccount {
  user: FlowUser;
  password: string;
  verified: boolean;
}

/**
 * In-memory implementation of every flow client. Powers the clickable
 * Storybook demos and works as a stand-in backend while an app is being
 * prototyped — swap for the real adapters without touching flow code.
 */
export function createMockClients(options: MockClientsOptions = {}): FlowClients {
  const latency = options.latencyMs ?? 700;
  const tiers = options.tiers ?? DEFAULT_TIERS;

  const accounts = new Map<string, MockAccount>();
  let nextId = 1;
  for (const seed of options.seedUsers ?? []) {
    accounts.set(seed.email.toLowerCase(), {
      user: { id: String(nextId++), email: seed.email.toLowerCase(), name: seed.name },
      password: seed.password,
      verified: true,
    });
  }

  let session: FlowSession | null = null;
  let entitlement: Entitlement = { tierId: null, period: null, status: 'none' };

  const wait = () => new Promise<void>((r) => setTimeout(r, latency));
  const norm = (email: string) => email.trim().toLowerCase();
  const startSession = (user: FlowUser): FlowSession => {
    session = { user, accessToken: 'mock-token-' + user.id };
    return session;
  };
  const requireSession = (): FlowSession => {
    if (!session) throw new FlowError('unknown', 'You are signed out.');
    return session;
  };

  const auth: AuthClient = {
    async signUp({ email, password, name }) {
      await wait();
      const key = norm(email);
      const existing = accounts.get(key);
      if (existing?.verified) {
        throw new FlowError('email-taken', 'An account with this email already exists.');
      }
      accounts.set(key, {
        user: { id: String(nextId++), email: key, name },
        password,
        verified: false,
      });
      return { requiresVerification: true };
    },

    async verifyEmail({ email, code }) {
      await wait();
      const account = accounts.get(norm(email));
      if (!account) throw new FlowError('user-not-found', 'No account found for this email.');
      if (code !== MOCK_CODE) {
        throw new FlowError('invalid-code', 'That code is not right — try again.');
      }
      account.verified = true;
      return startSession(account.user);
    },

    async resendCode() {
      await wait();
    },

    async signIn({ email, password }) {
      await wait();
      const account = accounts.get(norm(email));
      if (!account || account.password !== password) {
        throw new FlowError('invalid-credentials', 'Incorrect email or password.');
      }
      return startSession(account.user);
    },

    async requestPasswordReset({ email }) {
      await wait();
      // Real backends respond identically whether or not the account exists
      // (no account enumeration); the mock does the same.
      void email;
    },

    async resetPassword({ email, code, newPassword }) {
      await wait();
      const account = accounts.get(norm(email));
      if (!account) throw new FlowError('user-not-found', 'No account found for this email.');
      if (code !== MOCK_CODE) {
        throw new FlowError('invalid-code', 'That code is not right — try again.');
      }
      account.password = newPassword;
      account.verified = true;
      return startSession(account.user);
    },

    async signOut() {
      await wait();
      session = null;
    },

    async deleteAccount() {
      await wait();
      const current = requireSession();
      accounts.delete(norm(current.user.email));
      session = null;
      entitlement = { tierId: null, period: null, status: 'none' };
    },

    async getSession() {
      return session;
    },
  };

  const profile: ProfileClient = {
    async updateProfile(input) {
      await wait();
      const current = requireSession();
      const account = accounts.get(norm(current.user.email));
      if (!account) throw new FlowError('user-not-found', 'No account found.');
      account.user = { ...account.user, ...input };
      session = { ...current, user: account.user };
      return account.user;
    },

    async changePassword({ currentPassword, newPassword }) {
      await wait();
      const current = requireSession();
      const account = accounts.get(norm(current.user.email));
      if (!account || account.password !== currentPassword) {
        throw new FlowError('invalid-credentials', 'Current password is incorrect.');
      }
      account.password = newPassword;
    },

    async changeEmail({ newEmail, password }) {
      await wait();
      const current = requireSession();
      const key = norm(current.user.email);
      const account = accounts.get(key);
      if (!account || account.password !== password) {
        throw new FlowError('invalid-credentials', 'Password is incorrect.');
      }
      const nextKey = norm(newEmail);
      if (accounts.has(nextKey)) {
        throw new FlowError('email-taken', 'An account with this email already exists.');
      }
      accounts.delete(key);
      account.user = { ...account.user, email: nextKey };
      accounts.set(nextKey, account);
      session = { ...current, user: account.user };
      return { requiresVerification: true };
    },
  };

  const billing: BillingClient = {
    async getTiers() {
      await wait();
      return tiers;
    },

    async purchase({ tierId, period }) {
      await wait();
      const renews = new Date();
      renews.setMonth(renews.getMonth() + (period === 'annual' ? 12 : 1));
      entitlement = {
        tierId,
        period,
        renewsAt: renews.toISOString(),
        status: 'active',
      };
      return entitlement;
    },

    async getEntitlement() {
      await wait();
      return entitlement;
    },

    async restorePurchases() {
      await wait();
      return entitlement;
    },

    async cancel() {
      await wait();
      if (entitlement.status === 'active') {
        entitlement = { ...entitlement, status: 'canceled' };
      }
      return entitlement;
    },
  };

  return { auth, profile, billing };
}
