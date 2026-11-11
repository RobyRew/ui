/** Generated cover art for the player specimens, as SVG data URIs, so the
 *  preview needs no image files. */
const cover = (a: string, b: string, c: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="120" height="120" fill="url(#g)"/>` +
      `<circle cx="84" cy="38" r="22" fill="${c}" opacity=".85"/>` +
      `<path d="M0 92 C30 76 52 104 80 90 S112 80 120 86 V120 H0Z" fill="#000" opacity=".22"/>` +
    `</svg>`,
  );

export const artDusk = cover('#f0764a', '#3d2a6d', '#ffd9a8');
export const artSea = cover('#17d6c4', '#2a2f6b', '#e9f6ff');
