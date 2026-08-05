import React, { useEffect, useRef, useState } from 'react';
import { Pressable as RNPressable, StyleSheet, useWindowDimensions, type View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Divider } from '../components/Divider';
import { Input } from '../components/Input';
import { FormField } from '../components/FormField';
import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Icon } from '../icons/Icon';
import { useToast } from '../components/Toast';
import { useOverlay } from '../overlay/OverlayHost';
import { useTheme } from '../theme/ThemeProvider';

/**
 * The Create-app form. It isn't a browsable page — `!dev` keeps it out of the
 * sidebar. It's rendered only as the body of the "Create app" modal launched
 * from the sidebar button (see `.storybook/manager.tsx`), loaded in an iframe
 * so it keeps the real e4 components, providers, and /api/create-app wiring.
 * `fullBleed` drops the catalog's usual 480px width cap so it fills the modal.
 *
 * The form is a three-step wizard — Basics → Flows → Review — so each screen
 * stays short. The final Review step is where the copy-&-run commands (static
 * site) or the Create button (local dev server) live.
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

const STEPS = ['Basics', 'Flows', 'Review'] as const;

type ThemeChoice = 'wireframe' | 'ledger' | 'glass';
const THEME_LABELS: Record<ThemeChoice, string> = {
  wireframe: 'Wireframe',
  ledger: 'Ledger',
  glass: 'Glass',
};

const FLOW_LABELS: Record<string, string> = {
  legal: 'Legal',
  auth: 'Auth',
  onboarding: 'Onboarding',
  subscription: 'Subscription',
  settings: 'Settings',
};

function buildCommands(
  name: string,
  primary: string,
  accent: string,
  flows: string[],
  themeChoice: ThemeChoice,
): string {
  const flags =
    (primary && primary !== '#3355D9' ? ` --primary "${primary}"` : '') +
    (accent && accent !== '#4B7BFF' ? ` --accent "${accent}"` : '') +
    (flows.length > 0 ? ` --flows ${flows.join(',')}` : '') +
    (themeChoice !== 'wireframe' ? ` --theme ${themeChoice}` : '');
  return [
    `npx github:e4-explore/e4-components ${name || 'my-app'}${flags}`,
    `cd ${name || 'my-app'}`,
    'npm install',
    'npx expo start',
  ].join('\n');
}

function Swatch({ hex, size = 28 }: { hex: string; size?: number }) {
  const theme = useTheme();
  return (
    <Box
      rounded="sm"
      style={{
        width: size,
        height: size,
        borderWidth: theme.borders.regular,
        borderColor: theme.colors.border,
        backgroundColor: HEX_RE.test(hex) ? hex : theme.colors.surfaceAlt,
      }}
    />
  );
}

// Quick-pick swatches shown under the custom picker in the color popover.
const PALETTE = [
  '#3355D9', '#4B7BFF', '#2F6FED', '#1E40AF', '#0EA5E9',
  '#7C3AED', '#A855F7', '#DB2777', '#EF4444', '#F97316',
  '#F59E0B', '#EAB308', '#16A34A', '#10B981', '#0D9488',
  '#64748B', '#334155', '#111827', '#78716C', '#FFFFFF',
];

const PANEL_W = 236;
const SV_H = 132;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

interface HSV {
  h: number;
  s: number;
  v: number;
}

/** Expand/repair to a 6-digit uppercase hex, or null if it isn't a hex. */
function normalizeHex(hex: string): string | null {
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex.toUpperCase();
  const short = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase();
  return null;
}

