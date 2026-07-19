import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../primitives/Box';

export interface OverlayPlacement {
  x: number;
  y: number;
  width: number;
  /**
   * Render the entry across the whole overlay layer instead of pinned at
   * (x, y). For full-screen floats like a bottom sheet that position
   * themselves (scrim + edge-anchored panel) and don't want a measured
   * trigger position.
   */
  fill?: boolean;
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

  // `show`/`update`/`hide` are each stable (useCallback with no deps), but
  // without memoizing the object that wraps them, this literal is a *new*
  // object every render — including every render triggered by `entries`
  // changing. Since every `useOverlay()` consumer (e.g. Select) re-renders
  // whenever the context value's identity changes, an unmemoized value here
  // turns any overlay.update() call into a render loop: update → new entries
  // → new context value → every consumer re-renders → their effects re-fire
  // → they call update() again.
  const api = useMemo<OverlayApi>(() => ({ show, update, hide }), [show, update, hide]);

  return (
    <OverlayContext.Provider value={api}>
      {children}
      <Box pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
        {entries.map((e) =>
          e.fill ? (
            // Entry paints itself across the full layer (which is absoluteFill).
            <React.Fragment key={e.id}>{e.render()}</React.Fragment>
          ) : (
            <Box key={e.id} style={{ position: 'absolute', left: e.x, top: e.y, width: e.width }}>
              {e.render()}
            </Box>
          ),
        )}
      </Box>
    </OverlayContext.Provider>
  );
}

export function useOverlay(): OverlayApi {
  const api = useContext(OverlayContext);
  if (!api) throw new Error('useOverlay must be used inside an <OverlayHost>');
  return api;
}
