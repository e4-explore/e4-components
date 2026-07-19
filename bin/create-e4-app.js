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

const GITHUB_DEP = 'github:e4-explore/e4-components';

function fail(msg) {
  console.error('\n  ✗ ' + msg + '\n');
  process.exit(1);
}

const argv = process.argv.slice(2);
const positional = [];
const flags = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--primary' || argv[i] === '--accent') {
    flags[argv[i].slice(2)] = argv[i + 1];
    i++;
  } else {
    positional.push(argv[i]);
  }
}

const projectName = positional[0];

if (!projectName) {
  fail('Usage: create-e4-app <project-name> [--primary #hex] [--accent #hex]');
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
  "  ThemeProvider,\n" +
  "  ToastProvider,\n" +
  "  OverlayHost,\n" +
  "  Stack,\n" +
  "  Text,\n" +
  "  Button,\n" +
  "  Card,\n" +
  "  Input,\n" +
  "  Select,\n" +
  "  useToast,\n" +
  "} from 'e4-components';\n" +
  "import { theme } from './theme';\n\n" +
  "function Home() {\n" +
  "  const toast = useToast();\n" +
  "  const [name, setName] = React.useState('');\n" +
  "  const [sport, setSport] = React.useState<string | null>(null);\n" +
  "  return (\n" +
  "    <Stack p=\"lg\" gap=\"md\">\n" +
  "      <Text variant=\"title\">It works.</Text>\n" +
  "      <Text color=\"inkMuted\">\n" +
  "        This screen is rendered entirely from e4-components, installed from GitHub.\n" +
  "      </Text>\n" +
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
  "      </Card>\n" +
  "    </Stack>\n" +
  "  );\n" +
  "}\n\n" +
  "export default function App() {\n" +
  "  const [fontsLoaded] = useFonts({\n" +
  "    ShantellSans_400Regular,\n" +
  "    ShantellSans_500Medium,\n" +
  "    ShantellSans_700Bold,\n" +
  "  });\n\n" +
  "  return (\n" +
  "    <GestureHandlerRootView style={{ flex: 1 }}>\n" +
  "      <SafeAreaProvider>\n" +
  "        <ThemeProvider theme={theme}>\n" +
  "          <ToastProvider>\n" +
  "            <OverlayHost>\n" +
  "              <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>\n" +
  "                {fontsLoaded ? (\n" +
  "                  <Home />\n" +
  "                ) : (\n" +
  "                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>\n" +
  "                    <ActivityIndicator />\n" +
  "                  </View>\n" +
  "                )}\n" +
  "                <StatusBar style=\"auto\" />\n" +
  "              </SafeAreaView>\n" +
  "            </OverlayHost>\n" +
  "          </ToastProvider>\n" +
  "        </ThemeProvider>\n" +
  "      </SafeAreaProvider>\n" +
  "    </GestureHandlerRootView>\n" +
  "  );\n" +
  "}\n";

files['.gitignore'] =
  ['node_modules/', '.expo/', 'dist/', 'web-build/', '*.log', '.DS_Store'].join('\n') + '\n';

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
  '  re-skins from it. See the library README for the full token list.\n\n' +
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

console.log('\n  ✓ Created ' + projectName + ' at ' + targetDir + '\n');
console.log('  Next steps:\n');
console.log('    cd ' + projectName);
console.log('    npm install');
console.log('    npx expo start\n');
console.log('  Then press i (iOS), a (Android), or w (web).\n');
