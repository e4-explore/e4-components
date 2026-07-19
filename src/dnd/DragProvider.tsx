import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

/** Window-space rectangle plus the per-column drop metadata needed to hit-test. */
export interface ColumnLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  rowHeight: number;
  count: number;
}

export interface DropTarget {
  column: string | null;
  index: number;
}

/** Result handed to the board's onDrop when a card is released over a column. */
export interface DropResult {
  from: string;
  itemKey: string;
  to: string;
  toIndex: number;
  payload: unknown;
}

interface StartInfo {
  from: string;
  itemKey: string;
  payload: unknown;
  absoluteX: number;
  absoluteY: number;
  renderOverlay: () => React.ReactNode;
}

interface DragContextValue {
  // Worklet-readable shared state driving the floating overlay + hit-testing.
  absX: SharedValue<number>;
  absY: SharedValue<number>;
  offX: SharedValue<number>;
  offY: SharedValue<number>;
  dragging: SharedValue<boolean>;
  layouts: SharedValue<Record<string, ColumnLayout>>;
  lastCol: SharedValue<string | null>;
  lastIdx: SharedValue<number>;
  // JS-side registry + lifecycle, called from gestures via runOnJS.
  registerColumn: (id: string, layout: ColumnLayout) => void;
  unregisterColumn: (id: string) => void;
  measureCard: (key: string, rect: { x: number; y: number; width: number; height: number }) => void;
  startDrag: (info: StartInfo) => void;
  moveTarget: (column: string | null, index: number) => void;
  endDrag: () => void;
  // React state consumed by columns/cards for reflow + dimming.
  activeKey: string | null;
  target: DropTarget;
}

const DragContext = createContext<DragContextValue | null>(null);

export interface DragProviderProps {
  /**
   * Called when a card is dropped over a column. The consumer owns all
   * columns' data (typically a `Record<columnId, item[]>`) and applies the
   * move — remove `itemKey` from `from`, insert its `payload` into `to` at
   * `toIndex`.
   */
  onDrop: (result: DropResult) => void;
  children: React.ReactNode;
}

/**
 * Global drag context for cross-list (kanban) drag-and-drop. Mount it around
 * a set of `DragColumn`s. A single floating overlay clone follows the finger
 * across column boundaries; drops are hit-tested in window coordinates so a
 * card can land in any registered column regardless of nesting.
 */
export function DragProvider({ onDrop, children }: DragProviderProps) {
  const theme = useTheme();
  const rootRef = useRef<View>(null);

  const absX = useSharedValue(0);
  const absY = useSharedValue(0);
  const offX = useSharedValue(0);
  const offY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const layouts = useSharedValue<Record<string, ColumnLayout>>({});
  const lastCol = useSharedValue<string | null>(null);
  const lastIdx = useSharedValue(0);

  const columnsRef = useRef<Record<string, ColumnLayout>>({});
  const cardRects = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});
  const dragMeta = useRef<{ from: string; itemKey: string; payload: unknown } | null>(null);
  // The live drop target, mirrored in a ref so `endDrag` reads the latest value
  // rather than a stale closure — the gesture's onFinalize runs a worklet whose
  // captured `endDrag` may predate the last `moveTarget` state update.
  const targetRef = useRef<DropTarget>({ column: null, index: 0 });
  // Provider's own window origin — finger/column coords are window-based, but
  // the overlay layer is positioned relative to this provider, so we subtract.
  const origin = useRef({ x: 0, y: 0 });

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{ render: () => React.ReactNode; width: number; height: number } | null>(null);
  const [target, setTarget] = useState<DropTarget>({ column: null, index: 0 });

  const syncLayouts = useCallback(() => {
    layouts.value = { ...columnsRef.current };
  }, [layouts]);

  const registerColumn = useCallback(
    (id: string, layout: ColumnLayout) => {
      columnsRef.current[id] = layout;
      syncLayouts();
    },
    [syncLayouts],
  );

  const unregisterColumn = useCallback(
    (id: string) => {
      delete columnsRef.current[id];
      syncLayouts();
    },
    [syncLayouts],
  );

  const measureCard = useCallback(
    (key: string, rect: { x: number; y: number; width: number; height: number }) => {
      cardRects.current[key] = rect;
    },
    [],
  );

  const startDrag = useCallback(
    (info: StartInfo) => {
      const rect = cardRects.current[`${info.from}:${info.itemKey}`];
      const width = rect?.width ?? 240;
      const height = rect?.height ?? 56;
      offX.value = rect ? info.absoluteX - rect.x : width / 2;
      offY.value = rect ? info.absoluteY - rect.y : height / 2;
      absX.value = info.absoluteX;
      absY.value = info.absoluteY;
      dragging.value = true;
      dragMeta.current = { from: info.from, itemKey: info.itemKey, payload: info.payload };
      setOverlay({ render: info.renderOverlay, width, height });
      setActiveKey(`${info.from}:${info.itemKey}`);
    },
    [absX, absY, offX, offY, dragging],
  );

  const moveTarget = useCallback((column: string | null, index: number) => {
    targetRef.current = { column, index };
    setTarget({ column, index });
  }, []);

  const endDrag = useCallback(() => {
    dragging.value = false;
    lastCol.value = null;
    lastIdx.value = 0;
    const meta = dragMeta.current;
    const to = targetRef.current;
    if (meta && to.column) {
      onDrop({
        from: meta.from,
        itemKey: meta.itemKey,
        to: to.column,
        toIndex: to.index,
        payload: meta.payload,
      });
    }
    dragMeta.current = null;
    targetRef.current = { column: null, index: 0 };
    setActiveKey(null);
    setOverlay(null);
    setTarget({ column: null, index: 0 });
  }, [dragging, lastCol, lastIdx, onDrop]);

  const onRootLayout = (e: LayoutChangeEvent) => {
    const node = rootRef.current as (View & { measureInWindow?: (cb: (x: number, y: number) => void) => void }) | null;
    node?.measureInWindow?.((x, y) => {
      origin.current = { x, y };
    });
    // Touch the event so RN keeps firing onLayout on resize.
    void e.nativeEvent.layout;
  };

  const overlayStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: absX.value - offX.value },
      { translateY: absY.value - offY.value },
      { scale: withSpring(dragging.value ? 1.04 : 1, theme.motion.springs.snappy) },
    ],
    opacity: dragging.value ? 1 : 0,
  }));

  const value: DragContextValue = {
    absX,
    absY,
    offX,
    offY,
    dragging,
    layouts,
    lastCol,
    lastIdx,
    registerColumn,
    unregisterColumn,
    measureCard,
    startDrag,
    moveTarget,
    endDrag,
    activeKey,
    target,
  };

  return (
    <DragContext.Provider value={value}>
      <View ref={rootRef} onLayout={onRootLayout} style={{ flex: 1 }} collapsable={false}>
        {children}
        {overlay ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { zIndex: 2000 },
            ]}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: -origin.current.x,
                  top: -origin.current.y,
                  width: overlay.width,
                  ...theme.shadows.lifted,
                },
                overlayStyle,
              ]}
            >
              {overlay.render()}
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </DragContext.Provider>
  );
}

export function useDrag(): DragContextValue {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag / DragColumn must be used inside a <DragProvider>');
  return ctx;
}
