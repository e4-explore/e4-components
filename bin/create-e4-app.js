#!/usr/bin/env node
'use strict';

/*
 * create-e4-app — scaffold a new Expo app pre-wired with e4-components.
 *
 *   npx github:e4-explore/e4-components my-app
 *   # optionally bake brand colors into the generated theme.ts:
 *   npx github:e4-explore/e4-components my-app --primary "#3355D9" --accent "#4B7BFF"
 *   # or, once cloned locally:
 *   node bin/create-e4-app.js my-app
 *
 * Produces a runnable Expo project with the providers already in place
 * (GestureHandlerRootView → ThemeProvider → ToastProvider → OverlayHost),
 * a starter theme.ts, Shantell Sans font loading, and a demo screen built
 * entirely from the library.
 */

const fs = require('fs');
const path = require('path');

// Reference the library by a semver *range* rather than a bare branch, so the
// scaffolded app floats forward on published tags instead of freezing on the
// commit that happened to be HEAD at install time. Continuous releases only
// bump the patch, so a caret on the current minor (`^0.1.0` → >=0.1.0 <0.2.0)
// captures every future patch. Renovate (renovate.json below) handles minor/
// major bumps. Derived from the library's own version so it always tracks the
// version this app was scaffolded against.
const LIB_VERSION = require(path.join(__dirname, '..', 'package.json')).version;
const [LIB_MAJOR, LIB_MINOR] = LIB_VERSION.split('.');
const GITHUB_DEP =
  'github:e4-explore/e4-components#semver:^' + LIB_MAJOR + '.' + LIB_MINOR + '.0';

function fail(msg) {
  console.error('\n  ✗ ' + msg + '\n');
  process.exit(1);
}

const argv = process.argv.slice(2);
const positional = [];
const flags = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--primary' || argv[i] === '--accent' || argv[i] === '--flows') {
    flags[argv[i].slice(2)] = argv[i + 1];
    i++;
  } else {
    positional.push(argv[i]);
  }
}

const projectName = positional[0];

if (!projectName) {
  fail('Usage: create-e4-app <project-name> [--primary #hex] [--accent #hex] [--flows auth]');
}
if (!/^[a-z0-9][a-z0-9-_]*$/i.test(projectName)) {
  fail('Project name must be alphanumeric (dashes and underscores allowed).');
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
for (const key of ['primary', 'accent']) {
  if (flags[key] !== undefined && !HEX_RE.test(flags[key])) {
    fail('--' + key + ' must be a hex color like #3355D9.');
  }
}
const primaryColor = flags.primary || '#3355D9';
const accentColor = flags.accent || '#4B7BFF';

// Flow packs to pre-wire into the app. Comma-separated,
// e.g. --flows auth,subscription. Each pack maps to ready-made journeys
// exported by the library, composed into one app skeleton:
// legal → auth → onboarding → paywall → home ⇄ settings.
const KNOWN_FLOWS = ['legal', 'auth', 'onboarding', 'subscription', 'settings'];
const selectedFlows = (flags.flows || '')
  .split(',')
  .map((f) => f.trim().toLowerCase())
  .filter(Boolean);
for (const flow of selectedFlows) {
  if (!KNOWN_FLOWS.includes(flow)) {
    fail('Unknown flow "' + flow + '". Available: ' + KNOWN_FLOWS.join(', '));
  }
}
const withLegal = selectedFlows.includes('legal');
const withAuth = selectedFlows.includes('auth');
const withOnboarding = selectedFlows.includes('onboarding');
const withBilling = selectedFlows.includes('subscription');
const withSettings = selectedFlows.includes('settings');
if (withSettings && !withAuth) {
  fail('The settings flow needs an account to manage — include auth too (--flows auth,settings).');
}
const anyFlow = selectedFlows.length > 0;

const targetDir = path.resolve(process.cwd(), projectName);
if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
  fail('Directory "' + projectName + '" already exists and is not empty.');
}

