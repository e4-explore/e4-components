import { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import type { SpringPreset } from '../theme/tokens';

/**
 * Shared layout transition: whenever siblings move because something was
 * added, removed, or resized, they glide instead of jumping. Attach as
 * `layout={settle(springs.gentle)}` on anything that may be displaced.
 */
export function settle(spring: SpringPreset) {
  return LinearTransition.springify()
    .damping(spring.damping)
    .stiffness(spring.stiffness)
    .mass(spring.mass);
}

/** Standard entering/exiting for inline add/remove. */
export const enter = FadeIn.duration(160);
export const exit = FadeOut.duration(120);
