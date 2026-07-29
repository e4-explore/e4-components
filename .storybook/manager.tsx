import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { addons } from 'storybook/manager-api';
import { SET_GLOBALS, GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { create } from 'storybook/theming';

const FONT_BASE = "'Shantell Sans', 'Comic Sans MS', cursive";
const FONT_CODE = "'Menlo', 'Consolas', monospace";

// Light "paper & ink" chrome — matches the preview's wireframe theme.
const e4Theme = create({
  base: 'light',
  brandTitle: 'e4 Explorebook',
  brandUrl: 'https://github.com/e4-explore',
  brandImage: 'e4-logo.svg',
  brandTarget: '_blank',

  colorPrimary: '#2A2A33',
  colorSecondary: '#4B7BFF',

  appBg: '#FAFAF7',
  appContentBg: '#FAFAF7',
  appPreviewBg: '#FAFAF7',
  appBorderColor: '#2A2A33',
  appBorderRadius: 12,

  fontBase: FONT_BASE,
  fontCode: FONT_CODE,

  textColor: '#2A2A33',
  textMutedColor: '#6E6E78',
  barBg: '#FAFAF7',
  barTextColor: '#6E6E78',
  barSelectedColor: '#2A2A33',
  barHoverColor: '#4B7BFF',

  inputBg: '#FFFFFF',
  inputBorder: '#2A2A33',
  inputTextColor: '#2A2A33',
  inputBorderRadius: 8,
});

// Dark "chalkboard" chrome — mirrors the preview's wireframeDark palette
// (near-black board, chalk-white ink) so the whole UI goes dark together.
const e4ThemeDark = create({
  base: 'dark',
  brandTitle: 'e4 Explorebook',
  brandUrl: 'https://github.com/e4-explore',
  brandImage: 'e4-logo-dark.svg',
  brandTarget: '_blank',

  colorPrimary: '#F2F2ED',
  colorSecondary: '#7FA3FF',

  appBg: '#17171B',
  appContentBg: '#17171B',
  appPreviewBg: '#17171B',
  appBorderColor: '#F2F2ED',
  appBorderRadius: 12,

  fontBase: FONT_BASE,
  fontCode: FONT_CODE,

  textColor: '#F2F2ED',
  textMutedColor: '#B7B7C0',
  barBg: '#17171B',
  barTextColor: '#B7B7C0',
  barSelectedColor: '#F2F2ED',
  barHoverColor: '#7FA3FF',

  inputBg: '#1F2024',
  inputBorder: '#F2F2ED',
  inputTextColor: '#F2F2ED',
  inputBorderRadius: 8,
});

const sidebarConfig = {
  // Render the top-level sections (Components, Templates, Flows, …) as
  // collapsible folders instead of always-open uppercase headers, so they
  // start closed. The full-app example is auto-expanded below.
  showRoots: false,
};

// Seed the boot theme (light). `setConfig` is applied once at manager load and
// isn't reactive, so runtime mode switching goes through the live `api` below.
addons.setConfig({ theme: e4Theme, sidebar: sidebarConfig });

// The live color scheme, mirrored from the preview's `mode` global and shared
// with the DOM-injected Create-app UI below (which lives outside Storybook's
// React tree, so it can't read globals through the usual hooks).
type Mode = 'light' | 'dark';
let currentMode: Mode = 'light';
const modeListeners = new Set<(mode: Mode) => void>();

// Keep the manager chrome's theme in lock-step with the preview's `mode`
// global, so flipping to Dark takes the whole site — sidebar, toolbar, and
// canvas — dark together (not just the story canvas). `api.setOptions({ theme })`
// (unlike `addons.setConfig`) re-themes the chrome reactively.
addons.register('e4/theme-sync', (api) => {
  const applyMode = (mode: unknown) => {
    const next: Mode = mode === 'dark' ? 'dark' : 'light';
    if (next === currentMode) return;
    currentMode = next;
    api.setOptions({ theme: next === 'dark' ? e4ThemeDark : e4Theme });
    modeListeners.forEach((listener) => listener(next));
  };

  const channel = api.getChannel();
  // SET_GLOBALS carries the initial globals on load (covers a deep link like
  // `?globals=mode:dark`); GLOBALS_UPDATED fires on every later toolbar change.
  channel?.on(SET_GLOBALS, ({ globals }: { globals?: Record<string, unknown> }) =>
    applyMode(globals?.mode),
  );
  channel?.on(GLOBALS_UPDATED, ({ globals }: { globals?: Record<string, unknown> }) =>
    applyMode(globals?.mode),
  );
  // Belt-and-suspenders: if globals were already set before this registered,
  // reconcile once against the current value.
  try {
    applyMode((api.getGlobals?.() as Record<string, unknown> | undefined)?.mode);
  } catch {
    /* getGlobals not ready yet — the channel events cover it */
  }
});

// Wireframe/chalkboard tokens, inlined: the manager runs outside the RN-web
// ThemeProvider, so it can't read the theme object the preview uses. Each mode
// mirrors the matching preview palette (wireframe / wireframeDark).
const FONT = "'Shantell Sans', 'Comic Sans MS', cursive";
const PALETTE: Record<Mode, {
  ink: string;
  paper: string;
  primary: string;
  onPrimary: string;
  overlay: string;
  shadowInk: string;
}> = {
  light: {
    ink: '#2A2A33',
    paper: '#FAFAF7',
    primary: '#3B44D9',
    onPrimary: '#FFFFFF',
    overlay: 'rgba(42, 42, 51, 0.45)',
    shadowInk: '#2A2A33',
  },
  dark: {
    ink: '#F2F2ED',
    paper: '#1F2024',
    primary: '#4C7EFF',
    onPrimary: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.6)',
    // A chalk-dust glow instead of a hard cast shadow, matching the dark logo.
    shadowInk: 'rgba(242, 242, 237, 0.22)',
  },
};

