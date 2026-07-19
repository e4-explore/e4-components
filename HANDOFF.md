# Handoff: prove the distribution path + native font loading end-to-end

Paste the prompt below into a fresh session (run it from a directory *outside*
the `e4-components` repo, e.g. `~/code`).

---

## Prompt for the next session

> I maintain a React Native component library, **e4-components**, published as a
> GitHub repo dependency at `github:e4-explore/e4-components`. It ships
> **TypeScript source** (no build step): its `package.json` `main`/`types`/
> `react-native` all point at `src/index.ts`. It's been fully verified on the
> web (react-native-web + Storybook), but two things can only be proven on a
> real native target, and that's your job:
>
> 1. **The distribution path** — that a plain Expo app can `npm install` the
>    library straight from GitHub and that Metro transpiles the library's raw
>    `.ts`/`.tsx` source out of `node_modules` without extra config.
> 2. **Native font loading** — the default `wireframe` theme uses **Shantell
>    Sans**. On web it loads from a Google Fonts `<link>`, but on iOS/Android
>    the font must be registered under the exact family names the theme expects:
>    `ShantellSans_400Regular`, `ShantellSans_500Medium`, `ShantellSans_700Bold`
>    (see `src/theme/fonts.ts` in the library). Prove text actually renders in
>    the hand-drawn face on a device/simulator, not a fallback.
>
> **Fastest path** — the library ships a scaffold CLI that generates a
> ready-to-run Expo app with everything wired (providers nested, `theme.ts`,
> Shantell Sans loading, a demo screen):
>
> ```sh
> npx github:e4-explore/e4-components e4-consumer-test
> cd e4-consumer-test
> npm install
> npx expo start
> ```
>
> Then launch iOS (`i`) or Android (`a`). If you can't run the CLI, build the
> same app by hand — providers required, in order: `GestureHandlerRootView` →
> `SafeAreaProvider` → `ThemeProvider` → `ToastProvider` → `OverlayHost`.
>
> **Peer deps the app needs:** `react-native-reanimated` (v3.10+),
> `react-native-gesture-handler`, plus `expo-font` +
> `@expo-google-fonts/shantell-sans` for the font. Reanimated needs
> `react-native-reanimated/plugin` **last** in `babel.config.js`.
>
> **What to verify (success criteria):**
> - App boots on iOS or Android with no red screen.
> - The demo screen's title/body render in **Shantell Sans** (hand-drawn), not
>   the system font. Confirm by eye and, ideally, a screenshot.
> - `Button` press fires a toast (proves `ToastProvider` + Reanimated worklets).
> - The `Select` dropdown opens and overlays content (proves `OverlayHost` +
>   `measureInWindow` on native).
> - No Metro "unable to resolve / unexpected token" errors from the library's
>   TS source.
>
> **Known risk areas to watch and fix if they bite:**
> - **Metro + TS source in node_modules.** Metro usually transforms
>   `node_modules` and resolves a `main` that points at `src/index.ts`, but if
>   it chokes on the library's TS/JSX, add the package to transpilation (e.g. a
>   `metro.config.js` tweak) — and report exactly what was needed so I can
>   document it or add a prebuilt entry to the library.
> - **Font family names.** If text falls back to the system font, check that the
>   names loaded via `useFonts({...})` match `src/theme/fonts.ts` exactly. If
>   they don't line up on native, tell me the correct registered names and I'll
>   fix `fonts.ts`.
> - **New Architecture / Reanimated version.** If Reanimated errors, note the
>   Expo SDK + Reanimated versions; the scaffold pins Expo ~51 / Reanimated
>   ~3.10.
>
> **Deliverable:** a short report — did it install and boot? does the font
> render natively? — plus any `babel.config.js` / `metro.config.js` /
> `fonts.ts` changes that were required to make it work, so I can fold fixes
> back into the library and the scaffold.

---

## Context for whoever runs this

- The repo is at `github.com/e4-explore/e4-components`, branch `main`.
- Local commits may be ahead of the remote — if the consumer test needs the
  latest library code, **push `main` first** (the GitHub dep installs whatever
  the remote `main` has).
- The scaffold CLI lives at `bin/create-e4-app.js` and pins Expo ~51 with
  Reanimated ~3.10 and `react-native-reanimated/plugin`.
