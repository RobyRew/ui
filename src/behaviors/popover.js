/* Popover and Menu: an opaque <dialog class="rw-pop">.
 *
 * Opened by a trigger — <button commandfor="id" command="show-modal"> — or by
 * openPopover(id, { anchor }). On a wide screen it hangs from the trigger,
 * end-aligned under it (above it when there is no room below) and follows it
 * through scroll and resize. Under 40rem it is a bottom sheet with a grab
 * handle that can be dragged down; the CSS decides which, and publishes
 * --rw-pop-sheet so this script agrees with it. It is a modal dialog, so it
 * lives in the top layer (no pane's overflow clips it), keeps focus inside,
 * and closes on Escape, a click outside, its close button, or a choice.
 *
 * Opaque on purpose: in WebKit a top-layer dialog with a backdrop-filter
 * showed the page's text through it unblurred (chat-converter, 2026-11-09),
 * and a menu is content to act on rather than a chrome layer.
 *
 * Without this script, a browser with invoker commands still opens it (a
 * centred panel when wide, a sheet when narrow) and its close button is a
 * <form method="dialog">. The script adds the anchoring, a menu's keyboard
 * model, aria-expanded on the trigger, exit animations, drag-to-dismiss, and
 * focus returning to the trigger.
 *
 * Menus (role="menu" inside): arrow keys, Home/End and type-ahead move between
 * items. Opened from the keyboard, focus lands on the first item; opened by a
 * pointer, on the menu itself, with no ring until the keyboard is used.
 * Choosing an item dispatches `rw:select` on the dialog — detail
 * { row, value }, cancelable: preventDefault keeps the menu open — then closes
 * it; a link item navigates as any link does. menuitemradio and
 * menuitemcheckbox items flip aria-checked first.
 */
import { bindModal, closeDialog, dragAxis, enablePressStates, registry, reducedMotion } from './core.js';

const claim = registry();
const anchors = new WeakMap();
const points = new WeakMap();
const followers = new WeakMap();

const ITEM = '.rw-menu__item';
const ENABLED = `${ITEM}:not(:disabled):not([aria-disabled="true"])`;
const EDGE = 8;
const GAP = 6;

const resolve = (t) => (typeof t === 'string' ? document.getElementById(t) : t);
const isSheet = (d) => getComputedStyle(d).getPropertyValue('--rw-pop-sheet').trim() === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function triggersOf(dialog) {
  const out = new Set();
  const a = anchors.get(dialog);
  if (a) out.add(a);
  if (dialog.id) for (const t of document.querySelectorAll(`[commandfor="${CSS.escape(dialog.id)}"]`)) out.add(t);
  return out;
}
function setExpanded(dialog, open) {
  for (const t of triggersOf(dialog)) if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', String(open));
}

/** Puts an anchored popover under (or over) its anchor, or at a point, inside
 *  the viewport. A sheet, or a popover with neither, is left to the CSS. */
function place(dialog) {
  const anchor = anchors.get(dialog);
  const at = points.get(dialog);
  if (isSheet(dialog) || (!anchor && !at)) {
    dialog.classList.remove('is-anchored');
    return;
  }
  dialog.classList.add('is-anchored');
  const w = dialog.offsetWidth;
  const h = dialog.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  let left;
  let top;
  let above = false;
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    const rtl = getComputedStyle(anchor).direction === 'rtl';
    const fromLeft = (dialog.dataset.align === 'start') !== rtl;
    left = fromLeft ? r.left : r.right - w;
    above = r.bottom + GAP + h > vh - EDGE && r.top - GAP - h >= EDGE;
    top = above ? r.top - GAP - h : r.bottom + GAP;
  } else {
    left = at.x;
    above = at.y + h > vh - EDGE;
    top = above ? at.y - h : at.y;
  }
  dialog.style.setProperty('--rw-pop-left', `${Math.round(clamp(left, EDGE, vw - w - EDGE))}px`);
  dialog.style.setProperty('--rw-pop-top', `${Math.round(clamp(top, EDGE, vh - h - EDGE))}px`);
  dialog.dataset.side = above ? 'top' : 'bottom';
}

