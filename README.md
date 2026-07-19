# e4-components

Base component library for all E4 projects, built with React Native (iOS, Android, and web via `react-native-web`).

**The idea:** every component ships looking like an intentional, hand-drawn **wireframe** — playful Shantell Sans type, ink-on-paper palette, hard offset shadows — while the *interactions* are flagship-quality: spring physics, drag-to-reorder, inline editing, and no layout jumps anywhere. Build a whole working app that reads as a prototype, then flip one theme object to rebrand it into a real product.

## Install (in a consuming project)

```sh
npm install github:<you>/e4-components
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
- **App shell** — `Header`, `TabBar` (sliding indicator), `BottomSheet` (pan-to-dismiss), `ToastProvider`/`useToast`
- **Overlay** — `OverlayHost`/`useOverlay` (measured-position floating panels that escape any ancestor's stacking context — powers Select, available for building your own popovers/tooltips)
- **Icons** — `Icon` (`chevronLeft/Right/Down`, `check`, `close`, `grip`, `home`, `search`, `chart`, `smile`, `edit`) — built from plain Views (rotated bars, border-corner chevrons, dot grids), not SVG, so no extra native dependency
- **Motion** — shared spring presets (`snappy` / `gentle` / `bouncy`) and `settle`/`enter`/`exit` layout transitions

## Design principles

1. **Tokens or nothing** — components never hardcode a visual value.
2. **Inline over modal** — expand, edit, and add in place; push neighbors with springs, never jump-cut. (Select's options panel is the exception: it floats over what follows rather than pushing it, like a native dropdown.)
3. **One motion language** — all animation goes through the theme's spring presets.
4. **Wireframe is a feature** — `wireframe` stays exported forever; any app can flip into blueprint mode for demos.

## Roadmap ideas

- Cross-container drag (kanban) via a global `DragProvider`
- Variable-height rows in `DraggableList`
- Haptics hook (expo-haptics, optional)
- `npx create-e4-app` scaffold with a pre-wired theme file
- Publish Storybook to a shared URL; visual regression via Chromatic