// EAS Build (and `expo prebuild`) require a reverse-DNS native identifier;
// derive one from the project name so cloud builds work without manual setup.
const bundleId = 'com.e4app.' + projectName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const files = {};

files['package.json'] = JSON.stringify(
  {
    name: projectName,
    version: '1.0.0',
    main: 'index.ts',
    private: true,
    scripts: {
      start: 'expo start',
      ios: 'expo start --ios',
      android: 'expo start --android',
      web: 'expo start --web',
    },
    dependencies: {
      'e4-components': GITHUB_DEP,
      '@expo-google-fonts/shantell-sans': '^0.2.3',
      // Only referenced by lib/backend.ts once real env vars exist, but
      // installed up front so going live is config-only.
      ...(anyFlow ? { '@supabase/supabase-js': '^2.45.0' } : {}),
      expo: '~51.0.0',
      'expo-font': '~12.0.0',
      'expo-status-bar': '~1.12.0',
      react: '18.2.0',
      'react-native': '0.74.5',
      'react-native-gesture-handler': '~2.16.1',
      'react-native-reanimated': '~3.10.1',
      'react-native-safe-area-context': '4.10.5',
    },
    devDependencies: {
      '@babel/core': '^7.24.0',
      '@types/react': '~18.2.79',
      typescript: '~5.3.3',
    },
  },
  null,
  2,
);

files['app.json'] = JSON.stringify(
  {
    expo: {
      name: projectName,
      slug: projectName,
      version: '1.0.0',
      orientation: 'portrait',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: { supportsTablet: true, bundleIdentifier: bundleId },
      android: { package: bundleId },
      web: { bundler: 'metro' },
      // Required: without this, prebuild still emits an Android drawable
      // referencing color/splashscreen_background, but never defines that
      // color resource, and the release build fails at the AAPT
      // resource-link step. (The `expo-splash-screen` plugin's `plugins`
      // array props are ignored on this SDK — only this legacy top-level
      // `splash` key is actually read.)
      splash: { backgroundColor: '#FAFAF7', resizeMode: 'contain' },
    },
  },
  null,
  2,
);

files['babel.config.js'] =
  "module.exports = function (api) {\n" +
  "  api.cache(true);\n" +
  "  return {\n" +
  "    presets: ['babel-preset-expo'],\n" +
  "    // Reanimated's plugin must be listed last.\n" +
  "    plugins: ['react-native-reanimated/plugin'],\n" +
  "  };\n" +
  "};\n";

files['tsconfig.json'] = JSON.stringify(
  { extends: 'expo/tsconfig.base', compilerOptions: { strict: true } },
  null,
  2,
);

files['index.ts'] =
  "import { registerRootComponent } from 'expo';\n" +
  "import App from './App';\n\n" +
  'registerRootComponent(App);\n';

files['theme.ts'] =
  "import { createTheme } from 'e4-components';\n\n" +
  '// Start from the wireframe base and override only what you want to brand.\n' +
  '// As written the app still looks like an intentional wireframe. When you\n' +
  "// want a real-product look, set borders.sketchStyle to 'solid' and swap the\n" +
  '// fonts (systemFonts) here.\n' +
  'export const theme = createTheme({\n' +
  "  name: '" + projectName + "',\n" +
  '  colors: {\n' +
  "    primary: '" + primaryColor + "',\n" +
  "    accent: '" + accentColor + "',\n" +
  '  },\n' +
  '});\n';

// ---- App.tsx assembly ------------------------------------------------------
// The selected flow packs compose into one skeleton, gate by gate:
//   fonts → legal → auth → onboarding → paywall → (home ⇄ settings)

function indent(code, spaces) {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.length > 0 ? pad + line : line))
    .join('\n');
}

