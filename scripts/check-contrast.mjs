#!/usr/bin/env node
/* Contrast check for src/tokens.css.
 *
 *     node scripts/check-contrast.mjs        # or: npm run check
 *
 * Reads the dark block and both light blocks out of tokens.css, composites the
 * translucent values the way a browser does (sRGB, over the surface below), and
 * prints the WCAG 2 contrast ratio of every text pair the controls and the glass
 * formats put on screen. Text needs 4.5:1 (AA, normal size); focus rings need
 * 3:1 (non-text). Hairlines and tracks are printed for information only.
 *
 * Glass is checked over its own theme's ground and panel — what sits behind a
 * floating bar on a normal page. Over photographs the backdrop is unbounded;
 * that is what .rw-glass--dense is for.
 *
 * Exits 1 when a required pair fails or when the two light blocks differ.
 * No dependencies.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../src/tokens.css', import.meta.url));
const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/* ── Parsing ─────────────────────────────────────────────────────── */

function blockAfter(source, opener) {
  const at = source.indexOf(opener);
  if (at < 0) throw new Error(`tokens.css: no block starting with ${opener}`);
  let i = source.indexOf('{', at) + 1, depth = 1;
  const start = i;
  for (; i < source.length && depth; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') depth--;
  }
  return source.slice(start, i - 1);
}

function declarations(block) {
  const out = new Map();
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  return out;
}

const dark = declarations(blockAfter(css, ':root,\n[data-theme="dark"]'));
const lightMedia = declarations(blockAfter(blockAfter(css, '@media (prefers-color-scheme: light)'), ':root:not([data-theme="dark"])'));
const lightStamp = declarations(blockAfter(css, '\n[data-theme="light"]'));

