/* LoadMore: fetch the next page and append its items in place.
 *
 *   <div class="rw-load-more" data-rw-load-more data-target="#releases tbody">
 *     <a class="rw-btn" href="?page=2" rel="next" data-rw-next>Load more</a>
 *     <p class="rw-load-more__status" aria-live="polite">50 of 312</p>
 *   </div>
 *
 * Without script the link is a plain link to the next page. With it, a click
 * fetches that page (same origin, as HTML), takes the children of the same
 * data-target in it (or the data-items selector inside it), appends them to
 * the live target, and copies the fetched page's own LoadMore state across:
 * its next link (none = the end, the link goes away) and its status text.
 * The fetched document is parsed inert, so none of its scripts run; the kit's
 * behaviours are delegated, so the new rows work as they arrive.
 *
 * `rw:loaded` bubbles from the target (detail { added, next }); a failure
 * leaves the link in place, shows data-error in the status line, and fires
 * `rw:loaderror` (detail { error }). data-auto loads the next page when the
 * link scrolls into view — an infinite list — until a load fails.
 *
 * When the link goes away while it has focus, focus moves to the first new
 * item, so a keyboard user carries on from where the list grew.
 */
import { markJs, registry } from './core.js';

const claim = registry();

async function load(box) {
  const link = box.querySelector('a[data-rw-next]');
  if (!(link instanceof HTMLAnchorElement) || box.getAttribute('aria-busy') === 'true') return;
  const sel = box.getAttribute('data-target') || '';
  const target = sel ? document.querySelector(sel) : null;
  if (!target) {
    location.assign(link.href);
    return;
  }
  const status = box.querySelector('.rw-load-more__status');
  const idle = link.textContent;
  const hadFocus = document.activeElement === link;
  box.setAttribute('aria-busy', 'true');
  link.setAttribute('aria-busy', 'true');
  link.textContent = box.getAttribute('data-loading') || 'Loading…';
  try {
    const res = await fetch(link.href, { headers: { Accept: 'text/html' }, credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const from = doc.querySelector(sel);
    const items = from ? [...from.querySelectorAll(box.getAttribute('data-items') || ':scope > *')] : [];
    const added = items.map((n) => target.appendChild(document.importNode(n, true)));
    const nextBox = (box.id && doc.getElementById(box.id)) || doc.querySelector('[data-rw-load-more]');
    const nextHref = nextBox?.querySelector('a[data-rw-next]')?.getAttribute('href');
    const nextStatus = nextBox?.querySelector('.rw-load-more__status')?.textContent;
    if (status) {
      if (nextStatus != null) status.textContent = nextStatus;
      status.removeAttribute('data-state');
    }
    if (nextHref) {
      link.href = new URL(nextHref, res.url).href;
      link.textContent = idle;
    } else {
      link.remove();
      const first = added[0];
      if (hadFocus && first instanceof HTMLElement) {
        if (!first.hasAttribute('tabindex')) first.setAttribute('tabindex', '-1');
        first.focus();
      }
    }
    target.dispatchEvent(new CustomEvent('rw:loaded', { bubbles: true, detail: { added, next: nextHref ? link.href : null } }));
    return true;
  } catch (error) {
    link.textContent = idle;
    if (status) {
      status.textContent = box.getAttribute('data-error') || 'Could not load more. Try again.';
      status.setAttribute('data-state', 'error');
    }
    box.dispatchEvent(new CustomEvent('rw:loaderror', { bubbles: true, detail: { error } }));
    return false;
  } finally {
    box.removeAttribute('aria-busy');
    link.removeAttribute('aria-busy');
  }
}

function bindBox(box) {
  if (!claim(box)) return;
  box.addEventListener('click', (e) => {
    const link = e.target instanceof Element ? e.target.closest('a[data-rw-next]') : null;
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || /** @type {MouseEvent} */ (e).button > 0) return;
    e.preventDefault();
    load(box);
  });
  if (!box.hasAttribute('data-auto') || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver(async (entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    const link = box.querySelector('a[data-rw-next]');
    if (!link) { io.disconnect(); return; }
    const ok = await load(box);
    const still = box.querySelector('a[data-rw-next]');
    if (!ok || !still) { io.disconnect(); return; }
    // Re-observe: if the new rows did not push the link out of view, the
    // fresh observation reports it intersecting and the next page loads.
    io.unobserve(still);
    io.observe(still);
  }, { rootMargin: '0px 0px 400px 0px' });
  const link = box.querySelector('a[data-rw-next]');
  if (link) io.observe(link);
}

export function initLoadMore(root = document) {
  if (typeof document === 'undefined') return;
  markJs();
  for (const box of root.querySelectorAll('[data-rw-load-more]')) bindBox(box);
}

/** Loads the next page of a LoadMore now (the element or its id). */
export function loadMore(target) {
  const box = typeof target === 'string' ? document.getElementById(target) : target;
  return box ? load(box) : Promise.resolve(false);
}