// The demo Home screen. With the auth flow enabled it shows who is signed in
// and offers sign-out (or the settings entry point); without it, it's the
// plain component playground.
const homeTryItCard =
  "      <Card>\n" +
  "        <Stack gap=\"sm\">\n" +
  "          <Text variant=\"heading\">Try it</Text>\n" +
  "          <Input placeholder=\"Your name\" value={name} onChangeText={setName} />\n" +
  "          <Select\n" +
  "            value={sport}\n" +
  "            onChange={setSport}\n" +
  "            placeholder=\"Pick a sport\"\n" +
  "            options={[\n" +
  "              { value: 'golf', label: 'Golf' },\n" +
  "              { value: 'tennis', label: 'Tennis' },\n" +
  "              { value: 'climbing', label: 'Climbing' },\n" +
  "            ]}\n" +
  "          />\n" +
  "          <Button label=\"Say hello\" onPress={() => toast.show('Hello, ' + (name || 'wireframe') + '!')} />\n" +
  "        </Stack>\n" +
  "      </Card>\n";

const homeSignature = withSettings
  ? 'function Home({ session, onOpenSettings }: { session: FlowSession; onOpenSettings: () => void }) {\n'
  : withAuth
    ? 'function Home({ session, onSignOut }: { session: FlowSession; onSignOut: () => void }) {\n'
    : 'function Home() {\n';

const homeHeader = withSettings
  ? "      <Row>\n" +
    "        <Text variant=\"title\">It works.</Text>\n" +
    "        <Spacer />\n" +
    "        <Button label=\"Settings\" size=\"sm\" variant=\"ghost\" onPress={onOpenSettings} />\n" +
    "      </Row>\n" +
    "      <Text color=\"inkMuted\">\n" +
    "        Signed in as {session.user.email}. This screen is rendered entirely from\n" +
    "        e4-components, installed from GitHub.\n" +
    "      </Text>\n"
  : withAuth
    ? "      <Row>\n" +
      "        <Text variant=\"title\">It works.</Text>\n" +
      "        <Spacer />\n" +
      "        <Button label=\"Sign out\" size=\"sm\" variant=\"ghost\" onPress={onSignOut} />\n" +
      "      </Row>\n" +
      "      <Text color=\"inkMuted\">\n" +
      "        Signed in as {session.user.email}. This screen is rendered entirely from\n" +
      "        e4-components, installed from GitHub.\n" +
      "      </Text>\n"
    : "      <Text variant=\"title\">It works.</Text>\n" +
      "      <Text color=\"inkMuted\">\n" +
      "        This screen is rendered entirely from e4-components, installed from GitHub.\n" +
      "      </Text>\n";

const homeComponent =
  homeSignature +
  "  const toast = useToast();\n" +
  "  const [name, setName] = React.useState('');\n" +
  "  const [sport, setSport] = React.useState<string | null>(null);\n" +
  "  return (\n" +
  "    <Stack p=\"lg\" gap=\"md\">\n" +
  homeHeader +
  homeTryItCard +
  "    </Stack>\n" +
  "  );\n" +
  "}\n";

const libImports = [
  'ThemeProvider',
  'ToastProvider',
  'OverlayHost',
  'Stack',
  ...(withAuth ? ['Row', 'Spacer'] : []),
  'Text',
  'Button',
  'Card',
  'Input',
  'Select',
  'DismissKeyboard',
  'useToast',
  ...(anyFlow ? ['FlowServicesProvider'] : []),
  ...(withLegal ? ['LegalConsentScreen'] : []),
  ...(withAuth ? ['AuthFlow', 'type FlowSession'] : []),
  ...(withOnboarding ? ['OnboardingFlow'] : []),
  ...(withBilling ? ['PaywallScreen'] : []),
  ...(withSettings ? ['SettingsFlow'] : []),
];

