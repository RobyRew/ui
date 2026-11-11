/* .rw-range: keeps --rw-pct (the filled part of the track) in step with the
 * value. WebKit has no styleable progress part on a range input, so the fill
 * is a gradient that reads this property. Call syncRange(el) after setting
 * .value from script — a programmatic change fires no input event. */
import { registry } from './core.js';

const claim = registry();

export function syncRange(input) {
  const min = input.min === '' ? 0 : Number(input.min);
  const max = input.max === '' ? 100 : Number(input.max);
  const v = Number(input.value);
  const pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
  input.style.setProperty('--rw-pct', `${Math.min(100, Math.max(0, pct))}%`);
}

export function initRanges(root = document) {
  for (const input of root.querySelectorAll('input[type="range"].rw-range')) {
    if (!claim(input)) continue;
    syncRange(input);
    input.addEventListener('input', () => syncRange(input));
  }
}
