# Going live with Supabase

Your app runs on an in-memory mock backend out of the box (every "emailed"
code is `123456`). To switch to a real backend, you create one free external
account — a [Supabase](https://supabase.com) project — and point the app at
it. About 5 minutes:

## 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) (free tier is plenty) and
create a project. Note two values from **Project Settings → API**:

- Project URL (`https://xxxx.supabase.co`)
- `anon` public key

## 2. Apply the database migration

Easiest path: open the dashboard **SQL Editor**, paste the contents of
[`migrations/0001_profiles.sql`](migrations/0001_profiles.sql), and run it.
(CLI path: `npx supabase init && npx supabase link && npx supabase db push`.)

This creates the `profiles` table (name/avatar per user, row-level security,
auto-created on sign-up).

## 3. Deploy the delete-account function

```sh
npx supabase functions deploy delete-account
```

The App Store requires in-app account deletion when your app has accounts —
the Settings flow calls this function.

## 4. Switch the emails to 6-digit codes

The flows verify email and reset passwords with 6-digit codes (not magic
links). In **Authentication → Email Templates**, edit **Confirm signup** and
**Reset password** so the body includes the code:

```
Your code is {{ .Token }}
```

## 5. Point the app at your project

```sh
cp .env.example .env
```

Fill in the two values from step 1. `lib/backend.ts` switches from the mock
to Supabase automatically whenever they're present — delete them to go back
to the mock.

## Payments (later)

The paywall runs on a mock `BillingClient`. When you're ready to charge real
money you'll need [RevenueCat](https://www.revenuecat.com) (iOS/Android
in-app subscriptions — the stores require native IAP) and/or
[Stripe](https://stripe.com) (web). Implement the `BillingClient` interface
from `e4-components` with their SDKs and pass it to `createSupabaseClients`
in `lib/backend.ts` — no flow screens change.