// Subscribe a component to the live color scheme. Reads the current value on
// mount (it may have been set before this mounted) and re-renders on change.
function useMode(): Mode {
  const [mode, setMode] = useState<Mode>(currentMode);
  useEffect(() => {
    setMode(currentMode);
    const listener = (next: Mode) => setMode(next);
    modeListeners.add(listener);
    return () => {
      modeListeners.delete(listener);
    };
  }, []);
  return mode;
}

// The Create-app form story, loaded in isolation. Pin the theme to wireframe
// (the form is designed for it) but follow the current `mode` — pinning
// `mode:light` here would clobber the session's shared globals and yank the
// whole catalog back to light, and would render the modal light in dark mode.
const formUrl = (mode: Mode) =>
  `iframe.html?id=create-app--start&viewMode=story&globals=theme:wireframe;mode:${mode}`;

function CreateAppModal({ onClose }: { onClose: () => void }) {
  const mode = useMode();
  const c = PALETTE[mode];
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        background: c.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: 'min(720px, 94vw)',
          height: 'min(760px, 86vh)',
          background: c.paper,
          border: `2px solid ${c.ink}`,
          borderRadius: 16,
          boxShadow: `6px 6px 0 ${c.shadowInk}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `2px solid ${c.ink}`,
            flex: '0 0 auto',
          }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: c.ink }}>
            Create an app locally with this library
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              lineHeight: 1,
              color: c.ink,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <iframe
          title="Create an app locally"
          src={formUrl(mode)}
          style={{ flex: '1 1 auto', width: '100%', border: 'none', background: c.paper }}
        />
      </div>
    </div>
  );
}

function CreateAppLauncher() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const mode = useMode();
  const c = PALETTE[mode];
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: '100%',
          padding: '11px 16px',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 15,
          color: c.onPrimary,
          background: c.primary,
          border: `2px solid ${c.ink}`,
          borderRadius: 10,
          // Hard offset shadow that "presses" on hover — the wireframe feel.
          boxShadow: hover ? `1px 1px 0 ${c.shadowInk}` : `3px 3px 0 ${c.shadowInk}`,
          transform: hover ? 'translate(2px, 2px)' : 'none',
          transition: 'box-shadow 80ms ease, transform 80ms ease',
          cursor: 'pointer',
        }}
      >
        Create App w/Library
      </button>
      {open ? createPortal(<CreateAppModal onClose={close} />, document.body) : null}
    </div>
  );
}

/**
 * Storybook 10 dropped the experimental SIDEBAR_TOP addon slot, so there's no
 * supported API to place a component in the sidebar. We inject our own node
 * just above the story tree (`#storybook-explorer-menu` is a stable Storybook
 * id — the same class of DOM hook manager-head.html already relies on) and
 * mount a React root into it. A MutationObserver re-attaches the node if the
 * sidebar re-renders and drops it, so it survives index refreshes.
 */