function hexToHsv(hex: string): HSV | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  const r = parseInt(norm.slice(1, 3), 16) / 255;
  const g = parseInt(norm.slice(3, 5), 16) / 255;
  const b = parseInt(norm.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex({ h, s, v }: HSV): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/**
 * Full inline color picker: a saturation/value field, a hue slider, and an
 * eyedropper (where the browser supports it). Built from DOM elements with
 * pointer handlers — this catalog page is web-only. Drives `onChange(hex)`.
 */
function InlineColorPicker({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const theme = useTheme();
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex) ?? { h: 222, s: 0.76, v: 0.85 });
  const lastEmitted = useRef<string | null>(null);

  // Resync from external changes (typing in the field, tapping a preset), but
  // ignore the echo of our own emit so dragging over greys keeps its hue.
  useEffect(() => {
    if (normalizeHex(hex) === lastEmitted.current) return;
    const next = hexToHsv(hex);
    if (next) setHsv(next);
  }, [hex]);

  const emit = (next: HSV) => {
    setHsv(next);
    const out = hsvToHex(next);
    lastEmitted.current = out;
    onChange(out);
  };

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const dragSV = useRef(false);
  const dragHue = useRef(false);

  const moveSV = (cx: number, cy: number) => {
    const el = svRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    emit({ ...hsv, s: clamp01((cx - r.left) / r.width), v: clamp01(1 - (cy - r.top) / r.height) });
  };
  const moveHue = (cx: number) => {
    const el = hueRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    emit({ ...hsv, h: clamp01((cx - r.left) / r.width) * 360 });
  };

  const current = hsvToHex(hsv);
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const eyedrop = () => {
    const EyeDropperCtor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!EyeDropperCtor) return;
    new EyeDropperCtor()
      .open()
      .then((res) => {
        const next = hexToHsv(res.sRGBHex);
        if (next) emit(next);
      })
      .catch(() => {});
  };

  const thumb = (bg: string): React.CSSProperties => ({
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
    background: bg,
    pointerEvents: 'none',
  });

  return (
    <Stack gap="sm">
      <div
        ref={svRef}
        onPointerDown={(e) => {
          dragSV.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          moveSV(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragSV.current) moveSV(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          dragSV.current = false;
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: SV_H,
          borderRadius: theme.radii.md,
          border: `${theme.borders.regular}px solid ${theme.colors.border}`,
          cursor: 'crosshair',
          touchAction: 'none',
          background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), ${hueColor}`,
        }}
      >
        <div style={{ ...thumb(current), left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
      </div>

      <Row gap="sm" align="center">
        {hasEyeDropper ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pick color from screen"
            pressScale={0.9}
            onPress={eyedrop}
          >
            <Box
              rounded="sm"
              style={{
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: theme.borders.regular,
                borderColor: theme.colors.border,
              }}
            >
              <Icon name="search" size={15} color="inkMuted" />
            </Box>
          </Pressable>
        ) : null}
        <Swatch hex={current} size={28} />
        <Box flex={1}>
          <div
            ref={hueRef}
            onPointerDown={(e) => {
              dragHue.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              moveHue(e.clientX);
            }}
            onPointerMove={(e) => {
              if (dragHue.current) moveHue(e.clientX);
            }}
            onPointerUp={() => {
              dragHue.current = false;
            }}
            style={{
              position: 'relative',
              height: 14,
              borderRadius: theme.radii.pill,
              border: `${theme.borders.regular}px solid ${theme.colors.border}`,
              cursor: 'pointer',
              touchAction: 'none',
              background:
                'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
          >
            <div style={{ ...thumb(hueColor), left: `${(hsv.h / 360) * 100}%`, top: '50%' }} />
          </div>
        </Box>
      </Row>
    </Stack>
  );
}

/**
 * A Swatch that opens a color-picker popover on tap: the full inline picker
 * (saturation field + hue slider + eyedropper) plus a quick-pick palette grid.
 * Anchored to the swatch via the overlay layer (same pattern as Select) so it
 * escapes the Card's clipping, with an invisible backdrop that dismisses on
 * outside tap.
 */
function ColorPickerSwatch({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const theme = useTheme();
  const overlay = useOverlay();
  const { width: viewportWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const overlayIdRef = useRef<number | null>(null);
  const rectRef = useRef<{ left: number; top: number } | null>(null);

  const renderPanel = () => (
    <>
      <RNPressable
        accessibilityLabel="Close color picker"
        onPress={() => setOpen(false)}
        style={StyleSheet.absoluteFill}
      />
      <Box
        style={{
          position: 'absolute',
          left: rectRef.current?.left ?? 0,
          top: rectRef.current?.top ?? 0,
          width: PANEL_W,
        }}
      >
        <Animated.View
          entering={FadeInDown.duration(160)}
          exiting={FadeOutUp.duration(120)}
          style={{
            borderRadius: theme.radii.md,
            borderWidth: theme.borders.regular,
            borderColor: theme.colors.borderStrong,
            backgroundColor: theme.colors.surface,
            ...theme.shadows.lifted,
          }}
        >
          <Box p="sm">
            <Stack gap="sm">
              <InlineColorPicker hex={hex} onChange={onChange} />
              <Divider />
              <Row wrap gap="xs">
                {PALETTE.map((c) => {
                  const selected = normalizeHex(c) === normalizeHex(hex);
                  return (
                    <Pressable
                      key={c}
                      accessibilityRole="button"
                      accessibilityLabel={c}
                      pressScale={0.88}
                      onPress={() => onChange(c)}
                    >
                      <Box
                        rounded="sm"
                        style={{
                          width: 26,
                          height: 26,
                          backgroundColor: c,
                          borderWidth: selected ? theme.borders.thick : theme.borders.regular,
                          borderColor: selected ? theme.colors.ink : theme.colors.border,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </Row>
            </Stack>
          </Box>
        </Animated.View>
      </Box>
    </>
  );

  // Measure the swatch, clamp the panel on-screen, then float it on the
  // overlay layer. Cleanup hides the entry when the popover closes.
  useEffect(() => {
    if (!open) return;
    const node = triggerRef.current as (View & {
      measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void;
    }) | null;
    const place = (left: number, top: number) => {
      rectRef.current = { left, top };
      overlayIdRef.current = overlay.show({ x: 0, y: 0, width: 0, fill: true }, renderPanel);
    };
    if (node?.measureInWindow) {
      node.measureInWindow((x, y, width, height) => {
        const left = Math.max(8, Math.min(x + width - PANEL_W, viewportWidth - PANEL_W - 8));
        place(left, y + height + theme.spacing.xs);
      });
    } else {
      place(8, 8);
    }
    return () => {
      if (overlayIdRef.current !== null) {
        overlay.hide(overlayIdRef.current);
        overlayIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the floating panel's rendered content current (selected swatch, hex).
  useEffect(() => {
    if (overlayIdRef.current !== null) {
      overlay.update(overlayIdRef.current, { render: renderPanel });
    }
  });

  return (
    <Box ref={triggerRef as never}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pick color"
        accessibilityState={{ expanded: open }}
        pressScale={0.9}
        onPress={() => setOpen((o) => !o)}
      >
        <Swatch hex={hex} size={22} />
      </Pressable>
    </Box>
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

/** Numbered progress header: ① Basics ── ② Flows ── ③ Review. */
function Stepper({ step }: { step: number }) {
  const theme = useTheme();
  return (
    <Row align="center">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        const filled = active || done;
        return (
          <React.Fragment key={label}>
            <Row gap="xs" align="center">
              <Box
                rounded="pill"
                style={{
                  width: 26,
                  height: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: filled ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderWidth: theme.borders.regular,
                  borderColor: filled ? theme.colors.primary : theme.colors.border,
                  borderStyle: theme.borders.sketchStyle,
                }}
              >
                {done ? (
                  <Icon name="check" size={15} color="onPrimary" />
                ) : (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700' as never,
                      color: active ? theme.colors.onPrimary : theme.colors.inkMuted,
                    }}
                  >
                    {i + 1}
                  </Text>
                )}
              </Box>
              <Text variant="caption" color={active ? 'ink' : 'inkMuted'}>
                {label}
              </Text>
            </Row>
            {i < STEPS.length - 1 ? (
              <Box
                flex={1}
                mx="sm"
                style={{ height: theme.borders.regular, backgroundColor: theme.colors.border }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </Row>
  );
}

/** Read-only recap of choices, shown on the Review step. */
function ReviewSummary({
  name,
  primary,
  accent,
  flows,
  themeChoice,
}: {
  name: string;
  primary: string;
  accent: string;
  flows: string[];
  themeChoice: ThemeChoice;
}) {
  return (
    <Card flat>
      <Stack gap="md">
        <Row justify="space-between" align="center">
          <Text color="inkMuted">App name</Text>
          <Text>{name || 'my-app'}</Text>
        </Row>
        <Divider />
        <Row justify="space-between" align="center">
          <Text color="inkMuted">Theme</Text>
          <Text>{THEME_LABELS[themeChoice]}</Text>
        </Row>
        <Divider />
        <Row justify="space-between" align="center">
          <Text color="inkMuted">Colors</Text>
          <Row gap="sm" align="center">
            <Swatch hex={primary} />
            <Swatch hex={accent} />
          </Row>
        </Row>
        <Divider />
        <Row justify="space-between" align="flex-start">
          <Text color="inkMuted">Flows</Text>
          <Box style={{ flex: 1, alignItems: 'flex-end' }}>
            {flows.length > 0 ? (
              <Row gap="xs" wrap justify="flex-end">
                {flows.map((f) => (
                  <Badge key={f} label={FLOW_LABELS[f] ?? f} tone="neutral" />
                ))}
              </Row>
            ) : (
              <Text color="inkFaint">None</Text>
            )}
          </Box>
        </Row>
      </Stack>
    </Card>
  );
}

export const Start: StoryObj = {
  render: () => {
    const toast = useToast();
    const [mode, setMode] = useState<Mode>('probing');
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [primary, setPrimary] = useState('#3355D9');
    const [accent, setAccent] = useState('#4B7BFF');
    const [themeChoice, setThemeChoice] = useState<ThemeChoice>('wireframe');
    const [parentDir, setParentDir] = useState('~');
    const [flows, setFlows] = useState<Record<string, boolean>>({
      legal: false,
      auth: false,
      onboarding: false,
      subscription: false,
      settings: false,
    });
    const [busy, setBusy] = useState(false);
    const [picking, setPicking] = useState(false);
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

    // Stable gate order: legal → auth → onboarding → subscription → settings.
    const selectedFlows = ['legal', 'auth', 'onboarding', 'subscription', 'settings'].filter(
      (f) => flows[f],
    );
    const toggleFlow = (flow: string) => (checked: boolean) =>
      setFlows((prev) => ({
        ...prev,
        [flow]: checked,
        // Settings manages the account, so it drags auth in with it.
        ...(flow === 'settings' && checked ? { auth: true } : {}),
        ...(flow === 'auth' && !checked ? { settings: false } : {}),
      }));

    const nameError =
      name.length > 0 && !NAME_RE.test(name)
        ? 'Letters, numbers, dashes and underscores only — e.g. golf-tracker'
        : undefined;
    const primaryError = primary.length > 0 && !HEX_RE.test(primary) ? 'Hex color like #3355D9' : undefined;
    const accentError = accent.length > 0 && !HEX_RE.test(accent) ? 'Hex color like #4B7BFF' : undefined;
    const formValid = NAME_RE.test(name) && HEX_RE.test(primary) && HEX_RE.test(accent);

    const pickDir = async () => {
      setPicking(true);
      try {
        const res = await fetch('/api/create-app/pick-dir', { method: 'POST' });
        const body = await res.json();
        if (body.ok) {
          setParentDir(body.path);
        } else if (body.unsupported) {
          toast.show('Folder picker is macOS-only — type the path instead', { tone: 'neutral' });
        }
        // Cancelled: leave the field as-is, no message needed.
      } catch {
        toast.show('Could not open the folder picker', { tone: 'danger' });
      } finally {
        setPicking(false);
      }
    };

    const create = async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/create-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentDir, primary, accent, flows: selectedFlows, theme: themeChoice }),
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
                setStep(0);
              }}
            />
          </Row>
        </Stack>
      );
    }

    const goBack = () => {
      setError(null);
      setStep((s) => Math.max(0, s - 1));
    };
    const goNext = () => {
      setError(null);
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    };

    return (
      <Stack gap="lg">
        <Text color="inkMuted">
          {mode === 'local'
            ? 'Storybook is running on your machine, so this can scaffold the project for you directly.'
            : 'Fill this in and copy the generated commands — they scaffold an Expo app pre-wired with e4-components (providers, fonts, starter theme, demo screen).'}
        </Text>

        <Stepper step={step} />

        {/* Step 1 — Basics: name, colors, (local) target folder. */}
        {step === 0 ? (
          <Card flat>
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
              <Row gap="md" align="flex-start">
                <Box flex={1}>
                  <FormField label="Primary color" error={primaryError}>
                    <Input
                      value={primary}
                      onChangeText={setPrimary}
                      autoCapitalize="none"
                      left={<ColorPickerSwatch hex={primary} onChange={setPrimary} />}
                    />
                  </FormField>
                </Box>
                <Box flex={1}>
                  <FormField label="Accent color" error={accentError}>
                    <Input
                      value={accent}
                      onChangeText={setAccent}
                      autoCapitalize="none"
                      left={<ColorPickerSwatch hex={accent} onChange={setAccent} />}
                    />
                  </FormField>
                </Box>
              </Row>
              <FormField
                label="Theme"
                hint="The look your app ships in. Preview both live via the toolbar's Apply theme control."
              >
                <Select
                  value={themeChoice}
                  onChange={setThemeChoice}
                  options={[
                    { value: 'wireframe', label: 'Wireframe — hand-drawn Shantell Sans' },
                    { value: 'ledger', label: 'Ledger — dense JetBrains Mono' },
                    { value: 'glass', label: 'Glass — Apple-style frosted, system font' },
                  ]}
                />
              </FormField>
              {mode === 'local' ? (
                <FormField label="Create inside" hint="Folder on this machine — ~ is your home folder">
                  <Row gap="sm" align="center">
                    <Box flex={1}>
                      <Input value={parentDir} onChangeText={setParentDir} autoCapitalize="none" />
                    </Box>
                    <Button
                      label={picking ? 'Opening…' : 'Browse…'}
                      variant="secondary"
                      loading={picking}
                      disabled={picking}
                      onPress={pickDir}
                    />
                  </Row>
                </FormField>
              ) : null}
            </Stack>
          </Card>
        ) : null}

        {/* Step 2 — Flows: optional ready-made journeys. */}
        {step === 1 ? (
          <Card flat>
            <FormField
              label="Flows"
              hint="Ready-made journeys composed into the app (legal → auth → onboarding → paywall → home ⇄ settings). They run on a mock backend out of the box; the app also gets a supabase/ template and lib/backend.ts that switch to your real Supabase project the moment .env is filled in. Browse the journeys under Flows in the sidebar."
            >
              <Stack gap="sm">
                <Checkbox
                  checked={flows.legal}
                  onChange={toggleFlow('legal')}
                  label="Legal — first-run terms & privacy consent"
                />
                <Checkbox
                  checked={flows.auth}
                  onChange={toggleFlow('auth')}
                  label="Auth — sign in, sign up, verify email, reset password"
                />
                <Checkbox
                  checked={flows.onboarding}
                  onChange={toggleFlow('onboarding')}
                  label="Onboarding — welcome slides, profile, permission priming"
                />
                <Checkbox
                  checked={flows.subscription}
                  onChange={toggleFlow('subscription')}
                  label="Subscription — paywall, tier picker, manage & cancel"
                />
                <Checkbox
                  checked={flows.settings}
                  onChange={toggleFlow('settings')}
                  label="Settings — account hub, change password/email, delete account"
                />
              </Stack>
            </FormField>
          </Card>
        ) : null}

        {/* Step 3 — Review: recap + create (local) or copy-&-run commands (static). */}
        {step === 2 ? (
          <Stack gap="md">
            <ReviewSummary
              name={name}
              primary={primary}
              accent={accent}
              flows={selectedFlows}
              themeChoice={themeChoice}
            />
            {mode !== 'local' ? (
              <Stack gap="sm">
                <Divider label="run these in your terminal" />
                <CommandBlock commands={buildCommands(name, primary, accent, selectedFlows, themeChoice)} />
                <Text variant="caption" color="inkFaint">
                  Tip: run the first command from the folder where you keep projects (not inside
                  another repo). Then press i for iOS, a for Android, or w for web.
                </Text>
              </Stack>
            ) : null}
          </Stack>
        ) : null}

        {error ? (
          <Row gap="sm">
            <Icon name="close" size={16} color="danger" />
            <Text color="danger" style={{ flex: 1 }}>
              {error}
            </Text>
          </Row>
        ) : null}

        {/* Wizard navigation. */}
        <Row align="center">
          {step > 0 ? (
            <Button label="Back" variant="ghost" onPress={goBack} disabled={busy} />
          ) : null}
          <Spacer />
          {step < STEPS.length - 1 ? (
            <Button label="Next" onPress={goNext} disabled={step === 0 && !formValid} />
          ) : mode === 'local' ? (
            <Button
              label={busy ? 'Creating…' : 'Create app'}
              loading={busy}
              disabled={!formValid}
              onPress={create}
            />
          ) : null}
        </Row>
      </Stack>
    );
  },
};
