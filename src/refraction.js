/* Real refraction for .rw-glass, as an OPT-IN enhancement.
 *
 * backdrop-filter can only blur. Bending the backdrop needs an SVG filter
 * referenced from backdrop-filter — backdrop-filter: url(#id) — running
 * feDisplacementMap against a normal map of the glass bezel.
 *
 * feDisplacementMap samples  P'(x,y) = P(x + scale*(R-0.5), y + scale*(G-0.5)),
 * so 128 grey means "no shift", and the map has to be a real bitmap matching the
 * element's pixel size. That is why it is generated here rather than in CSS.
 *
 * SUPPORT: url() in backdrop-filter ships in Chromium only. Safari and Firefox
 * ignore it, which is why the blur baseline stays in the .rw-glass rule and this
 * only ever adds a class on top.
 *
 *   import { enableRefraction } from '@robyrew/ui/refraction.js';
 *   enableRefraction();                       // every .rw-glass on the page
 *   enableRefraction({ selector: '.my-bar', scale: 60, bezel: 34 });
 */

const NS = 'http://www.w3.org/2000/svg';
let seq = 0;

function buildMap(w, h, radius, bezel) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: false });
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const hw = w / 2, hh = h / 2;
  const r = Math.min(radius, hw, hh);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x - hw, py = y - hh;
      // Signed distance to a rounded rectangle. Negative inside.
      const qx = Math.abs(px) - hw + r;
      const qy = Math.abs(py) - hh + r;
      const dist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
                 + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -dist;
      let nx = 0, ny = 0;

      if (depth >= 0 && depth < bezel) {
        let gx, gy;
        if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; gx = qx / l; gy = qy / l; }
        else if (qx > qy)     { gx = 1; gy = 0; }
        else                  { gx = 0; gy = 1; }
        gx *= Math.sign(px) || 1;
        gy *= Math.sign(py) || 1;
        // Strongest at the rim, gone by `bezel` deep — a lens compresses at the edge.
        const t = 1 - depth / bezel;
        const k = t * t;
        nx = -gx * k;   // negative: sample from further inside
        ny = -gy * k;
      }

      const i = (y * w + x) * 4;
      d[i] = Math.round(128 + nx * 127);
      d[i + 1] = Math.round(128 + ny * 127);
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

function ensureHost() {
  let host = document.getElementById('rw-refraction-defs');
  if (!host) {
    host = document.createElementNS(NS, 'svg');
    host.id = 'rw-refraction-defs';
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('width', '0');
    host.setAttribute('height', '0');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.appendChild(host);
  }
  return host;
}

function applyOne(el, opts) {
  const rect = el.getBoundingClientRect();
  const w = Math.round(rect.width), h = Math.round(rect.height);
  if (!w || !h) return;

  const cs = getComputedStyle(el);
  const radius = opts.radius ?? (parseFloat(cs.borderTopLeftRadius) || 20);
  const id = el.dataset.rwRefractId || (el.dataset.rwRefractId = `rw-refract-${++seq}`);

  let filter = document.getElementById(id);
  if (!filter) {
    filter = document.createElementNS(NS, 'filter');
    filter.id = id;
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.innerHTML =
      '<feImage x="0" y="0" result="map"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/>';
    ensureHost().appendChild(filter);
  }
  filter.setAttribute('x', 0); filter.setAttribute('y', 0);
  filter.setAttribute('width', w); filter.setAttribute('height', h);

  const feImage = filter.querySelector('feImage');
  feImage.setAttribute('width', w);
  feImage.setAttribute('height', h);
  feImage.setAttribute('href', buildMap(w, h, radius, opts.bezel));
  filter.querySelector('feDisplacementMap').setAttribute('scale', opts.scale);

  el.style.setProperty('--rw-refract-url', `url(#${id})`);
  el.classList.add('rw-refracting');
}

export function enableRefraction({
  selector = '.rw-glass',
  scale = 56,
  bezel = 32,
  radius,          // defaults to the element's own border-radius
  root = document,
} = {}) {
  if (typeof window === 'undefined') return () => {};

  const supported = CSS.supports('backdrop-filter', 'url(#x)') ||
                    CSS.supports('-webkit-backdrop-filter', 'url(#x)');
  if (!supported) return () => {};
  if (matchMedia('(prefers-reduced-transparency: reduce)').matches) return () => {};

  const els = [...root.querySelectorAll(selector)];
  const opts = { scale, bezel, radius };
  els.forEach((el) => applyOne(el, opts));

  // The map is a bitmap sized to the element, so it is rebuilt on resize.
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) applyOne(e.target, opts);
  });
  els.forEach((el) => ro.observe(el));
  return () => ro.disconnect();
}

export default enableRefraction;