const SLOT_ID = 'e4-create-app-slot';
let slot: HTMLDivElement | null = null;
let root: Root | null = null;

function ensureMounted() {
  const menu = document.getElementById('storybook-explorer-menu');
  const parent = menu?.parentElement;
  if (!menu || !parent) return;

  if (!slot) {
    slot = document.createElement('div');
    slot.id = SLOT_ID;
  }
  // (Re)insert directly above the tree if it's drifted or been removed.
  if (slot.parentElement !== parent || slot.nextElementSibling !== menu) {
    parent.insertBefore(slot, menu);
  }
  if (!root) {
    root = createRoot(slot);
    root.render(<CreateAppLauncher />);
  }
}

/**
 * With `showRoots: false` every section starts collapsed. We want the last
 * section — the full-app "Examples" demo — open on first load. Storybook only
 * auto-expands the folder containing the *active* story, and the landing story
 * is the first one (Welcome), so we expand "Examples" ourselves once per
 * session. The session flag means a manual collapse sticks instead of being
 * fought on the next sidebar re-render.
 */
const EXPAND_FLAG = 'e4-examples-expanded';

function flagged(): boolean {
  try {
    return sessionStorage.getItem(EXPAND_FLAG) === '1';
  } catch {
    return false;
  }
}

function setFlag() {
  try {
    sessionStorage.setItem(EXPAND_FLAG, '1');
  } catch {
    // sessionStorage can throw in locked-down contexts; ignore.
  }
}

/**
 * Try once to open the "Examples" section. Clicking is a *toggle*, so we only
 * click while it's collapsed and let the caller re-check on the next tick —
 * the section's expanded state is React-controlled and can revert on a sidebar
 * re-render, so a single click doesn't always stick. Returns true once the
 * section is confirmed open, at which point we lock the flag so a later manual
 * collapse is respected instead of being re-opened.
 */
function tryExpandExamples(): boolean {
  if (flagged()) return true;
  // The "Examples" root title maps to the item id `examples`; its collapse
  // toggle is a <button> with that id carrying aria-expanded.
  const toggle = document.querySelector<HTMLElement>('button#examples[aria-expanded]');
  if (!toggle) return false;
  if (toggle.getAttribute('aria-expanded') === 'true') {
    setFlag();
    return true;
  }
  toggle.click();
  return false;
}

function bootstrapExamplesExpansion() {
  if (flagged()) return;
  // Poll rather than react to every mutation: ticks are spaced far enough
  // apart that the DOM settles between them, so we never double-toggle.
  let tries = 0;
  const timer = window.setInterval(() => {
    if (tryExpandExamples() || ++tries >= 40) window.clearInterval(timer);
  }, 150);
}

/**
 * The sidebar's "Find components" search is a downshift combobox: the real
 * <input id="storybook-explorer-searchfield"> is wrapped in a
 * <div role="combobox"> whose only accessible name comes from an
 * `aria-labelledby` pointing at a visually-hidden label. Tools that read a
 * field's name from its own attributes — placeholder, aria-label, text — rather
 * than resolving that reference (our auto-poster's deterministic search-jump
 * among them) see the wrapper as unnamed and can't match it as "the search
 * box." Stamp a plain `aria-label` on both the wrapper and the input so the
 * accessible name is legible without following the indirection. Idempotent, and
 * re-applied on sidebar re-renders alongside the Create-app slot.
 */
function ensureSearchLabel() {
  const SEARCH_LABEL = 'Search components';
  const input = document.getElementById('storybook-explorer-searchfield');
  if (input && input.getAttribute('aria-label') !== SEARCH_LABEL) {
    input.setAttribute('aria-label', SEARCH_LABEL);
  }
  const combobox = input?.closest('[role="combobox"]');
  if (combobox && combobox.getAttribute('aria-label') !== SEARCH_LABEL) {
    combobox.setAttribute('aria-label', SEARCH_LABEL);
  }
}

function bootstrapSidebarButton() {
  ensureMounted();
  ensureSearchLabel();
  const observer = new MutationObserver(() => {
    ensureMounted();
    ensureSearchLabel();
  });
  const region = document.getElementById('storybook-sidebar-region') ?? document.body;
  observer.observe(region, { childList: true, subtree: true });
  bootstrapExamplesExpansion();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapSidebarButton);
  } else {
    bootstrapSidebarButton();
  }
}