function follow(dialog) {
  if (followers.has(dialog)) return;
  let frame = 0;
  const on = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (dialog.open) place(dialog);
    });
  };
  addEventListener('resize', on, { passive: true });
  addEventListener('scroll', on, { passive: true, capture: true });
  followers.set(dialog, () => {
    removeEventListener('resize', on);
    removeEventListener('scroll', on, { capture: true });
    cancelAnimationFrame(frame);
    followers.delete(dialog);
  });
}

/**
 * Opens a popover or menu. `anchor` hangs it from an element, `at` puts it at
 * a point (a context menu); `keyboard` moves focus to the first menu item.
 * @param {string | HTMLDialogElement} target
 * @param {{ anchor?: Element, at?: { x: number, y: number }, keyboard?: boolean }} [opts]
 */
export function openPopover(target, { anchor, at, keyboard = false } = {}) {
  const dialog = resolve(target);
  if (!(dialog instanceof HTMLDialogElement)) return null;
  bindPop(dialog);
  if (anchor) anchors.set(dialog, anchor);
  else anchors.delete(dialog);
  if (at) points.set(dialog, at);
  else points.delete(dialog);
  dialog.classList.remove('is-closing');
  if (!dialog.open) dialog.showModal();
  else if (!dialog.matches(':modal')) { dialog.close(); dialog.showModal(); }
  place(dialog);
  follow(dialog);
  setExpanded(dialog, true);
  const first = keyboard ? dialog.querySelector(ENABLED) : null;
  const focus = first ?? dialog.querySelector('[data-autofocus]') ?? dialog.querySelector('.rw-pop__inner');
  if (focus instanceof HTMLElement) focus.focus({ preventScroll: true });
  return dialog;
}

/** Closes it through its exit animation. */
export function closePopover(target, value) {
  const dialog = resolve(target);
  if (!(dialog instanceof HTMLDialogElement)) return Promise.resolve();
  return closeDialog(dialog, value);
}

/* ── Menus ─────────────────────────────────────────────────────── */

const labelOf = (item) => (item.querySelector('.rw-menu__label')?.firstChild?.textContent ?? item.textContent ?? '').trim();

function choose(dialog, item, e) {
  if (item.matches(':disabled, [aria-disabled="true"]')) {
    e.preventDefault();
    return;
  }
  const role = item.getAttribute('role');
  if (role === 'menuitemcheckbox') {
    item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
  } else if (role === 'menuitemradio') {
    const group = item.closest('[role="group"]') ?? item.closest('[role="menu"]');
    for (const r of group?.querySelectorAll('[role="menuitemradio"]') ?? []) {
      if (r.closest('[role="group"]') === item.closest('[role="group"]')) r.setAttribute('aria-checked', String(r === item));
    }
  }
  const ev = new CustomEvent('rw:select', {
    bubbles: true,
    cancelable: true,
    detail: { row: item, value: item.getAttribute('data-value') ?? item.getAttribute('value') ?? labelOf(item) },
  });
  dialog.dispatchEvent(ev);
  if (!ev.defaultPrevented) closePopover(dialog, item.getAttribute('data-value') ?? '');
}

