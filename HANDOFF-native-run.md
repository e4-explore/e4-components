# Handoff: run e4-components natively + the Select mobile fix

Status as of the latest EAS build. Covers (1) what's already proven, (2) the
Select bottom-sheet fix that just landed, and (3) the environment setup **you**
need to enable to run and eyeball it on a real target.

---

## 1. What's already proven

- **Distribution path works.** A plain Expo app installs `e4-components`
  straight from GitHub and Metro transpiles the raw `.ts`/`.tsx` out of
  `node_modules` with **no** `metro.config.js` tweak (verified via
  `expo export`, both iOS and Android, ~924 modules).
- **Native font loading works.** Shantell Sans renders in the hand-drawn face
  on-device (confirmed on an Android EAS build), not a system fallback. The
  family names in `src/theme/fonts.ts` (`ShantellSans_400Regular/500Medium/
  700Bold`) matched what `@expo-google-fonts/shantell-sans` registers — no
  change needed.
- **Scaffold bugs fixed** in `bin/create-e4-app.js` (both were blocking EAS):
  - `android.package` / `ios.bundleIdentifier` are now set (EAS requires them).
  - A top-level `app.json` `splash: { backgroundColor }` is now emitted —
    without it, Android prebuild references `@color/splashscreen_background`
    but never defines it, so the release build fails at the AAPT
    resource-link step. (The `expo-splash-screen` plugin's `plugins`-array
    props are ignored on SDK 51; only the legacy `splash` key is read.)

## 2. The Select mobile fix (bottom sheet)

**Symptom:** on a phone the `Select` dropdown opened mispositioned (pinned near
the top-left, over the title) with garbled text, and forced the soft keyboard
open. Root cause is the anchored-dropdown path relying on `measureInWindow`,
whose coordinates are unreliable while the Android window is being resized by
the keyboard.

**Fix:** `Select` is now responsive.
- **Narrow viewports (< 600pt width — phones):** options open in a
  `BottomSheet` (springs up from the edge, tap-scrim / drag-down to dismiss).
  This path uses **no `measureInWindow` at all**, so it sidesteps the
  positioning bug entirely.
- **Wide viewports / web:** unchanged — the anchored dropdown (already verified
  on web) is retained.

Files changed:
- `src/components/Select.tsx` — `useWindowDimensions()` breakpoint; a
  `renderSheet()` path; effects branch on `useSheet`.
- `src/components/BottomSheet.tsx` — added an optional `onClosed` callback
  (fires after the slide-down settles) so the overlay entry can unregister
  *after* the exit animation instead of cutting it off.
- `src/overlay/OverlayHost.tsx` — added a `fill` placement so a full-screen
  float (the sheet) occupies the whole overlay layer instead of a measured
  (x, y).

The breakpoint is a local `SHEET_MAX_WIDTH = 600` in `Select.tsx`. If you'd
rather key off platform (always sheet on native, dropdown only on web) or
promote it to a real `theme.breakpoints` token, both are small follow-ups.

## 3. What you need to enable to verify it on a device

The bottom-sheet behaviour is native-only and can't be eyeballed from a headless
bundle — it needs a running simulator/emulator or device. Pick one:

### iOS simulator (recommended next per the plan)
1. Install the **full Xcode** from the App Store (Command Line Tools alone are
   not enough — no `simctl`, no simulator).
2. `sudo xcodebuild -license accept`
3. From the consumer app: `npx expo run:ios` (or an EAS iOS build — note a
   *device* build needs a paid Apple Developer account; a *simulator* build via
   `eas build -p ios --profile preview` with `"ios": { "simulator": true }`
   does not).

### Android emulator
1. Install **Android Studio**, then an SDK + a virtual device (AVD).
2. Set `ANDROID_HOME` (e.g. `~/Library/Android/sdk`) and put `platform-tools`
   on `PATH` so `adb` resolves.
3. `npx expo run:android`, or drag the EAS-built `.apk` onto a running emulator.

### No local setup? Browser device farm
Upload the EAS `.apk` to **appetize.io** (free account) and drive it in-browser
— no Xcode/Android SDK needed. Good enough to confirm the sheet + fonts.

### Success criteria to re-check
- App boots, no red screen.
- Title/body render in **Shantell Sans** (hand-drawn).
- On a phone-sized screen, opening **"Pick a sport"** slides a **bottom sheet**
  up (not a top-pinned dropdown); tapping an option selects and dismisses it.
- **"Say hello"** button fires a toast.

## 4. After that

Once it renders correctly on a simulator, the whole flow (scaffold → deps →
prebuild/EAS → device check) is worth codifying as a repeatable **skill**.