// App state hooks, one per selected gate.
const stateLines = [];
if (withLegal) {
  stateLines.push(
    '  // Real apps persist this (e.g. AsyncStorage) and add real terms/privacy URLs.',
    '  const [consented, setConsented] = React.useState(false);',
  );
}
if (withAuth) {
  stateLines.push('  const [session, setSession] = React.useState<FlowSession | null>(null);');
}
if (withOnboarding) {
  stateLines.push(
    '  // Real apps persist this (e.g. AsyncStorage) so onboarding runs once per install.',
    '  const [onboarded, setOnboarded] = React.useState(false);',
  );
}
if (withBilling) {
  stateLines.push('  const [paid, setPaid] = React.useState(false);');
}
if (withSettings) {
  stateLines.push("  const [screen, setScreen] = React.useState<'home' | 'settings'>('home');");
  stateLines.push('  const signOut = () => {');
  stateLines.push("    setScreen('home');");
  stateLines.push('    setSession(null);');
  stateLines.push('  };');
} else if (withAuth) {
  stateLines.push('  const signOut = () => {');
  stateLines.push('    clients.auth.signOut().then(() => setSession(null));');
  stateLines.push('  };');
}

// Gate chain, outermost first: fonts → legal → auth → onboarding → paywall →
// (settings ⇄ home). Composed as one flat conditional chain.
const homeJsx =
  '<DismissKeyboard>\n' +
  (withSettings
    ? "  <Home session={session} onOpenSettings={() => setScreen('settings')} />\n"
    : withAuth
      ? '  <Home session={session} onSignOut={signOut} />\n'
      : '  <Home />\n') +
  '</DismissKeyboard>';

const gates = [];
if (withLegal) {
  gates.push({
    cond: '!consented',
    jsx:
      '<LegalConsentScreen appName="' +
      projectName +
      '" onAccepted={() => setConsented(true)} />',
  });
}
if (withAuth) {
  gates.push({
    cond: '!session',
    jsx: '<AuthFlow appName="' + projectName + '" onAuthenticated={setSession} />',
  });
}
if (withOnboarding) {
  gates.push({
    cond: '!onboarded',
    jsx:
      '<OnboardingFlow appName="' + projectName + '" onDone={() => setOnboarded(true)} />',
  });
}
if (withBilling) {
  gates.push({
    cond: '!paid',
    jsx: '<PaywallScreen onPurchased={() => setPaid(true)} onSkip={() => setPaid(true)} />',
  });
}
if (withSettings) {
  gates.push({
    cond: "screen === 'settings' && session",
    jsx:
      '<SettingsFlow\n' +
      '  session={session}\n' +
      "  onClose={() => setScreen('home')}\n" +
      '  onSignedOut={signOut}\n' +
      (withBilling ? '  onChangePlan={() => setPaid(false)}\n' : '') +
      '  appVersion="v1.0.0"\n' +
      '/>',
  });
}

const spinnerJsx =
  "<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>\n" +
  '  <ActivityIndicator />\n' +
  '</View>';

let renderExpr = '(\n' + indent(homeJsx, 2) + '\n)';
for (const gate of gates.reverse()) {
  renderExpr = gate.cond + ' ? (\n' + indent(gate.jsx, 2) + '\n) : ' + renderExpr;
}
renderExpr = '!fontsLoaded ? (\n' + indent(spinnerJsx, 2) + '\n) : ' + renderExpr;

// Provider tree; FlowServicesProvider only when a flow pack is included.
const innerDepth = anyFlow ? 16 : 14;
const safeAreaChildren =
  indent('{' + renderExpr + '}', innerDepth + 2) +
  '\n' +
  indent('<StatusBar style="auto" />', innerDepth + 2);
const safeArea =
  indent('<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>', innerDepth) +
  '\n' +
  safeAreaChildren +
  '\n' +
  indent('</SafeAreaView>', innerDepth);
const providersInner = anyFlow
  ? indent('<FlowServicesProvider clients={clients}>', 14) + '\n' + safeArea + '\n' + indent('</FlowServicesProvider>', 14)
  : safeArea;

