/* GlassFooter on a narrow screen: each column folds into a disclosure.
 *
 * Below 30rem of footer width every column title becomes a button
 * (aria-expanded, aria-controls) and its links collapse, the way a phone footer
 * keeps a dozen links from becoming a long scroll. Wider than that, the buttons
 * are removed and the columns are plain headings and lists again. Without the
 * script the columns simply stack, all open.
 */
import { registry, uid } from './core.js';

const claim = registry();
const NARROW = 30; // rem

function setCompact(footer, on) {
  footer.classList.toggle('is-compact', on);
  for (const col of footer.querySelectorAll('.rw-footer__col')) {
    const title = col.querySelector('.rw-footer__title');
    const list = col.querySelector('ul');
    if (!title || !list) continue;
    let btn = title.querySelector(':scope > button.rw-footer__toggle');
    if (on && !btn) {
      if (!list.id) list.id = uid('rw-foot');
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rw-footer__toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', list.id);
      btn.append(...title.childNodes);
      const chev = document.createElement('span');
      chev.className = 'rw-footer__chev rw-gl';
      chev.setAttribute('aria-hidden', 'true');
      chev.textContent = '›';
      btn.append(chev);
      title.append(btn);
      col.classList.add('is-collapsible');
      col.classList.remove('is-open');
      btn.addEventListener('click', () => {
        const open = btn?.getAttribute('aria-expanded') !== 'true';
        btn?.setAttribute('aria-expanded', String(open));
        col.classList.toggle('is-open', open);
      });
    } else if (!on && btn) {
      btn.querySelector('.rw-footer__chev')?.remove();
      title.append(...btn.childNodes);
      btn.remove();
      col.classList.remove('is-collapsible', 'is-open');
    }
  }
}

function bindFooter(footer) {
  if (!claim(footer)) return;
  if (footer.querySelectorAll('.rw-footer__col').length < 2) return;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  new ResizeObserver(([entry]) => {
    if (entry) setCompact(footer, entry.contentRect.width < NARROW * rem());
  }).observe(footer);
}

export function initFooters(root = document) {
  for (const f of root.querySelectorAll('[data-rw-footer]')) bindFooter(f);
}
