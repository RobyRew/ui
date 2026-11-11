/* Theme runtime for @robyrew/ui.
 *
 * THE CONTRACT, shared by every app:
 *   - localStorage.theme is "light", "dark", or absent (= follow the system).
 *     Any other stored value is treated as absent.
 *   - <html data-theme="light|dark"> is the resolved theme. tokens.css, the
 *     controls, the glass and web-config's Tailwind `dark:` variant all key off
 *     it, so they cannot disagree.
 *   - localStorage.accent, when set, is copied to <html data-accent>.
 *
 * themeBootstrap is the inline script that stamps data-theme before the first
 * paint (web-config re-exports it). It also keeps an unpinned page in step with
 * the OS: switch the system to dark while the page is open and it follows.
 *
 *     <script is:inline set:html={themeBootstrap} />
 *
 * The rest runs after load: setTheme() for a switcher, and
 * initThemeControls() for markup such as
 *     <button data-rw-theme-set="dark">Dark</button>
 * which sets the theme on click and reflects the current choice back as
 * aria-checked (role=radio), aria-selected (role=tab), or aria-pressed, plus
 * .is-active — so a .rw-seg of these slides its thumb.
 *
 * Nothing runs on import; the module is safe to load on the server.
 */

export const THEME_KEY = 'theme';
export const ACCENT_KEY = 'accent';

/** The pre-paint stamp. Kept as a string because it must run before the
 *  bundle: a module would execute after the first paint, which is the flash it
 *  exists to avoid. Change it and any CSP hash pinned for it changes too. */
export const themeBootstrap = `(function(){var d=document.documentElement;try{var m=window.matchMedia('(prefers-color-scheme: dark)'),s=localStorage.getItem('theme');if(s!=='light'&&s!=='dark')s=null;d.setAttribute('data-theme',s||(m.matches?'dark':'light'));if(m.addEventListener)m.addEventListener('change',function(e){var v=null;try{v=localStorage.getItem('theme')}catch(x){}if(v!=='light'&&v!=='dark')d.setAttribute('data-theme',e.matches?'dark':'light')});var a=localStorage.getItem('accent');if(a)d.setAttribute('data-accent',a)}catch(e){}finally{d.classList.remove('theme-loading');d.classList.add('js')}})();`;

/** @typedef {'light' | 'dark' | 'system'} ThemePreference */

const dark = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

/** @returns {ThemePreference} */
export function getThemePreference() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** @param {ThemePreference} [pref] @returns {'light' | 'dark'} */
export function resolveTheme(pref = getThemePreference()) {
  return pref === 'system' ? (dark() ? 'dark' : 'light') : pref;
}

/** Points every <meta name="theme-color"> at the current ground, so the
 *  browser's own chrome (the address bar on Android, the tab strip in Safari)
 *  matches the page rather than the OS setting. */
export function syncThemeColor() {
  if (typeof document === 'undefined') return;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (!metas.length) return;
  const ground = getComputedStyle(document.documentElement).getPropertyValue('--ground').trim();
  if (ground) for (const m of metas) m.setAttribute('content', ground);
}

function reflect() {
  const pref = getThemePreference();
  for (const el of document.querySelectorAll('[data-rw-theme-set]')) {
    const on = el.getAttribute('data-rw-theme-set') === pref;
    const role = el.getAttribute('role');
    if (role === 'radio') el.setAttribute('aria-checked', String(on));
    else if (role === 'tab') el.setAttribute('aria-selected', String(on));
    else el.setAttribute('aria-pressed', String(on));
    el.classList.toggle('is-active', on);
  }
}

/** Stamps the resolved theme for a preference without storing anything. */
export function applyTheme(pref = getThemePreference()) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolveTheme(pref));
  syncThemeColor();
}

/**
 * Stores a preference ("system" clears it), stamps the theme, and announces
 * `rw:themechange` on document (detail: { preference, theme }). Where the View
 * Transitions API exists and motion is not reduced, the switch cross-fades.
 * @param {ThemePreference} pref
 * @param {{ animate?: boolean }} [opts]
 */
export function setTheme(pref, { animate = true } = {}) {
  try {
    if (pref === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* storage unavailable: the choice lasts for this page */
  }
  const run = () => {
    applyTheme(pref);
    reflect();
    document.dispatchEvent(new CustomEvent('rw:themechange', { detail: { preference: pref, theme: resolveTheme(pref) } }));
  };
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = /** @type {Document & { startViewTransition?: (cb: () => void) => unknown }} */ (document);
  if (animate && !calm && typeof doc.startViewTransition === 'function' && document.visibilityState === 'visible') {
    doc.startViewTransition(run);
  } else run();
}

let controlsBound = false;
/** Binds every [data-rw-theme-set] on the page (event delegation, so controls
 *  added later work too) and follows OS changes while the preference is
 *  "system". Safe to call more than once. */
export function initThemeControls() {
  if (typeof document === 'undefined') return;
  reflect();
  syncThemeColor();
  if (controlsBound) return;
  controlsBound = true;
  const pick = (el) => {
    const v = el?.getAttribute('data-rw-theme-set');
    if ((v === 'light' || v === 'dark' || v === 'system') && v !== getThemePreference()) setTheme(v);
  };
  document.addEventListener('click', (e) => {
    pick(e.target instanceof Element ? e.target.closest('[data-rw-theme-set]') : null);
  });
  // A managed .rw-seg (data-rw-seg="select") also selects with the arrow
  // keys, which fire no click; it announces the choice as rw:change.
  document.addEventListener('rw:change', (e) => {
    const item = /** @type {CustomEvent} */ (e).detail?.item;
    if (item instanceof Element && item.hasAttribute('data-rw-theme-set')) pick(item);
  });
  if (typeof matchMedia === 'function') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getThemePreference() === 'system') { applyTheme('system'); reflect(); }
    });
  }
}
