# e4-components

Base component library for all E4 projects, built with React Native (iOS, Android, and web via `react-native-web`).

**The idea:** every component ships looking like an intentional, hand-drawn **wireframe** — playful Shantell Sans type, ink-on-paper palette, hard offset shadows — while the *interactions* are flagship-quality: spring physics, drag-to-reorder, inline editing, and no layout jumps anywhere. Build a whole working app that reads as a prototype, then flip one theme object to rebrand it into a real product.

## Scaffold a new app (fastest start)

```sh
npx github:e4-explore/e4-components my-app
# optionally pre-wire complete journeys (see "Flows" below):
npx github:e4-explore/e4-components my-app --flows auth,onboarding,subscription,settings
cd my-app
npm install
npx expo start
```

`create-e4-app` generates a runnable Expo project with the providers already
nested, a starter `theme.ts`, Shantell Sans font loading, and a demo screen —
so you skip the wiring below and land on a working app.

## Install (in an existing project)

```sh
npm install github:e4-explore/e4-components
npm install react-native-reanimated react-native-gesture-handler react-native-worklets
```

Peer deps: `react`, `react-native`, `react-native-reanimated` (v3.10+ / v4), `react-native-gesture-handler`. Works in Expo and bare RN.

## Quick start

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, ToastProvider, OverlayHost, Stack, Text, Button } from 'e4-components';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ThemeProvider is optional — with no theme you get the wireframe look */}
      <ThemeProvider>
        <ToastProvider>
          {/* Required if you use Select — it renders its floating panel here */}
          <OverlayHost>
            <Stack p="lg">
              <Text variant="title">Hello, wireframe</Text>
              <Button label="Press me" onPress={() => {}} />
            </Stack>
          </OverlayHost>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

### Fonts (native)

The wireframe theme uses **Shantell Sans**. On web it loads from Google Fonts (see `.storybook/preview-head.html` for the tag). On iOS/Android:

```sh
npx expo install @expo-google-fonts/shantell-sans expo-font
```

```tsx
import {
  useFonts,
  ShantellSans_400Regular,
  ShantellSans_500Medium,
  ShantellSans_700Bold,
} from '@expo-google-fonts/shantell-sans';
```

Branded themes that use `systemFonts` need no font setup at all.

## Theming

Every visual value flows from a `Theme` object. Rebranding a project is one file:

```tsx
import { createTheme, systemFonts, ThemeProvider } from 'e4-components';

const brand = createTheme({
  name: 'acme',
  colors: { primary: '#155EEF', accent: '#155EEF', border: '#D0D5DD' },
  borders: { sketchStyle: 'solid' },
  typography: { faces: systemFonts },
});

<ThemeProvider theme={brand}>…</ThemeProvider>
```

`createTheme` deep-merges over the wireframe base — override only what changes. See `.storybook/brandTheme.ts` for a complete example, and use the **theme toolbar toggle in Storybook** to preview any component in both.

### Dark mode

`wireframeDark` is the "chalkboard" companion to `wireframe` — same face and hard offset shadows, but ink/paper swap (chalk-white lines on near-black, so the shadow reads as a soft glow):

```tsx
import { wireframeDark, ThemeProvider } from 'e4-components';

<ThemeProvider theme={wireframeDark}>…</ThemeProvider>
```

Storybook has a separate **Mode toolbar toggle** (☀️/🌙) alongside the theme toggle, so any theme × light/dark combination is previewable.

## Storybook

```sh
npm install
npm run storybook   # → http://localhost:6006
```

Every component has interactive stories; `Examples/Full screen` shows them composed into an app screen. `npm run build-storybook` produces a static site you can host (GitHub Pages / Vercel) as the living style guide.

## What's inside

