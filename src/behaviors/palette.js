/* GlassPalette: filter-as-you-type, arrow keys, Enter, and ⌘K / Ctrl+K.
 *
 * Server-rendered, the palette is a search field above a list of links — it
 * works as a plain link list with no script. initPalettes() upgrades it to an
 * ARIA combobox: the field owns a listbox, aria-activedescendant follows the
 * highlighted row, and Enter activates it. Matching folds case and accents
 * ("cafe" finds "Café") and every word of the query has to match the row's
 * label or its data-keywords.
 *
 * A palette rendered as a modal (<dialog data-rw-palette-dialog>) opens with
 * its shortcut, closes on Escape or a backdrop click, and resets on close.
 * Selecting a row dispatches `rw:select` (detail: { row, value }) before the
 * link is followed.
 */
import { bindModal, closeDialog, enableCommands, openDialog, registry, uid } from './core.js';

const claim = registry();
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function bindPalette(pal) {
  if (!claim(pal)) return;
  const input = pal.querySelector('.rw-pal__field input');
  const list = pal.querySelector('.rw-pal__rows');
  if (!(input instanceof HTMLInputElement) || !list) return;
  const empty = pal.querySelector('.rw-pal__empty');
  const status = pal.querySelector('.rw-pal__status');
  const rows = [...list.querySelectorAll('.rw-pal__row')];
  const listId = list.id || (list.id = uid('rw-pal'));

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-controls', listId);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'true');
  list.setAttribute('role', 'listbox');
  if (!list.hasAttribute('aria-label')) list.setAttribute('aria-label', input.getAttribute('aria-label') || 'Results');
  for (const li of list.children) li.setAttribute('role', 'presentation');
  for (const g of list.querySelectorAll('.rw-pal__group')) g.setAttribute('aria-hidden', 'true');
  rows.forEach((row) => {
    if (!row.id) row.id = uid('rw-opt');
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', 'false');
    row.tabIndex = -1;
  });

  const itemOf = (row) => row.closest('li') ?? row;
  const visible = () => rows.filter((r) => !itemOf(r).hidden);

  function setActive(row, scroll = true) {
    for (const r of rows) {
      const on = r === row;
      r.setAttribute('aria-selected', String(on));
      r.classList.toggle('is-active', on);
    }
    if (row) {
      input.setAttribute('aria-activedescendant', row.id);
      if (scroll) row.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function filter() {
    const words = fold(input.value.trim()).split(/\s+/).filter(Boolean);
    let first = null;
    let count = 0;
    for (const row of rows) {
      const hay = fold(`${row.textContent} ${row.getAttribute('data-keywords') ?? ''}`);
      const hit = words.every((w) => hay.includes(w));
      itemOf(row).hidden = !hit;
      if (hit) { count++; first ??= row; }
    }
    // A group heading shows only while one of its rows does.
    for (const g of list.querySelectorAll('.rw-pal__group')) {
      const li = g.closest('li');
      if (!li) continue;
      let n = li.nextElementSibling, any = false;
      while (n && !n.querySelector('.rw-pal__group')) {
        if (!(/** @type {HTMLElement} */ (n).hidden)) { any = true; break; }
        n = n.nextElementSibling;
      }
      li.hidden = !any;
    }
    if (empty) /** @type {HTMLElement} */ (empty).hidden = count > 0;
    if (status) status.textContent = words.length ? (status.getAttribute('data-template') ?? '{n} results').replace('{n}', String(count)) : '';
    input.setAttribute('aria-expanded', String(count > 0));
    setActive(first, false);
  }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    const vis = visible();
    const i = vis.findIndex((r) => r.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(vis.length ? vis[(i + 1) % vis.length] : null);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(vis.length ? vis[(i - 1 + vis.length) % vis.length] : null);
    } else if (e.key === 'Enter') {
      const row = vis[i];
      if (row) { e.preventDefault(); row.click(); }
    } else if (e.key === 'Escape' && input.value) {
      // First Escape clears the query; the next one closes a modal palette.
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      filter();
    }
  });
  list.addEventListener('pointermove', (e) => {
    const row = e.target instanceof Element ? e.target.closest('.rw-pal__row') : null;
    if (row && row.getAttribute('aria-selected') !== 'true') setActive(row, false);
  });
  list.addEventListener('click', (e) => {
    const row = e.target instanceof Element ? e.target.closest('.rw-pal__row') : null;
    if (!row) return;
    const ev = new CustomEvent('rw:select', { bubbles: true, cancelable: true, detail: { row, value: row.getAttribute('data-value') ?? row.textContent?.trim() } });
    if (!pal.dispatchEvent(ev)) e.preventDefault();
    const dialog = pal.closest('dialog');
    if (dialog?.open) closeDialog(dialog, 'select');
  });

  const dialog = pal.closest('dialog');
  if (dialog) {
    bindModal(dialog, { dismissible: true });
    dialog.addEventListener('close', () => { input.value = ''; filter(); });
  }
  filter();
}

let shortcutBound = false;
function bindShortcut() {
  if (shortcutBound) return;
  shortcutBound = true;
  document.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.repeat) return;
    const key = e.key.toLowerCase();
    if (key.length !== 1) return;
    const dialog = document.querySelector(`dialog[data-rw-palette-dialog][data-rw-shortcut="${CSS.escape(key)}"]`);
    if (!(dialog instanceof HTMLDialogElement)) return;
    e.preventDefault();
    if (dialog.open) closeDialog(dialog, 'cancel');
    else {
      openDialog(dialog);
      dialog.querySelector('input')?.focus();
    }
  });
}

export function initPalettes(root = document) {
  enableCommands();
  bindShortcut();
  for (const pal of root.querySelectorAll('[data-rw-palette]')) bindPalette(pal);
}
