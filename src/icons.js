/* @robyrew/ui/icons — the house icon set.
 *
 *     import { ICON_PATHS, iconSvg, icon } from '@robyrew/ui/icons';
 *     el.append(icon('download'));                      // an SVGSVGElement
 *     html += iconSvg('search', { size: 16 });          // markup, for templates
 *
 * In Astro, prefer the component:
 *     import Icon from '@robyrew/ui/components/Icon.astro';
 *     <Icon name="download" size={18} />
 *
 * Stroke icons on a 24 grid, drawn with currentColor at stroke-width 1.8 with
 * round caps and joins, so they take the text colour of whatever holds them.
 * The set started as @robyrew/chat-converter/ui/icons (same names, same
 * paths) and grew the icons the app kit needs.
 *
 * Platform marks (windows, apple, linux, android, store) are simple filled
 * silhouettes drawn for this set, monochrome like the rest: they say which
 * platform a build is for, they are not the vendors' logo files.
 *
 * Plain strings, no dependency, nothing runs on import. Every value is a
 * constant written here — no caller input ever reaches the markup, so the
 * strings are safe to inject with innerHTML / set:html.
 */

/** @type {Record<string, string>} */
export const ICON_PATHS = {
  /* ── From chat-converter ─────────────────────────────────────────── */
  upload: '<path d="M12 15V4"/><path d="M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download: '<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2.2h7.4a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  file: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5"/>',
  fileText: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5"/><path d="M9 13h6M9 16.5h4"/>',
  package: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4"/><path d="M12 11v10"/><path d="m8 5 8 4"/>',
  braces: '<path d="M8 4.5H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h1"/><path d="M16 4.5h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-1"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.6 3.5 5.5 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.5-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
  send: '<path d="M20.5 3.5 3.5 10.6l6.3 2.6 2.6 6.3z"/><path d="m9.8 13.2 4.4-4.4"/>',
  chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
  chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  more: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  message: '<path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 19.5l1-4A8 8 0 1 1 20 11.5z"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 6"/><path d="M17.5 14.2a5 5 0 0 1 3 4.8"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.5-4.5L7 19.5"/>',
  video: '<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3z"/>',
  film: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M16 4v16M4 9h4M16 9h4M4 15h4M16 15h4"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v2.5"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/>',
  paperclip: '<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7l8.1-8.1a3.3 3.3 0 0 1 4.7 4.7l-8.1 8.1a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  contact: '<circle cx="12" cy="9" r="3.5"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>',
  poll: '<path d="M6 20v-9M12 20V5M18 20v-6"/>',
  checklist: '<path d="m4 7 1.5 1.5L8.5 5.5M4 15l1.5 1.5 3-3"/><path d="M12 7h8M12 15h8"/>',
  phone: '<path d="M5 4.5h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 6.4 6.4l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  alert: '<path d="M10.3 4.9 3.4 17a2 2 0 0 0 1.7 3h13.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0z"/><path d="M12 10v4M12 17h.01"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  shield: '<path d="M12 3.5 19 6v5.6c0 4.4-3 7.6-7 8.9-4-1.3-7-4.5-7-8.9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
  undo: '<path d="M4 9.5h10a5.5 5.5 0 0 1 0 11H9"/><path d="M8 5.5 4 9.5l4 4"/>',
  trash: '<path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2"/><path d="m6.5 7 .8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12"/>',
  minusCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12h7"/>',
  plusCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  swap: '<path d="M4 8.5h14"/><path d="M14.5 5 18 8.5 14.5 12"/><path d="M20 15.5H6"/><path d="M9.5 12 6 15.5 9.5 19"/>',
  forward: '<path d="m14 6 6 6-6 6"/><path d="M20 12H9a5 5 0 0 0-5 5v1"/>',
  reply: '<path d="m10 6-6 6 6 6"/><path d="M4 12h11a5 5 0 0 1 5 5v1"/>',
  pencil: '<path d="m15.5 4.5 4 4L9 19H5v-4z"/>',
  zap: '<path d="M13 3 5 13.5h6L10.5 21 19 10.5h-6z"/>',
  book: '<path d="M5 4.5h10.5a3 3 0 0 1 3 3v12h-11A2.5 2.5 0 0 1 5 17z"/><path d="M5 17a2.5 2.5 0 0 1 2.5-2.5h11"/>',
  code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4"/><path d="m13.5 5.5-3 13"/>',
  filter: '<path d="M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2z"/>',
  sort: '<path d="M8 4v16"/><path d="M4.5 7.5 8 4l3.5 3.5"/><path d="M16 20V4"/><path d="M12.5 16.5 16 20l3.5-3.5"/>',
  layers: '<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16 8.5 4.5 8.5-4.5"/>',

  /* ── Added for the app kit ───────────────────────────────────────── */
  chevronUp: '<path d="m6 14.5 6-6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  heart: '<path d="M12 19.5S4 14.6 4 9.4A3.9 3.9 0 0 1 7.9 5.5c1.7 0 3.1.9 4.1 2.3 1-1.4 2.4-2.3 4.1-2.3A3.9 3.9 0 0 1 20 9.4c0 5.2-8 10.1-8 10.1z"/>',
  smilePlus: '<path d="M20.4 12.8A8.5 8.5 0 1 1 11.2 3.5"/><path d="M9 10h.01M15 10h.01"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M18.5 2.5v5M16 5h5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
  external: '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  userCircle: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="10" r="3"/><path d="M6.7 18.2a6 6 0 0 1 10.6 0"/>',
  logIn: '<path d="M13.5 4.5H17a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3.5"/><path d="M4 12h10"/><path d="m10.5 8.5 3.5 3.5-3.5 3.5"/>',
  logOut: '<path d="M10.5 4.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3.5"/><path d="M9 12h11"/><path d="m16.5 8.5 3.5 3.5-3.5 3.5"/>',
  flag: '<path d="M5.5 20.5v-16"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4h4"/><path d="M12 7.5V12l3 2"/>',
  tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.3" cy="8.3" r="1.4"/>',
  hash: '<path d="M5 9h15M4 15h15M10 3.5 8 20.5M16 3.5l-2 17"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M7.5 7.5h.01M7.5 16.5h.01"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6 3.8 3.8 0 0 1-.4 7.4z"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>',
  activity: '<path d="M3.5 12h4l2.5-6 4 12 2.5-6h4"/>',
  xCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
  helpCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7"/><path d="M12 17h.01"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  terminal: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="m7.5 9.5 3 2.5-3 2.5M12.5 15h4"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',

  /* ── Platform marks: filled silhouettes ──────────────────────────── */
  windows: '<path fill="currentColor" stroke="none" d="M3.5 3.5h7.75v7.75H3.5zM12.75 3.5h7.75v7.75h-7.75zM3.5 12.75h7.75v7.75H3.5zM12.75 12.75h7.75v7.75h-7.75z"/>',
  apple: '<path fill="currentColor" stroke="none" d="M12 7.8c1.2-.9 2.6-1.4 4-1.3 2.2.1 3.6 1.2 4.3 2.5a3.2 3.2 0 0 0 .3 5.4c-.6 2.9-2.4 6-4.2 7-1.4.6-2.5-.2-4.4-.2s-3 .8-4.4.2c-2.2-1-4-4.8-4-8.2 0-3.9 2.4-6.7 5.4-6.7 1 0 2 .5 3 1.3z"/><path fill="currentColor" stroke="none" d="M12.2 6c-.1-1.7 1.2-3.3 3.1-3.6.1 1.8-1.2 3.4-3.1 3.6z"/>',
  linux: '<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M12 2.8c-2.4 0-3.7 2-3.7 4.6 0 1.7-.3 2.6-1.4 4.2-1.4 2-2.3 4.1-2 6.4.2 1.6 1.3 2.6 2.7 2.9h8.8c1.4-.3 2.5-1.3 2.7-2.9.3-2.3-.6-4.4-2-6.4-1.1-1.6-1.4-2.5-1.4-4.2 0-2.6-1.3-4.6-3.7-4.6zm0 7.8c-2.1 0-3.6 2.8-3.6 5.6 0 2.4 1.4 3.8 3.6 3.8s3.6-1.4 3.6-3.8c0-2.8-1.5-5.6-3.6-5.6zM9.5 6.9a.9.9 0 1 0 1.8 0 .9.9 0 1 0-1.8 0zm3.2 0a.9.9 0 1 0 1.8 0 .9.9 0 1 0-1.8 0zm-2.1 2 1.4 1.3 1.4-1.3z"/><path fill="currentColor" stroke="none" d="M4.6 20.4c.2-1 1.5-1.5 3-1.2 1.4.3 2.3 1.3 2 2-.3.8-1.7 1.1-3.2.8-1.3-.3-2-1-1.8-1.6zm14.8 0c-.2-1-1.5-1.5-3-1.2-1.4.3-2.3 1.3-2 2 .3.8 1.7 1.1 3.2.8 1.3-.3 2-1 1.8-1.6z"/>',
  android: '<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M4.5 17.5a7.5 7.5 0 0 1 15 0zm4.4-3a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 1 0-2.2 0zm4 0a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 1 0-2.2 0z"/><path d="M8.2 11.4 6.6 8.6M15.8 11.4l1.6-2.8" stroke-width="1.6"/>',
  store: '<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M4.6 8.5h14.8l-1.1 11.3a1.5 1.5 0 0 1-1.5 1.4H7.2a1.5 1.5 0 0 1-1.5-1.4zm5 3.8v2.6h2.1v-2.6zm2.7 0v2.6h2.1v-2.6zm-2.7 3.2v2.6h2.1v-2.6zm2.7 0v2.6h2.1v-2.6z"/><path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5"/>',
};

/** The platform marks, for a picker or a legend. */
export const PLATFORM_MARKS = /** @type {const} */ (['windows', 'apple', 'linux', 'android', 'store']);

const ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * An icon as an SVG string. Decorative (aria-hidden) unless `label` is given,
 * which makes it role="img" with that name. Unknown names render an empty
 * 24×24 box rather than throwing, so a typo cannot take a page down.
 * @param {string} name
 * @param {{ size?: number, label?: string, class?: string }} [opts]
 */
export function iconSvg(name, { size = 18, label, class: cls } = {}) {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  const klass = `rw-icon${cls ? ` ${esc(cls)}` : ''}`;
  return `<svg class="${klass}" width="${Number(size) || 18}" height="${Number(size) || 18}" ${ATTRS} ${a11y}>${ICON_PATHS[name] ?? ''}</svg>`;
}

/**
 * An icon as an element, for script-built markup.
 * @param {string} name
 * @param {{ size?: number, label?: string, class?: string }} [opts]
 * @returns {SVGSVGElement}
 */
export function icon(name, opts) {
  const tpl = document.createElement('template');
  tpl.innerHTML = iconSvg(name, opts);
  return /** @type {SVGSVGElement} */ (tpl.content.firstElementChild);
}
