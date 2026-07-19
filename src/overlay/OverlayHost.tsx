import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../primitives/Box';

export interface OverlayPlacement {
  x: number;
  y: number;
  width: number;
}

interface OverlayEntry extends OverlayPlacement {
  id: number;
  render: () => React.ReactNode;
}

interface OverlayApi {
  show: (placement: OverlayPlacement, render: () => React.ReactNode) => number;
  update: (id: number, patch: Partial<OverlayPlacement> & { render?: () => React.ReactNode }) => void;
  hide: (id: number) => void;
}

const OverlayContext = createContext<OverlayApi | null>(null);

/**
 * Mount once near the app root (inside ThemeProvider, alongside ToastProvider).
 * Lets components like Select render floating panels measured to a screen
 * position instead of nested in normal layout flow — so they escape every
 * ancestor's stacking context and overflow clipping, not just the immediate
 * parent. (react-native-web puts most Views at `position: relative` by
 * default, which caps a local z-index escalation at one level up — it can't
 * reach past a generic wrapper like FormField to outrank a later sibling.)
 */
export function OverlayHost({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<OverlayEntry[]>([]);
  const counter = useRef(0);

  const show = useCallback<OverlayApi['show']>((placement, render) => {
    const id = ++counter.current;
    setEntries((cur) => [...cur, { id, render, ...placement }]);
    return id;
  }, []);

  const update = useCallback<OverlayApi['update']>((id, patch) => {
    setEntries((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const hide = useCallback<OverlayApi['hide']>((id) => {
    setEntries((cur) => cur.filter((e) => e.id !== id));
  }, []);

  return (
    <OverlayContext.Provider value={{ show, update, hide }}>
      {children}
      <Box pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
        {entries.map((e) => (
          <Box key={e.id} style={{ position: 'absolute', left: e.x, top: e.y, width: e.width }}>
            {e.render()}
          </Box>
        ))}
      </Box>
    </OverlayContext.Provider>
  );
}

export function useOverlay(): OverlayApi {
  const api = useContext(OverlayContext);
  if (!api) throw new Error('useOverlay must be used inside an <OverlayHost>');
  return api;
}