const appBody =
  'export default function App() {\n' +
  '  const [fontsLoaded] = useFonts({\n' +
  '    ShantellSans_400Regular,\n' +
  '    ShantellSans_500Medium,\n' +
  '    ShantellSans_700Bold,\n' +
  '  });\n' +
  stateLines.join('\n') +
  (stateLines.length > 0 ? '\n' : '') +
  '\n' +
  '  return (\n' +
  '    <GestureHandlerRootView style={{ flex: 1 }}>\n' +
  '      <SafeAreaProvider>\n' +
  '        <ThemeProvider theme={theme}>\n' +
  '          <ToastProvider>\n' +
  '            <OverlayHost>\n' +
  providersInner + '\n' +
  '            </OverlayHost>\n' +
  '          </ToastProvider>\n' +
  '        </ThemeProvider>\n' +
  '      </SafeAreaProvider>\n' +
  '    </GestureHandlerRootView>\n' +
  '  );\n' +
  '}\n';


files['App.tsx'] =
  "import React from 'react';\n" +
  "import { ActivityIndicator, View } from 'react-native';\n" +
  "import { GestureHandlerRootView } from 'react-native-gesture-handler';\n" +
  "import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';\n" +
  "import { StatusBar } from 'expo-status-bar';\n" +
  "import {\n" +
  "  useFonts,\n" +
  "  ShantellSans_400Regular,\n" +
  "  ShantellSans_500Medium,\n" +
  "  ShantellSans_700Bold,\n" +
  "} from '@expo-google-fonts/shantell-sans';\n" +
  "import {\n" +
  libImports.map((name) => '  ' + name + ',\n').join('') +
  "} from 'e4-components';\n" +
  "import { theme } from './theme';\n" +
  (anyFlow ? "import { clients } from './lib/backend';\n" : '') +
  '\n' +
  homeComponent +
  '\n' +
  appBody;

if (anyFlow) {
  // The backend seam: mock by default, Supabase the moment env vars exist.
  files['lib/backend.ts'] =
    "// Backend for the app's flows.\n" +
    '//\n' +
    '// Out of the box this is an in-memory mock — zero setup' +
    (withAuth ? ', every "emailed"\n// code is 123456' : '') +
    ', and data resets on reload. To go live with Supabase\n' +
    '// (~5 minutes), follow supabase/README.md, then `cp .env.example .env` and\n' +
    '// fill it in: the app switches automatically when the env vars are present.\n' +
    "import { createClient } from '@supabase/supabase-js';\n" +
    'import {\n' +
    '  createMockClients,\n' +
    '  createSupabaseClients,\n' +
    '  type FlowClients,\n' +
    "} from 'e4-components';\n\n" +
    'const url = process.env.EXPO_PUBLIC_SUPABASE_URL;\n' +
    'const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;\n\n' +
    'export const clients: FlowClients =\n' +
    '  url && anonKey\n' +
    '    ? createSupabaseClients({ supabase: createClient(url, anonKey) })\n' +
    '    : createMockClients();\n';

  files['.env.example'] =
    '# Copy to .env and fill in from your Supabase project (Project Settings → API).\n' +
    '# While these are empty the app runs on the in-memory mock backend.\n' +
    'EXPO_PUBLIC_SUPABASE_URL=\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=\n';
}

// Auto-update wiring: Renovate keeps e4-components current with no manual work.
// Patch/minor releases auto-merge; major bumps open a PR for review. Requires
// the Renovate GitHub App to be installed on the app's repo once (see README).
files['renovate.json'] = JSON.stringify(
  {
    $schema: 'https://docs.renovatebot.com/renovate-schema.json',
    extends: ['config:recommended'],
    packageRules: [
      {
        description:
          'Auto-merge e4-components patch & minor releases; major opens a PR for review.',
        matchPackageNames: ['e4-components'],
        matchUpdateTypes: ['patch', 'minor'],
        automerge: true,
        automergeType: 'pr',
        platformAutomerge: true,
      },
    ],
    lockFileMaintenance: { enabled: true, automerge: true },
  },
  null,
  2,
);

