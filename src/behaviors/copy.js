/* Copy: CopyField's button, and any [data-rw-copy] button.
 *
 *   <button data-rw-copy>                           copies its .rw-copy field
 *   <button data-rw-copy data-rw-copy-value="…">   copies that value
 *
 * The value is the field's data-rw-copy-value when it has one (a truncated
 * display), else the text of its .rw-copy__value. On success the field gets
 * .is-copied for two seconds (the label reads data-done, "Copied"), a polite
 * live region says so, and `rw:copy` (detail { value }) bubbles from the
 * button. Where the clipboard is refused, the value is selected instead so
 * ⌘C / Ctrl+C finishes the job.
 *
 * Script-only, so the button is hidden until .js is on <html>; the value is
 * user-select: all, one click selects all of it.
 */
import { markJs } from './core.js';

let region = null;
function announce(text) {
  if (!region || !region.isConnected) {
    region = document.createElement('div');
    region.className = 'rw-sr-only';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  region.textContent = '';
  setTimeout(() => { if (region) region.textContent = text; }, 60);
}

/** Writes text to the clipboard; resolves false where that is refused. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.className = 'rw-sr-only';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

const timers = new WeakMap();

async function copy(btn) {
  const field = btn.closest('.rw-copy');
  const valueEl = field?.querySelector('.rw-copy__value');
  const value = btn.getAttribute('data-rw-copy-value') ?? field?.getAttribute('data-rw-copy-value') ?? valueEl?.textContent?.trim() ?? '';
  if (!value) return;
  const host = field ?? btn;
  const label = btn.querySelector('.rw-copy__text');
  if (await copyText(value)) {
    host.classList.add('is-copied');
    if (label) label.textContent = label.getAttribute('data-done') || 'Copied';
    announce(btn.getAttribute('data-announce') || label?.getAttribute('data-done') || 'Copied');
    btn.dispatchEvent(new CustomEvent('rw:copy', { bubbles: true, detail: { value } }));
    clearTimeout(timers.get(host));
    timers.set(host, setTimeout(() => {
      host.classList.remove('is-copied');
      if (label) label.textContent = label.getAttribute('data-idle') || 'Copy';
    }, 2000));
  } else if (valueEl) {
    const range = document.createRange();
    range.selectNodeContents(valueEl);
    const sel = getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

let bound = false;
export function initCopy() {
  if (typeof document === 'undefined') return;
  markJs();
  if (bound) return;
  bound = true;
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-rw-copy]') : null;
    if (btn instanceof HTMLElement && !btn.matches(':disabled')) {
      e.preventDefault();
      copy(btn);
    }
  });
}
