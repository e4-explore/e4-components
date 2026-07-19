import React, { useEffect, useRef } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useDrag } from './DragProvider';

export interface DragColumnRenderInfo<T> {
  item: T;
  index: number;
  /** True for the card currently lifted into the floating overlay. */
  isDragging: boolean;
}

export interface DragColumnProps<T> {
  /** Stable column id — used as the drop target key. */
  id: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (info: DragColumnRenderInfo<T>) => React.ReactNode;
  /** Fixed row height (card + gap). Uniform rows keep index math exact. */
  rowHeight: number;
  /**
   * When set (> 0), a card must be held this long before it lifts (mobile
   * list feel). When 0 (default), a card lifts as soon as it's dragged past a
   * small threshold — better for a board with visible grip handles, and it
   * won't fight vertical scrolling since board columns don't scroll
   * internally.
   */
  activationDelay?: number;
  /** Minimum drop area so an emptied column stays targetable. */
  minHeight?: number;
}

interface CardProps {
  columnId: string;
  itemKey: string;
  payload: unknown;
  index: number;
  rowHeight: number;
  activationDelay: number;
  renderCard: (dragging: boolean) => React.ReactNode;
}

function DragCard({
  columnId,
  itemKey,
  payload,
  index,
  rowHeight,
  activationDelay,
  renderCard,
}: CardProps) {
  const drag = useDrag();
  const ref = useRef<View>(null);
  const cardId = `${columnId}:${itemKey}`;
  const isDragging = drag.activeKey === cardId;

  const measure = () => {
    const node = ref.current as (View & { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void }) | null;
    node?.measureInWindow?.((x, y, width, height) => {
      drag.measureCard(cardId, { x, y, width, height });
    });
  };

  const onLayout = (_e: LayoutChangeEvent) => measure();

  const { absX, absY, layouts, lastCol, lastIdx, startDrag, moveTarget, endDrag } = drag;

  const basePan = Gesture.Pan();
  const pan = (activationDelay > 0
    ? basePan.activateAfterLongPress(activationDelay)
    : basePan.activeOffsetX([-10, 10]).activeOffsetY([-10, 10])
  )
    .onStart((e) => {
      'worklet';
      runOnJS(startDrag)({
        from: columnId,
        itemKey,
        payload,
        absoluteX: e.absoluteX,
        absoluteY: e.absoluteY,
        renderOverlay: () => renderCard(true),
      });
    })
    .onUpdate((e) => {
      'worklet';
      absX.value = e.absoluteX;
      absY.value = e.absoluteY;
      const ls = layouts.value;
      let col: string | null = null;
      let idx = 0;
      for (const id in ls) {
        const c = ls[id];
        if (e.absoluteX >= c.x && e.absoluteX <= c.x + c.width && e.absoluteY >= c.y && e.absoluteY <= c.y + c.height) {
          col = id;
          idx = Math.max(0, Math.min(c.count, Math.round((e.absoluteY - c.y) / c.rowHeight)));
          break;
        }
      }
      if (col !== lastCol.value || idx !== lastIdx.value) {
        lastCol.value = col;
        lastIdx.value = idx;
        runOnJS(moveTarget)(col, idx);
      }
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(endDrag)();
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        ref={ref}
        onLayout={onLayout}
        style={{ height: rowHeight, opacity: isDragging ? 0.25 : 1 }}
      >
        {renderCard(false)}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * A droppable column of draggable cards. Register several inside a single
 * `DragProvider` to move cards between them. Cards lift on long-press, follow
 * the finger across columns, and a bold insertion line marks where a release
 * will land.
 */
export function DragColumn<T>({
  id,
  data,
  keyExtractor,
  renderItem,
  rowHeight,
  activationDelay = 0,
  minHeight,
}: DragColumnProps<T>) {
  const theme = useTheme();
  const drag = useDrag();
  const ref = useRef<View>(null);

  const measure = () => {
    const node = ref.current as (View & { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void }) | null;
    node?.measureInWindow?.((x, y, width, height) => {
      drag.registerColumn(id, { x, y, width, height, rowHeight, count: data.length });
    });
  };

  // Re-measure whenever the item count changes (layout shifts the column).
  useEffect(() => {
    measure();
    return () => drag.unregisterColumn(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data.length, rowHeight]);

  const showIndicator = drag.target.column === id;
  const indicatorIndex = Math.min(drag.target.index, data.length);

  const contentHeight = Math.max(data.length * rowHeight, minHeight ?? rowHeight);

  return (
    <View
      ref={ref}
      onLayout={measure}
      collapsable={false}
      style={{ position: 'relative', height: contentHeight }}
    >
      {data.map((item, index) => (
        <DragCard
          key={keyExtractor(item)}
          columnId={id}
          itemKey={keyExtractor(item)}
          payload={item}
          index={index}
          rowHeight={rowHeight}
          activationDelay={activationDelay}
          renderCard={(dragging) => renderItem({ item, index, isDragging: dragging })}
        />
      ))}
      {showIndicator ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: Math.max(0, indicatorIndex * rowHeight - theme.borders.thick),
            height: theme.borders.thick * 2,
            borderRadius: theme.borders.thick,
            borderTopWidth: theme.borders.thick,
            borderColor: theme.colors.primary,
            borderStyle: theme.borders.sketchStyle,
          }}
        />
      ) : null}
    </View>
  );
}
