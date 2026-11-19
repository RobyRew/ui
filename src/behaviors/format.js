/* Number formatting shared by the server-rendered components and the
 * behaviours that update them, so both print the same thing. */

const formats = new Map();

/** 1234 → "1.2K" in the page's language; under 1000 as it is. */
export function formatCount(n, locale) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  if (v < 1000) return String(v);
  const key = locale || 'default';
  if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(locale || undefined, { notation: 'compact', maximumFractionDigits: 1 }));
  return formats.get(key).format(v);
}
