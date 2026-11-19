/* SiteHeader: the measured --site-head, the phone menu, the theme switch.
 *
 * --site-head is the bar's height plus the space above it, written on <html>
 * through the CSSOM (a CSP does not block that) and kept current with a
 * ResizeObserver, so sticky offsets and scroll-padding follow the real header.
 *
 * Under 760px the links fold into a menu: a glass panel under the bar, opened
 * by the menu button (aria-expanded + aria-controls, the disclosure pattern).
 * It closes on Escape (focus back on the button), on a click outside the
 * header, when a link in it is followed, when focus leaves the header, and
 * when the window grows past 760px. The panel is a sibling of the bar, not a
 * child: a backdrop-filter inside another one only blurs what is inside the
 * first, so a nested panel would show no page through it.
 *
 * Without script the links never fold: the collapse rules key off .js on
 * <html> (themeBootstrap sets it before the first paint), so a page with no
 * script keeps its links in the bar, scrolling sideways when they do not fit.
 */
import { enablePressStates, markJs, registry } from './core.js';
import { initSegments } from './seg.js';
import { initThemeControls } from '../theme.js';

const claim = registry();
const WIDE = '(min-width: 760px)';

function bindHead(head) {
  if (!claim(head)) return;
  const bar = head.querySelector('.rw-site-bar');
  if (bar instanceof HTMLElement && head.hasAttribute('data-rw-measure')) {
    const measure = () => {
      const top = parseFloat(getComputedStyle(head).paddingTop) || 0;
      document.documentElement.style.setProperty('--site-head', `${Math.ceil(bar.offsetHeight + top)}px`);
    };
    if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(bar);
    measure();
  }

  const btn = head.querySelector('.rw-site-menu-btn');
  const menu = head.querySelector('[data-rw-site-menu]');
  if (!(btn instanceof HTMLElement) || !(menu instanceof HTMLElement)) return;
  const isOpen = () => !menu.hidden;
  const setOpen = (open) => {
    if (open === isOpen()) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    head.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen() && !e.defaultPrevented) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && e.target instanceof Node && !head.contains(e.target)) setOpen(false);
  });
  menu.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a[href]')) setOpen(false);
  });
  head.addEventListener('focusout', (e) => {
    const to = /** @type {FocusEvent} */ (e).relatedTarget;
    if (isOpen() && to instanceof Node && !head.contains(to)) setOpen(false);
  });
  matchMedia(WIDE).addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

export function initSiteHeads(root = document) {
  if (typeof document === 'undefined') return;
  markJs();
  enablePressStates();
  for (const head of root.querySelectorAll('[data-rw-site-head]')) bindHead(head);
  initSegments(root);
  initThemeControls();
}