- **Primitives** — `Box` (token-aware style props), `Text` (variants), `Stack`/`Row`/`Spacer`, `Pressable` (springy press feedback)
- **Core** — `Button`, `Card`, `Avatar`, `Badge`, `Divider`
- **Forms** — `Input`, `TextArea`, `FormField` (animated errors), `Checkbox`, `RadioGroup`, `Switch`, `Select` (floating panel overlays content below the trigger, via `OverlayHost`)
- **Inline** — `InlineEdit` (tap-to-edit, pixel-stable swap), `Accordion`, `Expandable` (the measured-height spring engine)
- **Lists & data** — `List`/`ListItem` (animated add/remove), `DraggableList` (long-press lift, spring reorder, edge auto-scroll), `Table`, `EmptyState`, `Skeleton`, `ProgressBar`
- **Drag & drop (kanban)** — `DragProvider` + `DragColumn`: move cards across columns, floating overlay clone follows the finger, dashed insertion line marks the drop slot, board-level `onDrop({from, itemKey, to, toIndex, payload})`
- **App shell** — `Header`, `TabBar` (sliding indicator), `BottomSheet` (pan-to-dismiss), `ToastProvider`/`useToast`
- **Overlay** — `OverlayHost`/`useOverlay` (measured-position floating panels that escape any ancestor's stacking context — powers Select, available for building your own popovers/tooltips)
- **Icons** — `Icon` (`chevronLeft/Right/Down`, `check`, `close`, `grip`, `home`, `search`, `chart`, `smile`, `edit`) — built from plain Views (rotated bars, border-corner chevrons, dot grids), not SVG, so no extra native dependency
- **Motion** — shared spring presets (`snappy` / `gentle` / `bouncy`) and `settle`/`enter`/`exit` layout transitions

## Flows

Beyond components, the library ships complete journeys — browsable under **Flows** in Storybook (fully clickable against a mock backend) and scaffoldable into a new app via the Create app button or `--flows`:

- **Auth** — `AuthFlow`: sign in, sign up, 6-digit email verification (`CodeInput`), forgot/reset password, session hand-off via `onAuthenticated`. Delete account ships in Settings (an App Store requirement when you have accounts).
- **Onboarding** — `OnboardingFlow`: welcome slides, name/avatar capture, permission priming ("ask before the OS asks").
- **Subscription** — `PaywallScreen` (tier picker, monthly/annual, restore) + `ManageSubscriptionScreen` (status, change plan, inline cancel confirm).
- **Settings** — `SettingsFlow`: account hub, edit profile, change password/email, notification preferences, subscription entry, sign out, inline delete-account confirm.
- **Legal** — `LegalConsentScreen` (first-run terms & privacy gate) and `TrackingConsentScreen` (iOS tracking-prompt priming).
- **Ops** — `ForceUpgradeScreen`, `MaintenanceScreen`, and `OfflineBanner`: prop-driven; your app decides when, these decide how.

Flows never talk to a backend directly. They call the `AuthClient` / `ProfileClient` / `BillingClient` interfaces provided through `FlowServicesProvider`. Two implementations ship:

- `createMockClients()` — zero-setup in-memory backend (every "emailed" code is `123456`); powers the Storybook demos and fresh scaffolds.
- `createSupabaseClients({ supabase })` — real auth + profiles on [Supabase](https://supabase.com); pass in your app's `createClient(url, anonKey)` instance. Billing stays on the mock until you provide a `BillingClient` (RevenueCat for store IAP, Stripe for web).

Screens only read colors/fonts through the theme, so your `theme.ts` restyles every flow while library updates keep flowing in via the semver range + Renovate.

Scaffold with any combination (settings requires auth):

```sh
npx github:e4-explore/e4-components my-app --flows legal,auth,onboarding,subscription,settings
```

The generated `App.tsx` composes the selected packs gate by gate — legal → auth → onboarding → paywall → home ⇄ settings — and the app arrives backend-ready: a `supabase/` folder (profiles migration, `delete-account` edge function, go-live README) plus `lib/backend.ts`, which runs the mock until you fill in `.env` with your Supabase project's URL and anon key, then switches automatically.

## Design principles

1. **Tokens or nothing** — components never hardcode a visual value.
2. **Inline over modal** — expand, edit, and add in place; push neighbors with springs, never jump-cut. (Select's options panel is the exception: it floats over what follows rather than pushing it, like a native dropdown.)
3. **One motion language** — all animation goes through the theme's spring presets.
4. **Wireframe is a feature** — `wireframe` stays exported forever; any app can flip into blueprint mode for demos.

## Roadmap ideas

- Variable-height rows in `DraggableList` and `DragColumn`
- Cross-column auto-scroll while dragging on a tall board
- Haptics hook (expo-haptics, optional)
- Publish Storybook to a shared URL; visual regression via Chromatic
- First real consumer: prove the GitHub install path + native font loading on a device (see `HANDOFF.md`)
