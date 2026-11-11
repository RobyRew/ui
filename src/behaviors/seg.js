/* Segmented controls (.rw-seg).
 *
 * Every .rw-seg with a .rw-seg__thumb gets --n and --i kept in step with its
 * markup: the selected segment is whichever carries aria-selected="true",
 * aria-checked="true" or .is-active, watched with a MutationObserver. A page
 * (or a framework) only flips the aria state and the thumb slides.
 *
 * data-rw-seg="select" also makes the control manage its own selection:
 * click or arrow keys select, focus roves (one tab stop), and for
 * role="tablist" each tab's aria-controls panel is shown and the rest hidden.
 * It dispatches `rw:change` with { index, value } on the control.
 */
import { enablePressStates, registry } from './core.js';

const claim = registry();
const SELECTED = '[aria-selected="true"], [aria-checked="true"], .is-active';

const itemsOf = (seg) => [...seg.querySelectorAll(':scope > .rw-seg__item')];

function sync(seg) {
  const thumb = seg.querySelector(':scope > .rw-seg__thumb');
  if (!thumb) return;
  const items = itemsOf(seg);
  const i = items.findIndex((it) => it.matches(SELECTED));
  seg.style.setProperty('--n', String(Math.max(1, items.length)));
  if (i >= 0) seg.style.setProperty('--i', String(i));
  /** @type {HTMLElement} */ (thumb).style.opacity = i < 0 ? '0' : '';
}

function select(seg, item, focus = false) {
  const items = itemsOf(seg);
  const role = seg.getAttribute('role');
  for (const it of items) {
    const on = it === item;
    if (role === 'tablist' || it.getAttribute('role') === 'tab') it.setAttribute('aria-selected', String(on));
    else if (role === 'radiogroup' || it.getAttribute('role') === 'radio') it.setAttribute('aria-checked', String(on));
    else if (it.hasAttribute('aria-pressed')) it.setAttribute('aria-pressed', String(on));
    it.classList.toggle('is-active', on);
    it.tabIndex = on ? 0 : -1;
    const panelId = it.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (panel && role === 'tablist') panel.hidden = !on;
  }
  if (focus) /** @type {HTMLElement} */ (item).focus();
  sync(seg);
  seg.dispatchEvent(new CustomEvent('rw:change', {
    bubbles: true,
    detail: { index: items.indexOf(item), item, value: item.getAttribute('data-value') ?? item.getAttribute('value') ?? item.textContent?.trim() },
  }));
}

function bindSeg(seg) {
  if (!claim(seg)) return;
  sync(seg);
  new MutationObserver(() => sync(seg)).observe(seg, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-selected', 'aria-checked', 'class'],
    childList: true,
  });

  if (seg.getAttribute('data-rw-seg') !== 'select') return;
  const items = itemsOf(seg);
  const current = items.find((it) => it.matches(SELECTED)) ?? items[0];
  for (const it of items) it.tabIndex = it === current ? 0 : -1;

  seg.addEventListener('click', (e) => {
    const item = e.target instanceof Element ? e.target.closest('.rw-seg__item') : null;
    if (item && seg.contains(item) && !item.matches(':disabled, [aria-disabled="true"]')) select(seg, item);
  });
  seg.addEventListener('keydown', (e) => {
    const list = itemsOf(seg).filter((it) => !it.matches(':disabled, [aria-disabled="true"]'));
    const at = list.indexOf(/** @type {Element} */ (document.activeElement));
    if (at < 0) return;
    const rtl = getComputedStyle(seg).direction === 'rtl';
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
    let next = null;
    if (step) next = list[(at + step + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    if (next) { e.preventDefault(); select(seg, next, true); }
  });
}

export function initSegments(root = document) {
  enablePressStates();
  for (const seg of root.querySelectorAll('.rw-seg')) bindSeg(seg);
}