function bindMenuKeys(dialog) {
  let typed = '';
  let typedAt = 0;
  dialog.addEventListener('keydown', (e) => {
    if (!dialog.querySelector('[role="menu"]') || e.altKey || e.ctrlKey || e.metaKey) return;
    const items = [...dialog.querySelectorAll(ENABLED)];
    if (!items.length) return;
    const at = items.indexOf(/** @type {Element} */ (document.activeElement));
    let next = null;
    if (e.key === 'ArrowDown') next = items[at < 0 ? 0 : (at + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[at < 0 ? items.length - 1 : (at - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key.length === 1 && e.key !== ' ' && !e.isComposing) {
      // Type-ahead: letters typed within half a second build one prefix.
      typed = e.timeStamp - typedAt < 500 ? typed + e.key.toLocaleLowerCase() : e.key.toLocaleLowerCase();
      typedAt = e.timeStamp;
      const order = [...items.slice(at + 1), ...items.slice(0, at + 1)];
      next = order.find((it) => labelOf(it).toLocaleLowerCase().startsWith(typed)) ?? null;
    }
    if (next) {
      e.preventDefault();
      /** @type {HTMLElement} */ (next).focus();
    }
  });
}

/* ── Binding ───────────────────────────────────────────────────── */

function bindPop(dialog) {
  if (!claim(dialog)) return;
  const dismissible = dialog.dataset.rwDismissible !== 'false';
  bindModal(dialog, { dismissible });
  bindMenuKeys(dialog);

  dialog.addEventListener('click', (e) => {
    const item = e.target instanceof Element ? e.target.closest(ITEM) : null;
    if (item && dialog.contains(item)) choose(dialog, item, e);
  });

  dialog.addEventListener('close', () => {
    followers.get(dialog)?.();
    setExpanded(dialog, false);
    dialog.classList.remove('is-anchored', 'is-dragging');
    dialog.style.removeProperty('--rw-drag');
    // Focus goes back to the trigger. Safari does not focus a button on
    // click, so the dialog's own restore would land on <body>.
    const a = anchors.get(dialog);
    const active = document.activeElement;
    if (a instanceof HTMLElement && a.isConnected && (!active || active === document.body || dialog.contains(active))) {
      a.focus({ preventScroll: true });
    }
  });

  const zone = dialog.querySelector('[data-rw-pop-drag]');
  if (!zone || !dismissible) return;
  let height = 0;
  dragAxis(zone, {
    axis: 'y',
    onStart: () => {
      if (!isSheet(dialog) || dialog.classList.contains('is-closing')) return false;
      height = dialog.getBoundingClientRect().height;
      dialog.classList.add('is-dragging');
      return true;
    },
    onMove: (dy) => {
      dialog.style.setProperty('--rw-drag', `${dy > 0 ? dy : -Math.sqrt(-dy) * 2}px`);
    },
    onEnd: (dy, v) => {
      dialog.classList.remove('is-dragging');
      if (dy > height * 0.3 || (v > 0.55 && dy > 24)) closePopover(dialog, 'cancel');
      else {
        dialog.style.setProperty('--rw-drag', '0px');
        if (reducedMotion()) dialog.style.removeProperty('--rw-drag');
      }
    },
  });
}

/* Triggers. One capturing listener for the whole document: it runs before the
 * browser's own invoker command (cancelling it) and before core.js's
 * fallback, so every trigger opens the same way and records its anchor. A
 * click from the keyboard (Enter or Space) has detail 0. */
let triggersBound = false;
function bindTriggers() {
  if (triggersBound) return;
  triggersBound = true;
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('button[commandfor]') : null;
    if (!(btn instanceof HTMLButtonElement) || btn.disabled) return;
    const dialog = document.getElementById(btn.getAttribute('commandfor') || '');
    if (!(dialog instanceof HTMLDialogElement) || !dialog.classList.contains('rw-pop')) return;
    e.preventDefault();
    const cmd = (btn.getAttribute('command') || '').toLowerCase();
    if (cmd === 'close' || cmd === 'request-close' || cmd === 'hide-popover') closePopover(dialog, btn.value);
    else openPopover(dialog, { anchor: btn, keyboard: e.detail === 0 });
  }, true);
}

export function initPopovers(root = document) {
  if (typeof document === 'undefined') return;
  enablePressStates();
  bindTriggers();
  for (const d of root.querySelectorAll('dialog.rw-pop')) bindPop(d);
}
