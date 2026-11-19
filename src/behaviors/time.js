/* Relative times: <time datetime="…" data-rw-relative>3 h ago</time>.
 *
 * formatRelative() is pure and runs on the server too (Comment.astro renders
 * the first text with it). In the browser, initRelativeTimes() rewrites every
 * such element against the real clock — a cached page still says "just now"
 * otherwise — sets its title to the full local date and time, and refreshes
 * them once a minute while the page is visible.
 *
 * The language is the element's own lang (inherited from <html lang>), so a
 * Spanish page says "hace 3 horas".
 */

const cache = new Map();
const rtf = (locale) => {
  const key = locale || 'default';
  if (!cache.has(key)) cache.set(key, new Intl.RelativeTimeFormat(locale || undefined, { numeric: 'auto', style: 'long' }));
  return cache.get(key);
};

/**
 * "now", "5 minutes ago", "yesterday", "in 2 days", "3 months ago". Under 45
 * seconds is "now"; past 26 days it counts months, past 11 months years.
 * @param {Date | string | number} date
 * @param {{ now?: Date | number, locale?: string }} [opts]
 */
export function formatRelative(date, { now = Date.now(), locale } = {}) {
  const t = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = (t - (now instanceof Date ? now.getTime() : now)) / 1000;
  const abs = Math.abs(diff);
  const f = rtf(locale);
  if (abs < 45) return f.format(0, 'second');
  if (abs < 45 * 60) return f.format(Math.round(diff / 60), 'minute');
  if (abs < 22 * 3600) return f.format(Math.round(diff / 3600), 'hour');
  if (abs < 26 * 24 * 3600) return f.format(Math.round(diff / 86400), 'day');
  if (abs < 320 * 24 * 3600) return f.format(Math.round(diff / (30 * 86400)), 'month');
  return f.format(Math.round(diff / (365 * 86400)), 'year');
}

/** The full date and time in the reader's own zone, for a title. */
export function formatAbsolute(date, locale) {
  const d = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toLocaleString(locale || undefined, { dateStyle: 'long', timeStyle: 'short' });
}

const langOf = (el) => el.closest('[lang]')?.getAttribute('lang') || undefined;

function refresh(root = document) {
  const now = Date.now();
  for (const el of root.querySelectorAll('time[data-rw-relative]')) {
    const dt = el.getAttribute('datetime');
    if (!dt) continue;
    const lang = langOf(el);
    const text = formatRelative(dt, { now, locale: lang });
    if (text && el.textContent !== text) el.textContent = text;
    if (!el.dataset.rwTitled) {
      el.dataset.rwTitled = '1';
      el.title = formatAbsolute(dt, lang);
    }
  }
}

let timer = 0;
export function initRelativeTimes(root = document) {
  if (typeof document === 'undefined') return;
  refresh(root);
  if (timer) return;
  const tick = () => { if (!document.hidden) refresh(document); };
  timer = setInterval(tick, 60_000);
  document.addEventListener('visibilitychange', tick);
  // Rows LoadMore appended carry server-rendered text from their own request.
  document.addEventListener('rw:loaded', (e) => { if (e.target instanceof Element) refresh(e.target); });
}
