import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const e4Theme = create({
  base: 'light',
  brandTitle: 'e4 Explorebook',
  brandUrl: 'https://github.com/ethanphilipgrove-dot',
  brandImage: 'e4-logo.svg',
  brandTarget: '_blank',

  colorPrimary: '#2A2A33',
  colorSecondary: '#4B7BFF',

  appBg: '#FAFAF7',
  appContentBg: '#FAFAF7',
  appPreviewBg: '#FAFAF7',
  appBorderColor: '#2A2A33',
  appBorderRadius: 12,

  fontBase: "'Shantell Sans', 'Comic Sans MS', cursive",
  fontCode: "'Menlo', 'Consolas', monospace",

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

addons.setConfig({
  theme: e4Theme,
});

// Wireframe tokens, inlined: the manager runs outside the RN-web ThemeProvider,
// so it can't read the theme object the preview uses.
const INK = '#2A2A33';
const PAPER = '#FAFAF7';
const PRIMARY = '#3B44D9';
const FONT = "'Shantell Sans', 'Comic Sans MS', cursive";

// The Create-app form story, loaded in isolation. Pinning globals keeps the
// modal on the wireframe theme regardless of the toolbar's current selection.
const FORM_URL = 'iframe.html?id=create-app--start&viewMode=story&globals=theme:wireframe;mode:light';

function CreateAppModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        background: 'rgba(42, 42, 51, 0.45)',
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
          background: PAPER,
          border: `2px solid ${INK}`,
          borderRadius: 16,
          boxShadow: `6px 6px 0 ${INK}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `2px solid ${INK}`,
            flex: '0 0 auto',
          }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: INK }}>
            Create an app
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
              color: INK,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <iframe
          title="Create an app"
          src={FORM_URL}
          style={{ flex: '1 1 auto', width: '100%', border: 'none', background: PAPER }}
        />
      </div>
    </div>
  );
}

function CreateAppLauncher() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
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
    <div style={{ padding: '10px 12px 6px' }}>
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
          color: '#FFFFFF',
          background: PRIMARY,
          border: `2px solid ${INK}`,
          borderRadius: 10,
          // Hard offset shadow that "presses" on hover — the wireframe feel.
          boxShadow: hover ? `1px 1px 0 ${INK}` : `3px 3px 0 ${INK}`,
          transform: hover ? 'translate(2px, 2px)' : 'none',
          transition: 'box-shadow 80ms ease, transform 80ms ease',
          cursor: 'pointer',
        }}
      >
        Copy App Locally
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

function bootstrapSidebarButton() {
  ensureMounted();
  const observer = new MutationObserver(() => ensureMounted());
  const region = document.getElementById('storybook-sidebar-region') ?? document.body;
  observer.observe(region, { childList: true, subtree: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapSidebarButton);
  } else {
    bootstrapSidebarButton();
  }
}
