import React, { useEffect, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedReaction,
  withSpring,
  scrollTo,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme } from '../theme/tokens';

type Positions = Record<string, number>;

export interface DraggableRenderInfo<T> {
  item: T;
  index: number;
  /** True while this row is lifted. */
  isActive: boolean;
}

export interface DraggableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (info: DraggableRenderInfo<T>) => React.ReactNode;
  /** Called with the reordered array when a drag settles. */
  onReorder: (data: T[]) => void;
  /** Fixed row height (content + gap). Uniform rows keep reordering perfectly stable. */
  rowHeight: number;
  /** Max visible height; list scrolls beyond it and auto-scrolls near edges while dragging. */
  maxHeight?: number;
  /** Hold time before a row lifts (ms). */
  activationDelay?: number;
  style?: StyleProp<ViewStyle>;
}

const AUTOSCROLL_EDGE = 60;
const AUTOSCROLL_STEP = 14;
// Breathing room around the rows so a lifted row's enhanced shadow (and slight
// scale-up) never gets hard-clipped by the ScrollView's own bounds. Applied on
// every edge: vertically via the row offset + taller content, horizontally via
// contentContainer padding. Without the horizontal room the scaled card and its
// offset shadow spill past the ScrollView's right edge, where `overflow: hidden`
// slices them off mid-drag.
const LIFT_MARGIN = 14;

interface RowProps {
  id: string;
  count: number;
  rowHeight: number;
  positions: SharedValue<Positions>;
  scrollY: SharedValue<number>;
  viewportHeight: number;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  activationDelay: number;
  theme: Theme;
  setActiveId: (id: string | null) => void;
  commitOrder: (positions: Positions) => void;
  children: React.ReactNode;
}