/* ── Colour maths ────────────────────────────────────────────────── */

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function parseColor(value) {
  const v = value.trim();
  let m;
  if ((m = v.match(/^#([0-9a-f]{3})$/i))) return { r: parseInt(m[1][0].repeat(2), 16), g: parseInt(m[1][1].repeat(2), 16), b: parseInt(m[1][2].repeat(2), 16), a: 1 };
  if ((m = v.match(/^#([0-9a-f]{6})$/i))) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  if ((m = v.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/i))) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  if ((m = v.match(/^([\d.]+)\s+([\d.]+)\s+([\d.]+)$/))) return { r: +m[1], g: +m[2], b: +m[3], a: 1 };
  throw new Error(`cannot parse colour: ${value}`);
}

/** fg (possibly translucent) composited over an opaque bg, in sRGB as browsers do. */
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const withAlpha = (c, a) => ({ ...c, a });

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const unlin = (l) => 255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055);
const luminance = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

function toOklab(c) {
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: clamp(unlin(r), 0, 255), g: clamp(unlin(g), 0, 255), b: clamp(unlin(b), 0, 255), a: 1 };
}
/** color-mix(in oklab, a p, b) */
const mixOklab = (a, b, p) => { const x = toOklab(a), y = toOklab(b); return fromOklab(x.map((v, i) => v * p + y[i] * (1 - p))); };

const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/* ── Checks ──────────────────────────────────────────────────────── */

function check(name, t) {
  const c = (k) => { if (!t.has(k)) throw new Error(`${name}: missing ${k}`); return parseColor(t.get(k)); };
  const n = (k) => parseFloat(t.get(k));

  const ground = c('--ground'), ground2 = c('--ground-2'), panel = c('--panel');
  const glass = c('--glass-rgb'), alpha = n('--t-alpha'), dense = n('--t-alpha-dense');
  const glassOn = (bg, a = alpha) => over(withAlpha(glass, a), bg);
  const gGround = glassOn(ground), gPanel = glassOn(panel), gDense = glassOn(ground, dense);
  const field = over(c('--rw-fill'), panel);
  const well = over(c('--rw-well'), panel);
  const thumb = over(c('--rw-thumb'), well);
  const accent = c('--accent'), ink = c('--ink');
  const accentHover = mixOklab(accent, ink, 0.88);

  const rows = [];
  const text = (label, fg, bg) => rows.push({ label, fg, bg, need: 4.5 });
  const ui = (label, fg, bg) => rows.push({ label, fg, bg, need: 3 });
  const info = (label, fg, bg) => rows.push({ label, fg, bg, need: 0 });

  for (const [k, label] of [['--ink', 'ink'], ['--ink-2', 'ink-2'], ['--ink-3', 'ink-3']]) {
    text(`${label} on ground`, c(k), ground);
    text(`${label} on ground-2`, c(k), ground2);
    text(`${label} on panel`, c(k), panel);
  }
  text('ink-3 on a field (placeholder)', c('--ink-3'), field);
  text('ink-2 on the segment well', c('--ink-2'), well);
  text('ink on the segment thumb', ink, thumb);
  text('accent on ground (link)', accent, ground);
  text('accent on ground-2', accent, ground2);
  text('accent on panel', accent, panel);
  text('accent on accent-soft (plain hover)', accent, over(c('--accent-soft'), panel));
  text('on-accent on accent (primary)', c('--on-accent'), accent);
  text('on-accent on primary hover', c('--on-accent'), accentHover);
  for (const k of ['--rw-ok', '--rw-warn', '--rw-danger']) {
    text(`${k.slice(5)} on panel`, c(k), panel);
    text(`${k.slice(5)} on ground`, c(k), ground);
  }
  text('danger on its hover tint', c('--rw-danger'), over(withAlpha(c('--rw-danger'), 0.14), panel));

  for (const [k, label] of [['--g-ink', 'g-ink'], ['--g-ink-dim', 'g-ink-dim'], ['--g-ink-mute', 'g-ink-mute']]) {
    text(`${label} on glass over ground`, c(k), gGround);
    text(`${label} on glass over panel`, c(k), gPanel);
  }
  text('g-ink-mute on glass fill (field)', c('--g-ink-mute'), over(c('--g-fill'), gGround));
  text('g-ink on glass fill-2 (current)', c('--g-ink'), over(c('--g-fill-2'), gGround));
  text('g-ink-dim on dense glass', c('--g-ink-dim'), gDense);
  text('accent on glass (link)', accent, gGround);
  text('ok on glass (tile delta)', c('--rw-ok'), gGround);
  text('danger on glass (tile delta)', c('--rw-danger'), gGround);

  ui('focus ring (accent) vs ground', accent, ground);
  ui('focus ring (accent) vs panel', accent, panel);
  ui('focus ring (accent) vs glass', accent, gGround);

  info('hairline vs panel', c('--hair'), panel);
  info('switch track (off) vs panel', over(c('--rw-fill-3'), panel), panel);
  info('segment thumb vs well', thumb, well);
  info('glass over ground vs ground', gGround, ground);

  let failed = 0;
  console.log(`\n${name}`);
  for (const r of rows) {
    const v = ratio(r.fg, r.bg);
    const ok = v >= r.need;
    if (!ok) failed++;
    const tag = r.need === 0 ? 'info' : ok ? 'pass' : 'FAIL';
    const need = r.need === 0 ? '   ' : r.need.toFixed(1);
    console.log(`  ${tag}  ${v.toFixed(2).padStart(5)}:1  (≥${need})  ${r.label.padEnd(38)} ${hex(r.fg)} on ${hex(r.bg)}`);
  }
  return failed;
}

let failures = 0;

const drift = [];
for (const k of new Set([...lightMedia.keys(), ...lightStamp.keys()])) {
  if (lightMedia.get(k) !== lightStamp.get(k)) drift.push(`${k}: media=${lightMedia.get(k) ?? '∅'} stamp=${lightStamp.get(k) ?? '∅'}`);
}
if (drift.length) {
  console.log('The two light blocks differ:\n  ' + drift.join('\n  '));
  failures += drift.length;
}

failures += check('dark', dark);
failures += check('light', lightStamp);

console.log(failures ? `\n${failures} failing` : '\nAll required pairs pass.');
process.exit(failures ? 1 : 0);
