import { Platform } from 'react-native';
import type { FontFace } from './tokens';

/**
 * Shantell Sans — the wireframe face. Playful and hand-drawn, but with real
 * weights so it can carry a whole UI.
 *
 * Web resolves through CSS font-family + weight. Native needs one registered
 * family per weight; the names below match what `@expo-google-fonts/shantell-sans`
 * (or a manual link of the static TTFs) registers.
 */
export const wireframeFonts: { regular: FontFace; medium: FontFace; bold: FontFace } = {
  regular: Platform.select<FontFace>({
    web: { fontFamily: "'Shantell Sans', 'Comic Sans MS', cursive", fontWeight: '400' },
    default: { fontFamily: 'ShantellSans_400Regular' },
  })!,
  medium: Platform.select<FontFace>({
    web: { fontFamily: "'Shantell Sans', 'Comic Sans MS', cursive", fontWeight: '500' },
    default: { fontFamily: 'ShantellSans_500Medium' },
  })!,
  bold: Platform.select<FontFace>({
    web: { fontFamily: "'Shantell Sans', 'Comic Sans MS', cursive", fontWeight: '700' },
    default: { fontFamily: 'ShantellSans_700Bold' },
  })!,
};

/**
 * JetBrains Mono — the manifest face. Dense, technical, ledger-like: built
 * for barcodes, binary strings, and tabular data rows rather than prose.
 *
 * Web resolves through CSS font-family + weight. Native needs one registered
 * family per weight; the names below match what `@expo-google-fonts/jetbrains-mono`
 * (or a manual link of the static TTFs) registers.
 */
export const manifestFonts: { regular: FontFace; medium: FontFace; bold: FontFace } = {
  regular: Platform.select<FontFace>({
    web: { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace", fontWeight: '400' },
    default: { fontFamily: 'JetBrainsMono_400Regular' },
  })!,
  medium: Platform.select<FontFace>({
    web: { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace", fontWeight: '500' },
    default: { fontFamily: 'JetBrainsMono_500Medium' },
  })!,
  bold: Platform.select<FontFace>({
    web: { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace", fontWeight: '700' },
    default: { fontFamily: 'JetBrainsMono_700Bold' },
  })!,
};

/** System font stack, handy for branded themes that don't ship a custom face. */
export const systemFonts: { regular: FontFace; medium: FontFace; bold: FontFace } = {
  regular: Platform.select<FontFace>({
    web: { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '400' },
    ios: { fontFamily: 'System', fontWeight: '400' },
    default: { fontFamily: 'sans-serif' },
  })!,
  medium: Platform.select<FontFace>({
    web: { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '500' },
    ios: { fontFamily: 'System', fontWeight: '500' },
    default: { fontFamily: 'sans-serif-medium' },
  })!,
  bold: Platform.select<FontFace>({
    web: { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '700' },
    ios: { fontFamily: 'System', fontWeight: '700' },
    default: { fontFamily: 'sans-serif', fontWeight: '700' },
  })!,
};
