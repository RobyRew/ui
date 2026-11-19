/* Social: reactions, likes, and the comment composer.
 *
 * Reactions and likes update at once (optimistically) and announce the change
 * so the page can persist it:
 *
 *   rw:react  on the ReactionBar  detail { emoji, mine, count, previous }
 *   rw:like   on the LikeButton   detail { liked, count, previous }
 *
 * Both are cancelable, and preventDefault means "the page handles this". That
 * matters only when the bar or button sits in a <form> (the `action` prop):
 * the form posts natively unless a listener takes it over — so with no script
 * at all, or no listener, the server still gets the POST. Without a form the
 * update stays and the listener persists it. When the server disagrees (or a
 * request fails), setReaction() / setLike() put its numbers back.
 *
 * Composer: the field grows with its text (field-sizing where the browser has
 * it, a measured height elsewhere); ⌘↵ / Ctrl+↵ submits (data-rw-enter="send"
 * makes a plain Enter submit and Shift+Enter a new line); the submit button
 * stays disabled while the text is blank; a counter appears near maxlength;
 * a submit the page does not intercept shows the busy spinner.
 *
 * All delegated from document: comments appended later work as they are.
 */
import { enablePressStates, markJs, reducedMotion, registry } from './core.js';
import { closePopover } from './popover.js';
import { setBusy } from './auth.js';
import { formatCount } from './format.js';

export { formatCount };

const langOf = (el) => el.closest('[lang]')?.getAttribute('lang') || undefined;

const bump = (el, cls) => {
  if (reducedMotion()) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
};

/* ── Reactions ─────────────────────────────────────────────────── */

const pillOf = (bar, emoji) =>
  [...bar.querySelectorAll('.rw-reaction[data-emoji]')].find((b) => b.getAttribute('data-emoji') === emoji) ?? null;

/**
 * Sets one reaction's state: creates the pill, updates it, or removes it when
 * its count reaches 0. `bar` is the ReactionBar element ([data-rw-react]).
 * @param {Element} bar @param {string} emoji
 * @param {{ count: number, mine?: boolean, animate?: boolean }} state
 */
export function setReaction(bar, emoji, { count, mine = false, animate = false }) {
  const list = bar.querySelector('.rw-reactions');
  if (!list) return;
  let pill = pillOf(bar, emoji);
  if (count <= 0) {
    pill?.remove();
    return;
  }
  if (!pill) {
    pill = document.createElement('button');
    /** @type {HTMLButtonElement} */ (pill).type = bar instanceof HTMLFormElement ? 'submit' : 'button';
    pill.setAttribute('name', bar.getAttribute('data-name') || 'emoji');
    pill.setAttribute('value', emoji);
    pill.className = 'rw-reaction';
    pill.setAttribute('data-emoji', emoji);
    const e = document.createElement('span');
    e.className = 'rw-reaction__emoji';
    e.textContent = emoji;
    const c = document.createElement('span');
    c.className = 'rw-reaction__count';
    pill.append(e, c);
    list.insertBefore(pill, list.querySelector('.rw-reaction--add'));
  }
  pill.setAttribute('aria-pressed', String(!!mine));
  pill.setAttribute('data-count', String(count));
  const c = pill.querySelector('.rw-reaction__count');
  if (c) c.textContent = formatCount(count, langOf(bar));
  if (animate) bump(pill, 'is-bump');
}

function react(e, btn) {
  const bar = btn.closest('[data-rw-react]');
  const emoji = btn.getAttribute('data-emoji');
  if (!bar || !emoji || bar.hasAttribute('data-readonly')) return;
  const pill = pillOf(bar, emoji);
  const previous = { mine: pill?.getAttribute('aria-pressed') === 'true', count: Number(pill?.getAttribute('data-count') ?? 0) };
  const mine = !previous.mine;
  const count = Math.max(0, previous.count + (mine ? 1 : -1));
  const ev = new CustomEvent('rw:react', { bubbles: true, cancelable: true, detail: { emoji, mine, count, previous } });
  bar.dispatchEvent(ev);
  const posts = bar instanceof HTMLFormElement && /** @type {HTMLButtonElement} */ (btn).type === 'submit';
  if (!posts || ev.defaultPrevented) e.preventDefault();
  setReaction(bar, emoji, { count, mine, animate: true });
  const picker = btn.closest('dialog.rw-pop');
  if (picker && !(posts && !ev.defaultPrevented)) closePopover(picker);
}

