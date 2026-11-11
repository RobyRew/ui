/* GlassToast: dismiss, auto-dismiss, swipe away, and toast() for raising one
 * from script.
 *
 *     import { toast } from '@robyrew/ui/behaviors.js';
 *     toast({ title: 'Saved.', detail: 'notes.md', tone: 'ok' });
 *
 * toast() builds the same markup GlassToast renders, so both look identical,
 * and puts it in a .rw-toaster region (created on first use; one per
 * placement). The region is a polite live region; an error toast carries
 * role="alert" so it is announced at once. Text is set with textContent —
 * nothing passed in is parsed as HTML.
 *
 * Timers pause while the pointer or focus is on the toast and while the page
 * is hidden, so a toast never runs out while someone is reading it.
 */
import { dragAxis, enablePressStates, playOut, reducedMotion, registry } from './core.js';

const claim = registry();
const timers = new WeakMap();
const GLYPH = { ok: '✓', warn: '⚠', error: '✕', info: 'ⓘ' };

function startTimer(el) {
  const ms = Number(el.dataset.rwTimeout);
  if (!ms || el.dataset.rwLeaving) return;
  const t = timers.get(el) ?? { left: ms, at: 0, id: 0 };
  clearTimeout(t.id);
  t.at = Date.now();
  t.id = setTimeout(() => dismissToast(el), t.left);
  timers.set(el, t);
}
function pauseTimer(el) {
  const t = timers.get(el);
  if (!t || !t.id) return;
  clearTimeout(t.id);
  t.id = 0;
  t.left = Math.max(800, t.left - (Date.now() - t.at));
}

/** Plays the exit animation, closes the gap the toast leaves, removes it. */
export async function dismissToast(el) {
  if (!el || el.dataset.rwLeaving) return;
  el.dataset.rwLeaving = '1';
  pauseTimer(el);
  el.dispatchEvent(new CustomEvent('rw:dismiss', { bubbles: true }));
  await playOut(el, 'is-leaving', 420);
  if (el.parentElement?.classList.contains('rw-toaster') && !reducedMotion() && el.animate) {
    const h = el.getBoundingClientRect().height;
    await el
      .animate([{ height: `${h}px`, marginBlock: '0px' }, { height: '0px', marginBlock: '-4px' }], { duration: 200, easing: 'ease-out' })
      .finished.catch(() => {});
  }
  el.remove();
}

function bindToast(el) {
  if (!claim(el)) return;
  el.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('[data-rw-dismiss]')) dismissToast(el);
  });
  el.addEventListener('pointerenter', () => pauseTimer(el));
  el.addEventListener('pointerleave', () => { if (!el.contains(document.activeElement)) startTimer(el); });
  el.addEventListener('focusin', () => pauseTimer(el));
  el.addEventListener('focusout', (e) => { if (!el.contains(/** @type {Node} */ (e.relatedTarget))) startTimer(el); });

  // Sideways swipe on touch and pen. A mouse drag would fight text selection.
  if (el.dataset.rwDismissible !== 'false') {
    let width = 0;
    dragAxis(el, {
      axis: 'x',
      onStart: (e) => {
        if (e.pointerType === 'mouse') return false;
        width = el.getBoundingClientRect().width;
        el.classList.add('is-dragging');
        return true;
      },
      onMove: (dx) => {
        el.style.setProperty('--rw-drag-x', `${dx}px`);
        el.style.setProperty('--rw-drag-fade', String(Math.max(0, 1 - Math.abs(dx) / (width * 0.9))));
      },
      onEnd: (dx, v) => {
        el.classList.remove('is-dragging');
        if (Math.abs(dx) > width * 0.35 || (Math.abs(v) > 0.5 && Math.abs(dx) > 20)) {
          el.style.setProperty('--rw-drag-x', `${Math.sign(dx || v) * width}px`);
          el.style.setProperty('--rw-drag-fade', '0');
          dismissToast(el);
        } else {
          el.style.removeProperty('--rw-drag-x');
          el.style.removeProperty('--rw-drag-fade');
        }
      },
    });
  }
  startTimer(el);
}

let visibilityBound = false;
function bindVisibility() {
  if (visibilityBound) return;
  visibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    for (const el of document.querySelectorAll('[data-rw-toast][data-rw-timeout]')) {
      if (document.hidden) pauseTimer(el);
      else startTimer(el);
    }
  });
}

/** The live region for a placement, created on first use. */
function region(placement, label) {
  let r = document.querySelector(`.rw-toaster[data-placement="${placement}"]`);
  let created = false;
  if (!r) {
    r = document.createElement('section');
    r.className = `rw-toaster rw-toaster--${placement}`;
    r.dataset.placement = placement;
    r.setAttribute('aria-live', 'polite');
    r.setAttribute('aria-label', label);
    document.body.append(r);
    created = true;
  }
  return { r, created };
}

/**
 * @param {{ title: string, detail?: string, tone?: 'ok'|'warn'|'error'|'info',
 *   action?: { label: string, href?: string, onClick?: (e: MouseEvent) => void },
 *   timeout?: number, dismissible?: boolean, placement?: 'top'|'bottom',
 *   labels?: { dismiss?: string, region?: string } }} opts
 */
export function toast(opts) {
  const { title, detail, tone = 'ok', action, timeout = 5000, dismissible = true, placement = 'top', labels = {} } = opts;
  enablePressStates();
  bindVisibility();

  const el = document.createElement('div');
  el.className = `rw-toast rw-glass rw-toast--${tone}`;
  el.dataset.rwToast = '';
  if (tone === 'error') el.setAttribute('role', 'alert');
  if (timeout > 0) el.dataset.rwTimeout = String(timeout);
  if (!dismissible) el.dataset.rwDismissible = 'false';

  const icon = document.createElement('span');
  icon.className = `rw-toast__icon ${tone} rw-gl`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = GLYPH[tone] ?? GLYPH.ok;

  const msg = document.createElement('p');
  msg.className = 'rw-toast__msg';
  const b = document.createElement('b');
  b.textContent = title;
  msg.append(b);
  if (detail) {
    const s = document.createElement('span');
    s.textContent = ` ${detail}`;
    msg.append(s);
  }

  const act = document.createElement('span');
  act.className = 'rw-toast__act';
  if (action) {
    const a = document.createElement(action.href ? 'a' : 'button');
    a.textContent = action.label;
    if (action.href) /** @type {HTMLAnchorElement} */ (a).href = action.href;
    else /** @type {HTMLButtonElement} */ (a).type = 'button';
    if (action.onClick) a.addEventListener('click', (e) => { action.onClick?.(/** @type {MouseEvent} */ (e)); dismissToast(el); });
    act.append(a);
  }
  if (dismissible) {
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'rw-gl';
    x.dataset.rwDismiss = '';
    x.setAttribute('aria-label', labels.dismiss ?? 'Dismiss');
    x.textContent = '✕';
    act.append(x);
  }
  el.append(icon, msg, act);

  const { r, created } = region(placement, labels.region ?? 'Notifications');
  const insert = () => { r.append(el); bindToast(el); };
  // A live region has to exist before content lands in it to be announced.
  if (created) setTimeout(insert, 120);
  else insert();
  return { el, dismiss: () => dismissToast(el) };
}

export function initToasts(root = document) {
  enablePressStates();
  bindVisibility();
  for (const el of root.querySelectorAll('[data-rw-toast]')) bindToast(el);
}
