/* GlassBar's collapsed menu.
 *
 * The menu is a popover opened by the bar's toggle (popovertarget), so it
 * opens, light-dismisses and closes on Escape with no script. It renders in
 * the top layer, which is what lets its own glass blur the page instead of
 * only the bar behind it.
 *
 * This adds what the HTML cannot do: placing the menu under the bar it belongs
 * to (end-aligned, at most 22rem wide, the bar's width on a phone), keeping it
 * there through scroll and resize, closing it when a link inside is followed or
 * when the bar grows past its collapse width, and an .is-open fallback for
 * browsers without the Popover API.
 */
import { enablePressStates, registry } from './core.js';

const claim = registry();

function bindBar(bar) {
  if (!claim(bar)) return;
  const menu = bar.querySelector('[data-rw-bar-menu]');
  const toggle = bar.querySelector('.rw-bar__toggle');
  if (!(menu instanceof HTMLElement) || !(toggle instanceof HTMLElement)) return;
  const native = typeof menu.showPopover === 'function';

  const place = () => {
    const r = bar.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const width = Math.min(r.width, 22 * rem);
    const dirRtl = getComputedStyle(bar).direction === 'rtl';
    const left = dirRtl ? r.left : r.right - width;
    menu.style.setProperty('--rw-menu-top', `${Math.round(r.bottom + 8)}px`);
    menu.style.setProperty('--rw-menu-left', `${Math.round(left)}px`);
    menu.style.setProperty('--rw-menu-right', 'auto');
    menu.style.setProperty('--rw-menu-width', `${Math.round(width)}px`);
  };
  const isOpen = () => (native ? menu.matches(':popover-open') : menu.classList.contains('is-open'));
  const setOpen = (open) => {
    if (open === isOpen()) return;
    if (native) {
      if (open) menu.showPopover();
      else menu.hidePopover();
    } else {
      if (open) place();
      menu.classList.toggle('is-open', open);
      bar.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }
  };

  if (native) {
    menu.addEventListener('beforetoggle', (e) => {
      if (/** @type {ToggleEvent} */ (e).newState === 'open') place();
    });
    menu.addEventListener('toggle', (e) => {
      const open = /** @type {ToggleEvent} */ (e).newState === 'open';
      bar.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  } else {
    // No Popover API: the attribute would hide the menu for good.
    menu.removeAttribute('popover');
    toggle.removeAttribute('popovertarget');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); } });
    document.addEventListener('pointerdown', (e) => {
      if (isOpen() && e.target instanceof Node && !menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
  }

  menu.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a[href]')) setOpen(false);
  });

  let frame = 0;
  const follow = () => {
    if (frame || !isOpen()) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      // Past the collapse width the toggle is hidden and the links are back
      // in the bar, so the menu has nothing left to do.
      if (getComputedStyle(toggle).display === 'none') setOpen(false);
      else place();
    });
  };
  addEventListener('resize', follow, { passive: true });
  addEventListener('scroll', follow, { passive: true, capture: true });
}

export function initBars(root = document) {
  enablePressStates();
  for (const bar of root.querySelectorAll('[data-rw-bar]')) bindBar(bar);
}