/* ── Likes ─────────────────────────────────────────────────────── */

/** Sets a LikeButton's state. @param {Element} btn @param {{ liked: boolean, count: number, animate?: boolean }} state */
export function setLike(btn, { liked, count, animate = false }) {
  btn.setAttribute('aria-pressed', String(liked));
  btn.setAttribute('data-count', String(Math.max(0, count)));
  // The value a native POST sends is the state a press asks for next.
  if (btn.hasAttribute('value')) btn.setAttribute('value', liked ? '0' : '1');
  const c = btn.querySelector('.rw-like__count');
  if (c) c.textContent = formatCount(count, langOf(btn));
  if (animate && liked) bump(btn, 'is-popping');
}

function like(e, btn) {
  const previous = { liked: btn.getAttribute('aria-pressed') === 'true', count: Number(btn.getAttribute('data-count') ?? 0) };
  const liked = !previous.liked;
  const count = Math.max(0, previous.count + (liked ? 1 : -1));
  const ev = new CustomEvent('rw:like', { bubbles: true, cancelable: true, detail: { liked, count, previous } });
  btn.dispatchEvent(ev);
  const posts = btn instanceof HTMLButtonElement && btn.type === 'submit' && !!btn.form;
  if (!posts || ev.defaultPrevented) e.preventDefault();
  setLike(btn, { liked, count, animate: true });
}

/* ── Composer ──────────────────────────────────────────────────── */

const claimComposer = registry();
const sizes = typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content');

function syncComposer(form) {
  const field = form.querySelector('.rw-composer__field');
  if (!(field instanceof HTMLTextAreaElement)) return;
  if (!sizes) {
    field.style.height = 'auto';
    const max = parseFloat(getComputedStyle(field).maxHeight) || 256;
    field.style.height = `${Math.min(field.scrollHeight + 2, max)}px`;
  }
  const submit = form.querySelector('.rw-composer__submit');
  if (submit instanceof HTMLButtonElement && !form.hasAttribute('data-rw-allow-empty')) submit.disabled = !field.value.trim();
  const counter = form.querySelector('.rw-composer__count');
  const max = Number(field.getAttribute('maxlength')) || 0;
  if (counter && max) {
    const len = field.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.setAttribute('data-state', len >= max ? 'over' : len >= max * 0.8 ? 'near' : 'idle');
  }
}

function bindComposer(form) {
  if (!claimComposer(form)) return;
  form.addEventListener('input', () => syncComposer(form));
  form.addEventListener('reset', () => setTimeout(() => syncComposer(form)));
  form.addEventListener('keydown', (e) => {
    const field = e.target;
    if (e.key !== 'Enter' || e.isComposing || !(field instanceof HTMLTextAreaElement) || !field.classList.contains('rw-composer__field')) return;
    const send = form.getAttribute('data-rw-enter') === 'send' ? !e.shiftKey && !e.altKey : e.metaKey || e.ctrlKey;
    if (!send) return;
    e.preventDefault();
    if (field.value.trim()) form.requestSubmit();
  });
  form.addEventListener('submit', (e) => {
    // Read defaultPrevented after every other submit listener has run.
    setTimeout(() => { if (!e.defaultPrevented && form.checkValidity() && form.method !== 'dialog') setBusy(form, true); });
  });
  addEventListener('pageshow', (e) => { if (e.persisted) setBusy(form, false); });
  syncComposer(form);
}

/* ── Init ──────────────────────────────────────────────────────── */

let bound = false;
export function initSocial(root = document) {
  if (typeof document === 'undefined') return;
  markJs();
  enablePressStates();
  for (const form of root.querySelectorAll('form.rw-composer')) bindComposer(form);
  if (bound) return;
  bound = true;
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const r = t?.closest('.rw-reaction[data-emoji], .rw-quick__btn[data-emoji]');
    if (r instanceof HTMLButtonElement && !r.disabled) { react(e, r); return; }
    const l = t?.closest('[data-rw-like]');
    if (l instanceof HTMLButtonElement && !l.disabled) like(e, l);
  });
  // A composer that arrives later (a reply form opened on demand) binds on
  // first focus.
  document.addEventListener('focusin', (e) => {
    const form = e.target instanceof Element ? e.target.closest('form.rw-composer') : null;
    if (form) bindComposer(form);
  });
}
