/* Filters: SearchField's clear button, its shortcut key and Escape;
 * ActiveFilters' remove buttons; autosubmit for filter forms.
 *
 * Everything is delegated from document, so a toolbar rendered later (or
 * swapped in by LoadMore) works without another init.
 *
 *   SearchField   ✕ clears the field and fires input + change, Escape clears
 *                 it too, and a key (data-rw-search-key, e.g. "/") focuses it
 *                 from anywhere outside a field.
 *   ActiveFilters a button chip dispatches `rw:remove` (detail { name, value,
 *                 chip }) or, for "Clear all", `rw:clear`, both cancelable;
 *                 unless prevented, the chip removes itself. Link chips are
 *                 plain links to the URL without that filter.
 *   autosubmit    a form with data-rw-autosubmit submits when one of its
 *                 selects, checkboxes or radios changes. A text field still
 *                 waits for Enter.
 */
import { enablePressStates, markJs } from './core.js';

const inField = (t) =>
  t instanceof HTMLElement && (t.isContentEditable || !!t.closest('input, textarea, select, [contenteditable]'));

function clear(input) {
  if (!input.value) return;
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

let bound = false;
export function initFilters() {
  if (typeof document === 'undefined') return;
  markJs();
  enablePressStates();
  if (bound) return;
  bound = true;

  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const clr = t?.closest('[data-rw-search-clear]');
    if (clr) {
      const input = clr.closest('.rw-search')?.querySelector('input');
      if (input instanceof HTMLInputElement) {
        clear(input);
        input.focus();
      }
      return;
    }
    const chip = t?.closest('button[data-rw-remove], button[data-rw-clear]');
    const group = chip?.closest('.rw-active');
    if (!chip || !group) return;
    const all = chip.hasAttribute('data-rw-clear');
    const ev = new CustomEvent(all ? 'rw:clear' : 'rw:remove', {
      bubbles: true,
      cancelable: true,
      detail: all ? {} : { name: chip.getAttribute('data-rw-remove') || null, value: /** @type {HTMLButtonElement} */ (chip).value || null, chip },
    });
    group.dispatchEvent(ev);
    if (ev.defaultPrevented) return;
    const chips = [...group.querySelectorAll('[data-rw-remove]')];
    const gone = all ? chips : [chip];
    const next = all ? null : chips[chips.indexOf(chip) + 1] ?? chips[chips.indexOf(chip) - 1] ?? null;
    for (const c of gone) c.remove();
    if (!group.querySelector('.rw-active__chip')) group.hidden = true;
    // Focus stays in the row instead of falling back to <body>.
    const focus = next ?? group.querySelector('.rw-active__chip, .rw-active__clear');
    if (focus instanceof HTMLElement && !group.hidden) focus.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const t = e.target;
    if (e.key === 'Escape' && t instanceof HTMLInputElement && t.closest('.rw-search') && t.value) {
      // One behaviour everywhere: Chromium and WebKit clear a search field on
      // Escape natively, Firefox does not.
      e.preventDefault();
      clear(t);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || inField(t) || document.querySelector('dialog[open]')) return;
    for (const input of document.querySelectorAll('input[data-rw-search-key]')) {
      if (input.getAttribute('data-rw-search-key') !== e.key || !(input instanceof HTMLInputElement) || !input.getClientRects().length) continue;
      e.preventDefault();
      input.focus();
      input.select();
      return;
    }
  });

  document.addEventListener('change', (e) => {
    const f = e.target;
    if (!(f instanceof HTMLSelectElement || f instanceof HTMLInputElement) || !f.form) return;
    if (!f.form.hasAttribute('data-rw-autosubmit') && !f.hasAttribute('data-rw-autosubmit')) return;
    if (f instanceof HTMLInputElement && !['checkbox', 'radio'].includes(f.type)) return;
    f.form.requestSubmit();
  });
}
