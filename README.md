# @robyrew/ui

The RobyRew design system: one glass material — **Obsidian** — in eleven
formats, an Apple-style control set for the content underneath it, and the
small scripts that make both behave on a watch, a phone, an iPad and a desktop.

Astro components, no React, no icon font, no build step, no dependencies.

## Install

```bash
npm i github:RobyRew/ui#v0.4.0
```

Installed from a public git tag rather than a registry. **Not GitHub Packages:**
that requires authentication even for public packages, so a fork could not
`npm install` — which would break the rule that every repo stays independently
forkable. A plain git tag needs no account and no token.

Apps on Tailwind get this package through
[`@robyrew/web-config`](https://github.com/RobyRew/web-config), which wires the
tokens into Tailwind and pins a matching tag.

## Use

```astro
---
import '@robyrew/ui/tokens.css';     // every token, both themes, the material
import '@robyrew/ui/controls.css';   // cards, fields, buttons, segments, …
import { themeBootstrap } from '@robyrew/ui/theme.js';
import GlassBar from '@robyrew/ui/components/GlassBar.astro';
---
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <script is:inline set:html={themeBootstrap} />
</head>
<body>
  <div class="glass-float rw-scroll-edge">
    <GlassBar
      links={[{ label: 'Work', href: '/', current: true }, { label: 'Notes', href: '/notes' }]}
      action={{ label: 'Contact', href: '/#contact' }}
      hint="⌘K"
    />
  </div>
</body>
```

Import the two sheets once, in the root layout. Import components by path: each
one brings its own stylesheet and, where it has behaviour, its own small
script, so a page pays only for the formats it renders.

## Light and dark

**The contract.** `localStorage.theme` is `"light"`, `"dark"`, or absent
(follow the system). `<html data-theme="light|dark">` is the resolved theme.
Everything keys off that one attribute — the tokens, the controls, the glass,
and web-config's Tailwind `dark:` variant — so nothing can disagree.

**Before the first paint**, `themeBootstrap` (an inline script) reads the
stored choice or the OS setting and stamps `data-theme`. While no choice is
stored it also follows the OS live: switch the system to dark with the page
open and the page follows.

**After load**, `setTheme('light' | 'dark' | 'system')` stores the choice,
restamps, updates `<meta name="theme-color">` so the browser's own chrome
matches the page, and cross-fades the switch with a view transition where the
browser has one (not under reduced motion). Markup can do the same without
script of its own:

```html
<div class="rw-seg" role="radiogroup" aria-label="Appearance" data-rw-seg="select">
  <span class="rw-seg__thumb" aria-hidden="true"></span>
  <button class="rw-seg__item" role="radio" data-rw-theme-set="system">Auto</button>
  <button class="rw-seg__item" role="radio" data-rw-theme-set="light">Light</button>
  <button class="rw-seg__item" role="radio" data-rw-theme-set="dark">Dark</button>
</div>
```

**In the CSS** (`tokens.css`), the bare `:root` is dark. Light applies on an
unstamped page whose OS prefers light, or wherever `data-theme="light"` is set.
Any element can carry `data-theme`, not only `<html>`: a light section on a
dark page, or a smoked player over a photo on a light page, gets the other
palette — glass, controls and `color-scheme` included. Every component also
takes a `theme` prop that sets it.

**One family.** Both themes are neutral greys with the accent as the only hue,
built from the same steps: `--ground` < `--ground-2` < `--panel` in elevation,
three ink levels, one hairline pair. The glass follows the theme: smoked with
light ink in dark, frosted with dark ink in light. Up to 0.3.x the light page
carried the dark smoked glass; that dark slab on a light page is gone.

| | Dark | Light |
| --- | --- | --- |
| `--ground` / `--ground-2` / `--panel` | `#090909` / `#0f0f0f` / `#131313` | `#f2f2f2` / `#f7f7f7` / `#ffffff` |
| `--ink` / `--ink-2` / `--ink-3` | `#ededed` / `#a3a3a3` / `#8c8c8c` | `#1d1d1f` / `#545458` / `#6b6b70` |
| `--accent` / `--on-accent` | `#7aa2ff` / `#0a0a0a` | `#2563eb` / `#ffffff` |
| glass | `30 30 30` at .52, light ink | `252 252 252` at .66, dark ink |

**Contrast.** The target is WCAG AA — 4.5:1 for every text pair on the surfaces
it sits on, 3:1 for the focus ring. `npm run check` computes all of them from
`tokens.css` and fails when one is below its target, or when the two copies of
the light palette drift apart:

```bash
npm run check
```

Glass is measured over its own theme's ground and panel — what sits behind a
floating bar on a normal page. Over a photograph the backdrop is unbounded; use
`.rw-glass--dense` there, or `.rw-scroll-edge` on a sticky shell so content
fades into the ground before it passes under the bar.

## The formats

| | Component | Radius | Role | Behaviour |
|---|---|---|---|---|
| 01 | `GlassBar` | pill | site navbar | folds its links into a menu (a popover) below its collapse width; watch-sized it keeps only brand + menu |
| 02 | `GlassPalette` | 22 | ⌘K search | filter as you type (case- and accent-folded), arrow keys, Enter; `modal` makes it a ⌘K dialog |
| 03 | `GlassHud` | 28 | transient overlay | `overlay` + `showHud()` raise it and let it fade |
| 04 | `GlassPlayer` | 22 | media transport | `media` drives an `<audio>`/`<video>` and the system Now Playing controls; stacks on narrow widths |
| 05 | `GlassTile` | 28 | stat + sparkline | figure scales with the tile; bars grow into view; `href` makes it a link |
| 06 | `GlassList` | 22 | grouped rows | inset separators, `detail` second line, `external` links |
| 07 | `GlassSheet` | 28 top | bottom sheet | `modal`: docked on phones (drag down to dismiss), a centred form sheet from 48rem |
| 08 | `GlassRail` | 22 | vertical nav | `horizontal` tab bar, `adaptive` (rail on iPad, tab bar on phone), `dock` |
| 09 | `GlassAuthCard` | 28 | sign-in | busy state while it submits, `aria-invalid` on failing fields |
| 10 | `GlassToast` | 18 | notification | dismiss, `timeout`, swipe away; `toast()` raises one from script |
| 11 | `GlassFooter` | 22 | site footer | columns fold into disclosures under 30rem |

Every component also takes `theme` (`'light' | 'dark'`), `material`
(`'glass' | 'surface'`) and `class`. Text the components generate themselves —
"Dismiss", "Menu", "Previous" — comes from a `labels` prop, so a page in
Spanish, Catalan or Romanian can name them.

**`material="surface"`** draws the same format opaque, on `--panel` with a
hairline. Glass marks the floating layer; when a tile, a list or a footer is
content on the page, it should be a surface.

## Devices

The components respond to their own width (container queries) where their
layout depends on it — bar, player, toast, tile, footer — and to the pointer:

- **Touch** (`pointer: coarse`): controls grow to Apple's 44pt target, small
  ones get an invisible hit area, fields are 16px so iOS does not zoom on focus,
  hover styles apply only where the device can hover, and `:active` press states
  work on iOS Safari.
- **Phone**: the bar folds into a menu, the sheet docks to the bottom edge
  above the home indicator, toasts come in under the notch, the rail can dock as
  a tab bar. Safe-area insets are respected wherever something touches an edge
  (needs `viewport-fit=cover` in the viewport meta).
- **iPad**: the sheet becomes a centred form sheet, the adaptive rail stays a
  sidebar, keyboard hints show only where a keyboard is likely.
- **Apple Watch**: watchOS lays a page out at 320px and scales it down unless
  the page declares it adapts itself:

  ```html
  <meta name="disabled-adaptations" content="watch" />
  ```

  With it the page gets the watch's own width (about 162–205px), and the
  formats switch to their narrowest layouts: the bar keeps brand + menu (its
  `end` slot is replaced by the `menu` slot), the player hides its artwork and
  centres a larger transport, toasts put their actions under the message.

## Motion

One easing (`--rw-ease`, Apple's control curve), a spring that overshoots by
about 4% (`--rw-ease-spring`, a `linear()` curve where supported), and four
durations. Presses scale by `--rw-press`, hovers lift by `--rw-lift`, entrances
travel by multiples of `--rw-travel`.

`prefers-reduced-motion: reduce` sets travel, press and lift to nothing and
moving parts (a segment thumb, a switch knob) to a 0s duration: entrances
become fades, nothing slides or springs. Inside glass every transition and
animation is shortened as well, including ones the page adds.
`prefers-reduced-transparency` makes the glass opaque, `prefers-contrast: more`
densifies it and outlines every layer, and forced colours (Windows contrast
themes) keep each layer's edge.

## Behaviours

The Astro components load what they need. For pages built another way (a
React island, plain HTML), or to raise things from script:

```js
import { initAll, toast, showHud, openSheet, setTheme } from '@robyrew/ui/behaviors.js';

initAll();                                     // bind everything on the page
toast({ title: 'Saved.', detail: 'notes.md', tone: 'ok' });
showHud('volume', { value: 62 });
openSheet('share');
setTheme('dark');
```

Pair that with the stylesheet for the formats:

```css
@import '@robyrew/ui/glass.css';               /* layer(components) under Tailwind */
```

Every behaviour is progressive. Without the script, links are links, the bar's
menu still opens (it is a popover), a modal sheet or palette opens from
`<button commandfor="id" command="show-modal">` in browsers with invoker
commands, forms post, and the footer simply shows every column. The script
adds gestures, keyboard handling, timers and exit animations. Events:
`rw:select` (palette), `rw:change` (managed segmented control), `rw:dismiss`
(toast), `rw:play` / `rw:pause` / `rw:prev` / `rw:next` / `rw:seek` (player),
`rw:themechange` (on `document`).

**CSP.** No component writes a `style=""` attribute — a strict `style-src`
(Astro's `security.csp`) would block it. Levels and bar heights travel as
`data-pct` and become `--rw-pct` through generated rules; scripts set custom
properties through the CSSOM, which a CSP does not block.

## Changing the taste

A taste is a set of custom properties and nothing else. Each theme block in
`tokens.css` sets its own; override them anywhere — globally, or on one
subtree:

```css
:root {
  --glass-rgb: 30 30 30;   /* material base     */
  --rim-rgb:   214 214 214;/* specular edge     */
  --t-alpha:   .52;        /* opacity           */
  --t-blur:    30px;
  --t-sat:     140%;
  --t-rim:     .30;        /* edge brightness   */
  --t-sh-y:    16px;
  --t-sh-blur: 38px;
  --t-sh-a:    .34;
  --g-ink:     #f5f5f5;    /* ink ON glass      */
  --g-ink-dim: #a8a8a8;
}
```

Every component reads tokens; none hard-codes a colour. The glass-side ramp
(`--g-ink*`, `--g-fill*`, `--g-hair`, `--g-track`, `--g-meter`) is separate
from the page ramp (`--ink*`, `--rw-fill*`, `--hair*`) because what shows
through glass is not the page. `.rw-surface` maps the first onto the second,
which is how one component renders as glass or as an opaque surface.

## Rules the components follow

**Concentric radii.** A nested corner shares its centre with the one outside it:
`inner = outer − padding`. Every format publishes `--r` and `--pad`, and its
inner shapes use `calc(var(--r) - var(--pad))`.

**Two layers only.** Glass marks the *functional* layer. Content sits beneath it,
opaque — `GlassPlayer`'s artwork is a solid block under the glass, not more glass.
Glass on glass is the mistake that makes a design read as a copy.

**The edge is the material.** Blur alone reads as frosted plastic. The refracted
rim, brighter where the light is, is what says glass. It is a masked gradient ring,
not a border.

**Scarcity.** The material is only convincing while it is rare. One bar, one
control cluster.

**Glyphs are text.** `⌘K ⏮ ⏸ ⏭ ⌕ ⏻ ⚿ ⧉ ☰ ◐ ♪ ⚑ ▲ ✓ ✕ ›` are plain UTF-8 with
`font-variant-emoji: text`, so no platform swaps one for a colour emoji. The icon
layer costs no bytes and inherits text colour.

## Apple controls (`controls.css`)

`tokens.css` is the material and every token. `controls.css` is everything that
is not glass: the content layer that sits on the page, opaque, never blurred.

| Class | Notes |
| --- | --- |
| `.rw-card` | Grouped container, 16px. `--interactive` for the hover lift and press. `.rw-card__rows` / `.rw-card__row` for divided rows (links, buttons or labels). |
| `.rw-field` | Filled input, textarea or select. Focus adds an accent ring outside the border, so the control does not resize. `aria-invalid` or `:user-invalid` turns it red. `.rw-field--grow` textareas grow with their content. `.rw-field-wrap` + `.rw-field-icon` for a leading glyph. |
| `.rw-btn` | Filled. `--primary`, `--plain`, `--danger`, `--sm`, `--lg`, `--block`, `--icon`. `aria-busy="true"` adds a spinner and blocks a second press. |
| `.rw-actions` | A row of buttons that wraps; `--end`, `--stretch`. |
| `.rw-seg` | Segmented control. Provide a `.rw-seg__thumb` for the sliding capsule; the script keeps `--n` and `--i` in step with `aria-selected` / `aria-checked` / `.is-active`. `data-rw-seg="select"` makes it manage selection (click, arrow keys, tab panels). |
| `.rw-chip` / `.rw-badge` | Pressable vs. label. Badges come in `--accent`, `--ok`, `--warn`, `--danger`. |
| `.rw-switch` | On a real `<input type="checkbox">`, or `<button role="switch" aria-checked>`. |
| `.rw-range` | On `<input type="range">`; the filled track follows the value. |
| `.rw-progress` / `.rw-spinner` | On `<progress>` (indeterminate without a value) / any element. |

Radii nest concentrically: `.rw-card` republishes its radius as `--rw-r`, so a
child subtracts its own padding from it.

## Real refraction (opt-in, Chromium only)

`backdrop-filter` can only blur. Bending the backdrop — what makes Apple's glass
look like glass rather than frosted plastic — needs an SVG filter referenced from
`backdrop-filter`, running `feDisplacementMap` against a normal map of the bezel.

```js
import { enableRefraction } from '@robyrew/ui/refraction.js';
enableRefraction();                                  // every .rw-glass
enableRefraction({ selector: '.my-bar', scale: 60, bezel: 34 });
```

`feDisplacementMap` samples `P'(x,y) = P(x + scale·(R−0.5), y + scale·(G−0.5))`,
so **128 grey means no shift**, R drives horizontal displacement and G vertical.
The map has to be a real bitmap matching the element's pixel size, which is why
it is generated on a canvas per element and rebuilt on resize — it cannot be
expressed in CSS.

The bezel profile is `(1 − depth/bezel)²` along the inward normal of a
rounded-rectangle SDF: strongest right at the rim, gone by `bezel` deep. That is
what compresses the backdrop at the edge the way a lens does.

**Support.** `url()` inside `backdrop-filter` ships in Chromium only. Safari and
Firefox ignore it, so they keep the blur baseline and nothing breaks — the
function returns early and adds no class. It also opts out under
`prefers-reduced-transparency`.

**Cost.** One canvas pass and one PNG data URL per element, redone on resize.
Fine for a handful of floating surfaces; do not put it on a list of fifty cards.

**Not included: chromatic aberration.** Splitting into three displacement passes
at different scales and recombining with `feComposite arithmetic` did not
reconstruct the backdrop correctly in testing, and Apple's own dispersion is
subtle enough that it is not worth the threefold filter cost.

## Preview

`preview/` is a small Astro site (not published with the package) that renders
every component and control in both themes side by side, live demos of every
behaviour, an environment readout (pointer, hover, reduced motion, contrast…)
and a page of device-sized frames (watch, phone, iPad):

```bash
cd preview && npm install && npm run dev        # http://localhost:4410
npm run dev -- --host                           # to open it on a real phone, iPad or watch
```

## Licence

Apache-2.0.
