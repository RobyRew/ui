/* People: the avatar tint and initials, and a fallback for pictures that fail.
 *
 * avatarHue() and initials() are pure, so Avatar.astro (on the server) and a
 * script building a comment (in the browser) give the same person the same
 * tint and the same letters.
 *
 * initAvatars() swaps an <img class="rw-avatar"> that fails to load for its
 * initials, read from the img's data-initials and data-hue (Avatar.astro
 * writes both). Image errors do not bubble, so it listens in the capture
 * phase, and it also checks pictures that had already failed before the
 * script ran. No inline onerror: a strict CSP would block it.
 */

/** Number of tints in tokens.css (--rw-av-0 … --rw-av-7). */
export const AVATAR_HUES = 8;

/** A stable tint index (0–7) for a name or handle. Case and a leading @ are
 *  ignored, so "@RobyRew" and "robyrew" share a colour. */
export function avatarHue(label = '') {
  const s = String(label).replace(/^@/, '').trim().toLowerCase();
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % AVATAR_HUES;
}

/** Up to two letters: the first letters of the first two words, or the first
 *  two characters of a single word ("@cosmin_c" → "CO"). */
export function initials(label = '') {
  const clean = String(label).replace(/^@/, '').trim();
  const words = clean.split(/[\s._-]+/).filter(Boolean);
  const first = words[0] ? [...words[0]][0] : '';
  const second = words[1] ? [...words[1]][0] : '';
  const out = first && second ? first + second : [...clean].slice(0, 2).join('');
  return out.toLocaleUpperCase() || '?';
}

const swap = (img) => {
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('rw-avatar') || img.dataset.rwFailed) return;
  img.dataset.rwFailed = '1';
  const span = document.createElement('span');
  span.className = img.className;
  for (const a of ['data-size', 'data-hue']) {
    const v = img.getAttribute(a);
    if (v != null) span.setAttribute(a, v);
  }
  span.setAttribute('aria-hidden', 'true');
  span.textContent = img.dataset.initials || initials(img.alt);
  // A meaningful picture (non-empty alt) keeps its name for assistive tech.
  if (img.alt) {
    span.removeAttribute('aria-hidden');
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', img.alt);
  }
  img.replaceWith(span);
};

let bound = false;
export function initAvatars(root = document) {
  if (typeof document === 'undefined') return;
  if (!bound) {
    bound = true;
    document.addEventListener('error', (e) => swap(e.target), true);
  }
  for (const img of root.querySelectorAll('img.rw-avatar')) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) swap(img);
  }
}
