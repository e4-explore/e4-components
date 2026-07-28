/**
 * Return `color` with the given alpha applied, as an `rgba(...)` string.
 * Accepts 3- or 6-digit hex (the form every theme token uses). Non-hex input
 * (e.g. an already-rgba value) is returned unchanged so callers stay safe.
 */
export function withAlpha(color: string, alpha: number): string {
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(color.trim());
  if (!match) return color;
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
