import React, { useEffect, useState } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  AccessibilityInfo,
  type ViewProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/** Minimal shape of expo-blur's `BlurView`, injected via `registerGlassBlur`. */
type BlurComponent = React.ComponentType<{
  intensity?: number;
  tint?: string;
  experimentalBlurMethod?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}>;

let registeredBlur: BlurComponent | null = null;

/**
 * Opt into real *native* backdrop blur for the glass theme. Call once at app
 * startup, passing expo-blur's `BlurView`:
 *
 * ```ts
 * import { BlurView } from 'expo-blur';
 * import { registerGlassBlur } from 'e4-components';
 * registerGlassBlur(BlurView);
 * ```
 *
 * Why injection instead of a direct import: the library ships raw source with
 * no build step, so a top-level `import 'expo-blur'` would force *every*
 * consumer — even ones on the wireframe theme — to install it. Registering the
 * component keeps expo-blur an opt-in dependency of glass-theme apps only.
 *
 * Web never needs this — it blurs via CSS `backdrop-filter`. Without it,
 * native falls back to a translucent tint (no blur).
 */
export function registerGlassBlur(component: BlurComponent | null) {
  registeredBlur = component;
}

export interface GlassSurfaceProps extends ViewProps {
  /** Blur weight, mapped to `theme.material.blur`. Default `'regular'`. */
  intensity?: 'thin' | 'regular' | 'thick';
  /** Draw the bright specular edge highlight. Default `true`. */
  highlight?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * True when the platform reports a "reduce transparency" preference. On web
 * that's the `prefers-reduced-transparency` media query; on native it's the
 * iOS/Android accessibility flag. Glass surfaces go opaque when it's on.
 */
function useReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const mq =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-transparency: reduce)')
          : null;
      if (!mq) return;
      setReduce(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
      // Safari <14 only has the deprecated addListener form.
      mq.addEventListener?.('change', onChange) ?? mq.addListener?.(onChange);
      return () => {
        mq.removeEventListener?.('change', onChange) ?? mq.removeListener?.(onChange);
      };
    }

    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.().then((v) => {
      if (mounted) setReduce(!!v);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceTransparencyChanged',
      (v: boolean) => setReduce(!!v),
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return reduce;
}

/**
 * A translucent "glass" surface: blurs and saturates whatever sits behind it,
 * paints the theme's tint over it, and draws a hairline specular edge.
 *
 * Degrades gracefully in this order:
 * - **No `theme.material`** (any non-glass theme) → a plain opaque surface.
 * - **Reduce Transparency on** → the opaque `fallback` fill (legibility first).
 * - **Web** → CSS `backdrop-filter: blur() saturate()` (all current browsers).
 * - **Native + registered blur** → expo-blur `BlurView` behind the content.
 * - **Native, no blur registered** → the `fallback` tint (no blur).
 *
 * Callers own `borderRadius`, layout, and shadow via `style`; keep shadows on
 * an *outer* wrapper so the blur's `overflow: hidden` doesn't clip them.
 */
export function GlassSurface({
  intensity = 'regular',
  highlight = true,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const theme = useTheme();
  const material = theme.material;
  const reduce = useReduceTransparency();

  // Non-glass theme: behave exactly like a normal opaque surface.
  if (!material) {
    return (
      <View {...rest} style={[{ backgroundColor: theme.colors.surface }, style]}>
        {children}
      </View>
    );
  }

  const edge: ViewStyle = highlight
    ? { borderWidth: material.highlightWidth, borderColor: material.highlight }
    : {};

  // Accessibility: opaque fill, no blur.
  if (reduce) {
    return (
      <View {...rest} style={[{ backgroundColor: material.fallback }, edge, style]}>
        {children}
      </View>
    );
  }

  const blurRadius = material.blur[intensity];

  if (Platform.OS === 'web') {
    const filter = `blur(${blurRadius}px) saturate(${material.saturation})`;
    // `backdropFilter` isn't in RN's ViewStyle type but react-native-web
    // forwards it to the DOM node — cast through to set it.
    const webStyle = {
      backgroundColor: material.tint,
      backdropFilter: filter,
      WebkitBackdropFilter: filter,
    } as ViewStyle;
    return (
      <View {...rest} style={[webStyle, edge, style]}>
        {children}
      </View>
    );
  }

  // Native with a registered BlurView: real backdrop blur behind the content.
  const Blur = registeredBlur;
  if (Blur) {
    // expo-blur intensity is roughly 0–100; scale our px radius into that band.
    const intensityValue = Math.max(1, Math.min(100, Math.round(blurRadius * 2.2)));
    return (
      <View {...rest} style={[{ overflow: 'hidden' }, edge, style]}>
        <Blur
          intensity={intensityValue}
          tint={material.nativeTint}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  // Native without expo-blur registered: translucent tint fallback, no blur.
  return (
    <View {...rest} style={[{ backgroundColor: material.fallback }, edge, style]}>
      {children}
    </View>
  );
}
