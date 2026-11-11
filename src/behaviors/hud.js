/* GlassHud as a transient overlay.
 *
 *     import { showHud } from '@robyrew/ui/behaviors.js';
 *     showHud('volume', { value: 62 });          // by id, or pass the element
 *
 * Updates the level, caption and glyph, shows the HUD (.is-shown) and hides it
 * again after `timeout` ms of quiet; another call inside that window restarts
 * the clock, so holding a volume key keeps it up. The HUD is a polite status
 * region, so the new value is announced.
 */
const timers = new WeakMap();

export function showHud(target, { value, caption, glyph, timeout = 1400 } = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  if (typeof value === 'number') {
    const pct = Math.min(100, Math.max(0, value));
    const fill = el.querySelector('.rw-hud__fill');
    if (fill instanceof HTMLElement) fill.style.setProperty('--rw-pct', `${pct}%`);
    el.querySelector('.rw-hud__track')?.setAttribute('aria-valuenow', String(Math.round(pct)));
  }
  if (caption != null) {
    const cap = el.querySelector('.rw-hud__cap');
    if (cap) cap.textContent = caption;
  }
  if (glyph != null) {
    const g = el.querySelector('.rw-hud__glyph');
    if (g) g.textContent = glyph;
  }
  el.classList.add('is-shown');
  clearTimeout(timers.get(el));
  if (timeout > 0) timers.set(el, setTimeout(() => el.classList.remove('is-shown'), timeout));
}

export function hideHud(target) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  clearTimeout(timers.get(el));
  el.classList.remove('is-shown');
}
