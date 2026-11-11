/* Shared plumbing for the behaviours. Plain ESM, no dependencies, safe to
 * import on the server (nothing touches the DOM at module load).
 *
 * Every behaviour is progressive: the markup works without it (links are
 * links, dialogs open from invoker buttons where the browser supports them,
 * forms post), and the script adds gestures, keyboard handling, timers and
 * exit animations. Binds are idempotent — running an init twice on the same
 * element does nothing the second time.
 *
 * No module runs anything on import. package.json declares the JS
 * side-effect-free, so a bundler is free to drop an import whose exports go
 * unused; each Astro component's script therefore calls its init explicitly:
 *     import { onReady } from '../behaviors/core.js';
 *     import { initSheets } from '../behaviors/sheet.js';
 *     onReady(initSheets);
 */

const hasDOM = () => typeof document !== 'undefined';

/** Runs fn(document) once the DOM is parsed, and again after every Astro
 *  client-side navigation (astro:page-load), so view transitions rebind. */
export function onReady(fn) {
  if (!hasDOM()) return;
  const run = () => fn(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  document.addEventListener('astro:page-load', run);
}

/** A per-feature registry: claim(el) is true the first time only. */
export function registry() {
  const seen = new WeakSet();
  return (el) => {
    if (seen.has(el)) return false;
    seen.add(el);
    return true;
  };
}

export const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let seq = 0;
/** A document-unique id with a readable prefix. */
export const uid = (prefix = 'rw') => `${prefix}-${(++seq).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** iOS Safari applies :active only when a touch listener exists somewhere on
 *  the page. One passive no-op listener turns the press states on. */
let pressReady = false;
export function enablePressStates() {
  if (pressReady || !hasDOM()) return;
  pressReady = true;
  document.addEventListener('touchstart', () => {}, { passive: true });
}

/** Adds `cls` and resolves when the element's animation ends — or after
 *  `timeout`, or on the next frame when no animation applies, so a caller
 *  awaiting it can never hang. */
export function playOut(el, cls, timeout = 600) {
  return new Promise((resolve) => {
    let done = false;
    let timer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      el.removeEventListener('animationend', onEnd);
      resolve();
    };
    const onEnd = (e) => { if (e.target === el) finish(); };
    el.addEventListener('animationend', onEnd);
    timer = setTimeout(finish, timeout);
    el.classList.add(cls);
    requestAnimationFrame(() => {
      const name = getComputedStyle(el).animationName;
      if (!name || name === 'none') finish();
    });
  });
}

/* ── Modal dialogs ──────────────────────────────────────────────── */

/** Closes a dialog after its exit animation (.is-closing in the CSS). */
export function closeDialog(dialog, value) {
  if (!dialog.open || dialog.classList.contains('is-closing')) return Promise.resolve();
  return playOut(dialog, 'is-closing', 520).then(() => {
    dialog.classList.remove('is-closing');
    dialog.style.removeProperty('--rw-drag');
    dialog.close(value);
  });
}

/** Opens a dialog as a modal. Accepts the element or its id. */
export function openDialog(target) {
  const dialog = typeof target === 'string' ? document.getElementById(target) : target;
  if (!(dialog instanceof HTMLDialogElement)) return null;
  dialog.classList.remove('is-closing');
  if (!dialog.open) dialog.showModal();
  else if (!dialog.matches(':modal')) { dialog.close(); dialog.showModal(); }
  return dialog;
}

/** Wires the closing paths of a modal dialog through its exit animation:
 *  Escape (cancel), <form method="dialog"> submits, and — when dismissible —
 *  a click on the backdrop. */
export function bindModal(dialog, { dismissible = true } = {}) {
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    if (dismissible) closeDialog(dialog, 'cancel');
  });
  dialog.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.method !== 'dialog' || form.closest('dialog') !== dialog) return;
    e.preventDefault();
    const s = e.submitter;
    closeDialog(dialog, s && 'value' in s ? s.value : '');
  });
  if (dismissible) {
    dialog.addEventListener('click', (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeDialog(dialog, 'cancel');
    });
  }
}

/* ── Invoker commands ───────────────────────────────────────────────
 * <button commandfor="id" command="show-modal"> opens a dialog with no script
 * where the browser implements invoker commands. Elsewhere this listener does
 * the same for show-modal, close, request-close and the popover commands.
 */
let commandsReady = false;
export function enableCommands() {
  if (commandsReady || !hasDOM()) return;
  commandsReady = true;
  if ('command' in HTMLButtonElement.prototype) return;
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('button[commandfor]') : null;
    if (!btn || btn.disabled) return;
    const target = document.getElementById(btn.getAttribute('commandfor') || '');
    if (!target) return;
    const cmd = (btn.getAttribute('command') || '').toLowerCase();
    if (target instanceof HTMLDialogElement) {
      if (cmd === 'show-modal') openDialog(target);
      else if (cmd === 'close' && target.open) target.close(btn.value);
      else if (cmd === 'request-close' && target.open) {
        if (typeof target.requestClose === 'function') target.requestClose(btn.value);
        else closeDialog(target, btn.value);
      }
    } else if ('popover' in target && typeof target.togglePopover === 'function') {
      if (cmd === 'toggle-popover') target.togglePopover();
      else if (cmd === 'show-popover') target.showPopover();
      else if (cmd === 'hide-popover') target.hidePopover();
    }
  });
}

/* ── Drag ───────────────────────────────────────────────────────────
 * One-axis pointer drag with velocity, used by the sheet (down to dismiss) and
 * the toast (sideways to dismiss). onMove gets the raw offset; onEnd gets the
 * offset and the release velocity in px/ms.
 */
export function dragAxis(zone, { axis = 'y', onStart, onMove, onEnd }) {
  let id = null, start = 0, last = 0, lastT = 0, v = 0;
  const pos = (e) => (axis === 'y' ? e.clientY : e.clientX);
  zone.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || id !== null) return;
    if (e.target instanceof Element && e.target.closest('a, button, input, select, textarea, [contenteditable]')) return;
    if (onStart && onStart(e) === false) return;
    id = e.pointerId;
    start = last = pos(e);
    lastT = e.timeStamp;
    v = 0;
    zone.setPointerCapture(id);
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const p = pos(e);
    const dt = e.timeStamp - lastT;
    if (dt > 0) v = 0.8 * ((p - last) / dt) + 0.2 * v;
    last = p;
    lastT = e.timeStamp;
    onMove(p - start, e);
  });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    onEnd(last - start, e.type === 'pointercancel' ? 0 : v);
  };
  zone.addEventListener('pointerup', end);
  zone.addEventListener('pointercancel', end);
}