function DraggableRow({
  id,
  count,
  rowHeight,
  positions,
  scrollY,
  viewportHeight,
  scrollRef,
  activationDelay,
  theme,
  setActiveId,
  commitOrder,
  children,
}: RowProps) {
  const translateY = useSharedValue(positions.value[id] * rowHeight + LIFT_MARGIN);
  const dragging = useSharedValue(false);
  const startY = useSharedValue(0);
  const scrollStart = useSharedValue(0);
  const spring = theme.motion.springs.gentle;
  const contentHeight = count * rowHeight;

  // Displaced rows glide to their new slot.
  useAnimatedReaction(
    () => positions.value[id],
    (slot, prev) => {
      if (slot === undefined) return;
      if (!dragging.value && (prev === null || slot !== prev)) {
        translateY.value = withSpring(slot * rowHeight + LIFT_MARGIN, spring);
      }
    },
  );

  const moveTo = (y: number) => {
    'worklet';
    // Keep the lifted row pinned between the first and last slots so it can't be
    // dragged past the top/bottom of the ScrollView and get clipped by it.
    const minY = LIFT_MARGIN;
    const maxY = (count - 1) * rowHeight + LIFT_MARGIN;
    const clampedY = Math.max(minY, Math.min(maxY, y));
    translateY.value = clampedY;
    const newIndex = Math.max(0, Math.min(count - 1, Math.round((clampedY - LIFT_MARGIN) / rowHeight)));
    const current = positions.value[id];
    if (newIndex !== current) {
      // Shift every row between the old and new slot by one (not a swap) so
      // fast drags that cross several rows in a frame still land in order.
      const next: Positions = { ...positions.value };
      for (const key in next) {
        if (key === id) continue;
        const idx = next[key];
        if (current < newIndex && idx > current && idx <= newIndex) next[key] = idx - 1;
        else if (newIndex < current && idx >= newIndex && idx < current) next[key] = idx + 1;
      }
      next[id] = newIndex;
      positions.value = next;
    }
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(activationDelay)
    .onStart(() => {
      dragging.value = true;
      startY.value = positions.value[id] * rowHeight + LIFT_MARGIN;
      scrollStart.value = scrollY.value;
      runOnJS(setActiveId)(id);
    })
    .onUpdate((e) => {
      const scrollDelta = scrollY.value - scrollStart.value;
      moveTo(startY.value + e.translationY + scrollDelta);

      // Auto-scroll when the lifted row nears the viewport edges.
      const maxScroll = Math.max(0, contentHeight - viewportHeight);
      if (maxScroll > 0) {
        const topInViewport = translateY.value - LIFT_MARGIN - scrollY.value;
        if (topInViewport < AUTOSCROLL_EDGE && scrollY.value > 0) {
          scrollTo(scrollRef, 0, Math.max(0, scrollY.value - AUTOSCROLL_STEP), false);
        } else if (
          topInViewport + rowHeight > viewportHeight - AUTOSCROLL_EDGE &&
          scrollY.value < maxScroll
        ) {
          scrollTo(scrollRef, 0, Math.min(maxScroll, scrollY.value + AUTOSCROLL_STEP), false);
        }
      }
    })
    .onFinalize(() => {
      dragging.value = false;
      translateY.value = withSpring(positions.value[id] * rowHeight + LIFT_MARGIN, spring);
      runOnJS(commitOrder)(positions.value);
      runOnJS(setActiveId)(null);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: withSpring(dragging.value ? 1.03 : 1, theme.motion.springs.snappy) },
    ],
    zIndex: dragging.value ? 10 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            // Inset from the ScrollView edges so a lifted row's scale-up and
            // offset shadow have room to render instead of being clipped by the
            // container's `overflow: hidden` (react-native-web ignores container
            // padding for absolutely-positioned children, so inset the row).
            left: LIFT_MARGIN,
            right: LIFT_MARGIN,
            top: 0,
            height: rowHeight,
          },
          // The lift shadow lives on the rendered card (via `isActive`), not this
          // full-height wrapper — a wrapper shadow reads as a square block offset
          // below the card. Consumers apply their own rounded, flush lift shadow.
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Reorderable list with flagship-app feel: long-press lifts a row (scale +
 * offset shadow), neighbors spring aside as you drag, edges auto-scroll, and
 * release settles everything with a spring — nothing ever jumps.
 */
export function DraggableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  rowHeight,
  maxHeight,
  activationDelay = 200,
  style,
}: DraggableListProps<T>) {
  const theme = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);

  const identity = (): Positions =>
    Object.fromEntries(data.map((item, index) => [keyExtractor(item), index]));

  const positions = useSharedValue<Positions>(identity());

  // Keep the position map in sync when the caller adds/removes/replaces items.
  const dataKey = data.map(keyExtractor).join('§');
  useEffect(() => {
    positions.value = identity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollViewOffset(scrollRef);

  const contentHeight = data.length * rowHeight;
  const viewportHeight = maxHeight ? Math.min(maxHeight, contentHeight) : contentHeight;

  const commitOrder = (finalPositions: Positions) => {
    const next = [...data].sort(
      (a, b) => finalPositions[keyExtractor(a)] - finalPositions[keyExtractor(b)],
    );
    const changed = next.some((item, i) => keyExtractor(item) !== keyExtractor(data[i]));
    if (changed) onReorder(next);
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={[{ height: viewportHeight + LIFT_MARGIN * 2 }, style]}
      contentContainerStyle={{ height: contentHeight + LIFT_MARGIN * 2 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={activeId === null}
    >
      {data.map((item, index) => {
        const id = keyExtractor(item);
        return (
          <DraggableRow
            key={id}
            id={id}
            count={data.length}
            rowHeight={rowHeight}
            positions={positions}
            scrollY={scrollY}
            viewportHeight={viewportHeight}
            scrollRef={scrollRef}
            activationDelay={activationDelay}
            theme={theme}
            setActiveId={setActiveId}
            commitOrder={commitOrder}
          >
            {renderItem({ item, index, isActive: activeId === id })}
          </DraggableRow>
        );
      })}
    </Animated.ScrollView>
  );
}
