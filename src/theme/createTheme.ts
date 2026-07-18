import type { Theme, ThemeOverride } from './tokens';
import { wireframe } from './wireframe';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    result[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
  }
  return result as T;
}

/**
 * Build a project theme by overriding the wireframe base (or another theme via
 * `from`). Only specify what changes — everything else inherits.
 *
 * ```ts
 * const brand = createTheme({
 *   name: 'acme',
 *   colors: { primary: '#FF5A1F', accent: '#0EA5E9' },
 *   typography: { faces: systemFonts },
 * });
 * ```
 */
export function createTheme(override: ThemeOverride, from: Theme = wireframe): Theme {
  return deepMerge(from, override);
}