files['.gitignore'] =
  ['node_modules/', '.expo/', 'dist/', 'web-build/', '*.log', '.DS_Store', '.env'].join('\n') +
  '\n';

files['README.md'] =
  '# ' + projectName + '\n\n' +
  'Scaffolded with `create-e4-app`. Pre-wired with [e4-components](' +
  'https://github.com/e4-explore/e4-components).\n\n' +
  '## Run\n\n' +
  '```sh\n' +
  'npm install\n' +
  'npx expo start\n' +
  '```\n\n' +
  'Press `i` for iOS simulator, `a` for Android, or `w` for web.\n\n' +
  '## What is wired up\n\n' +
  '- `App.tsx` — providers in order: `GestureHandlerRootView` → `SafeAreaProvider`\n' +
  '  → `ThemeProvider` → `ToastProvider` → `OverlayHost`, plus Shantell Sans font\n' +
  '  loading (the wireframe face) with a loading spinner until fonts are ready.\n' +
  '- `theme.ts` — your project theme. Override tokens here; every component\n' +
  '  re-skins from it. See the library README for the full token list.\n' +
  (anyFlow
    ? '- **Flows** — ready-made journeys from the library, composed gate by gate\n' +
      '  (' + selectedFlows.join(' → ') + '). They run against `createMockClients()`\n' +
      '  — an in-memory backend' +
      (withAuth ? ' where every "emailed" code is `123456`' : '') +
      ' — so\n' +
      '  everything works with zero setup. To go live on a real backend, follow\n' +
      '  `supabase/README.md` (~5 minutes) — `lib/backend.ts` switches from mock\n' +
      '  to Supabase automatically once `.env` is filled in.\n'
    : '') +
  '\n' +
  '## Staying up to date\n\n' +
  '- This app references `e4-components` by a semver range (`#semver:^' +
  LIB_MAJOR + '.' + LIB_MINOR + '.0`), so it floats forward on published\n' +
  '  releases instead of freezing on one commit. New library versions are\n' +
  '  published automatically (a tag per merge to the library\'s `main`).\n' +
  '- `renovate.json` makes updates hands-off: patch/minor releases auto-merge,\n' +
  '  major bumps open a PR. **One-time setup:** install the [Renovate GitHub\n' +
  '  App](https://github.com/apps/renovate) on this repo. Until then, pull\n' +
  '  updates manually with `npm update e4-components`.\n\n' +
  '## Notes\n\n' +
  '- The library ships TypeScript source (no build step) and is transpiled by\n' +
  "  Metro. If Metro reports it can't parse `e4-components` source, add it to\n" +
  '  transpilation in `metro.config.js`.\n' +
  '- `Select` renders its dropdown through `OverlayHost` — keep that provider\n' +
  '  mounted near the root.\n';

// --- write everything ---
fs.mkdirSync(targetDir, { recursive: true });
for (const [rel, contents] of Object.entries(files)) {
  const full = path.join(targetDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

// Flows come with their backend template: Supabase migrations + edge
// functions land in the app's supabase/ folder (the Supabase convention),
// ready for the go-live steps in supabase/README.md.
if (anyFlow) {
  const templateDir = path.join(__dirname, '..', 'templates', 'supabase');
  fs.cpSync(templateDir, path.join(targetDir, 'supabase'), { recursive: true });
}

console.log('\n  ✓ Created ' + projectName + ' at ' + targetDir + '\n');
console.log('  Next steps:\n');
console.log('    cd ' + projectName);
console.log('    npm install');
console.log('    npx expo start\n');
console.log('  Then press i (iOS), a (Android), or w (web).\n');
