import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Divider } from '../components/Divider';
import { Input } from '../components/Input';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { Icon } from '../icons/Icon';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';

/**
 * The Create-app form. It isn't a browsable page — `!dev` keeps it out of the
 * sidebar. It's rendered only as the body of the "Create app" modal launched
 * from the sidebar button (see `.storybook/manager.tsx`), loaded in an iframe
 * so it keeps the real e4 components, providers, and /api/create-app wiring.
 * `fullBleed` drops the catalog's usual 480px width cap so it fills the modal.
 */
const meta: Meta = {
  title: 'Create app',
  tags: ['!dev'],
  parameters: { fullBleed: true },
};
export default meta;

const NAME_RE = /^[a-z0-9][a-z0-9-_]*$/i;
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

type Mode = 'probing' | 'local' | 'static';

function buildCommands(name: string, primary: string, accent: string): string {
  const flags =
    (primary && primary !== '#3355D9' ? ` --primary "${primary}"` : '') +
    (accent && accent !== '#4B7BFF' ? ` --accent "${accent}"` : '');
  return [
    `npx github:e4-explore/e4-components ${name || 'my-app'}${flags}`,
    `cd ${name || 'my-app'}`,
    'npm install',
    'npx expo start',
  ].join('\n');
}

function Swatch({ hex }: { hex: string }) {
  const theme = useTheme();
  return (
    <Box
      rounded="sm"
      style={{
        width: 28,
        height: 28,
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.border,
        backgroundColor: HEX_RE.test(hex) ? hex : theme.colors.surfaceAlt,
      }}
    />
  );
}

function CommandBlock({ commands }: { commands: string }) {
  const theme = useTheme();
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands);
      toast.show('Commands copied', { tone: 'success' });
    } catch {
      toast.show('Could not copy — select the text manually', { tone: 'danger' });
    }
  };
  return (
    <Stack gap="sm">
      <Box
        p="md"
        rounded="md"
        bg="surfaceAlt"
        style={{
          borderWidth: theme.borders.regular,
          borderColor: theme.colors.border,
          borderStyle: theme.borders.sketchStyle,
        }}
      >
        <Text style={{ fontFamily: 'Menlo, Consolas, monospace' as never, fontSize: 13, lineHeight: 21 }}>
          {commands}
        </Text>
      </Box>
      <Row>
        <Button label="Copy commands" size="sm" variant="secondary" onPress={copy} />
      </Row>
    </Stack>
  );
}

export const Start: StoryObj = {
  render: () => {
    const toast = useToast();
    const [mode, setMode] = useState<Mode>('probing');
    const [name, setName] = useState('');
    const [primary, setPrimary] = useState('#3355D9');
    const [accent, setAccent] = useState('#4B7BFF');
    const [parentDir, setParentDir] = useState('~');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdPath, setCreatedPath] = useState<string | null>(null);

    // Detect whether the catalog is running locally (dev server → real
    // creation) or as the deployed static site (→ copy-paste commands).
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch('/api/create-app', { method: 'GET' });
          const isJson = res.headers.get('content-type')?.includes('application/json');
          const body = isJson ? await res.json() : null;
          if (!cancelled) setMode(body?.ok && body?.mode === 'local' ? 'local' : 'static');
        } catch {
          if (!cancelled) setMode('static');
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    const nameError =
      name.length > 0 && !NAME_RE.test(name)
        ? 'Letters, numbers, dashes and underscores only — e.g. golf-tracker'
        : undefined;
    const primaryError = primary.length > 0 && !HEX_RE.test(primary) ? 'Hex color like #3355D9' : undefined;
    const accentError = accent.length > 0 && !HEX_RE.test(accent) ? 'Hex color like #4B7BFF' : undefined;
    const formValid = NAME_RE.test(name) && HEX_RE.test(primary) && HEX_RE.test(accent);

    const create = async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/create-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentDir, primary, accent }),
        });
        const body = await res.json();
        if (body.ok) {
          setCreatedPath(body.path);
          toast.show('App created!', { tone: 'success' });
        } else {
          setError(body.error ?? 'Something went wrong');
        }
      } catch (e) {
        setError('Could not reach the dev server — is Storybook still running?');
      } finally {
        setBusy(false);
      }
    };

    if (createdPath) {
      return (
        <Stack gap="lg">
          <Row gap="sm">
            <Icon name="check" size={22} color="success" />
            <Text variant="title">Your app is ready</Text>
          </Row>
          <Text color="inkMuted">
            Created at {createdPath} — pre-wired with the library, providers, fonts, and a starter
            theme. Finish setup in your terminal:
          </Text>
          <CommandBlock commands={[`cd ${createdPath}`, 'npm install', 'npx expo start'].join('\n')} />
          <Row>
            <Button
              label="Create another"
              variant="ghost"
              size="sm"
              onPress={() => {
                setCreatedPath(null);
                setName('');
              }}
            />
          </Row>
        </Stack>
      );
    }

    return (
      <Stack gap="lg">
        <Stack gap="xs">
          <Row gap="sm">
            <Text variant="title">Create an app with this library</Text>
            {mode === 'local' ? <Badge label="local" tone="success" /> : null}
            {mode === 'static' ? <Badge label="copy & run" tone="accent" /> : null}
          </Row>
          <Text color="inkMuted">
            {mode === 'local'
              ? 'Storybook is running on your machine, so this can scaffold the project for you directly.'
              : 'Fill this in and copy the generated commands — they scaffold an Expo app pre-wired with e4-components (providers, fonts, starter theme, demo screen).'}
          </Text>
        </Stack>

        <Card>
          <Stack gap="md">
            <FormField label="App name" error={nameError} hint="Becomes the folder and Expo slug">
              <Input
                placeholder="golf-tracker"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </FormField>
            <Row gap="md" align="flex-end">
              <Box flex={1}>
                <FormField label="Primary color" error={primaryError}>
                  <Input value={primary} onChangeText={setPrimary} autoCapitalize="none" />
                </FormField>
              </Box>
              <Box pb="xxs">
                <Swatch hex={primary} />
              </Box>
              <Box flex={1}>
                <FormField label="Accent color" error={accentError}>
                  <Input value={accent} onChangeText={setAccent} autoCapitalize="none" />
                </FormField>
              </Box>
              <Box pb="xxs">
                <Swatch hex={accent} />
              </Box>
            </Row>
            {mode === 'local' ? (
              <FormField label="Create inside" hint="Folder on this machine — ~ is your home folder">
                <Input value={parentDir} onChangeText={setParentDir} autoCapitalize="none" />
              </FormField>
            ) : null}
          </Stack>
        </Card>

        {error ? (
          <Row gap="sm">
            <Icon name="close" size={16} color="danger" />
            <Text color="danger" style={{ flex: 1 }}>
              {error}
            </Text>
          </Row>
        ) : null}

        {mode === 'local' ? (
          <Row>
            <Button
              label={busy ? 'Creating…' : 'Create app'}
              loading={busy}
              disabled={!formValid}
              onPress={create}
            />
            <Spacer />
          </Row>
        ) : null}

        {mode !== 'local' ? (
          <Stack gap="sm">
            <Divider label="run these in your terminal" />
            <CommandBlock commands={buildCommands(name, primary, accent)} />
            <Text variant="caption" color="inkFaint">
              Tip: run the first command from the folder where you keep projects (not inside another
              repo). Then press i for iOS, a for Android, or w for web.
            </Text>
          </Stack>
        ) : null}
      </Stack>
    );
  },
};
