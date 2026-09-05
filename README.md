# @robyrew/ui

Liquid-glass component set shared across the RobyRew sites. One material —
**Obsidian** — in eleven formats.

Astro components, no React, no icon font, no build step.

## Install

```bash
npm i github:RobyRew/ui#v0.1.0
```

Installed from a public git tag rather than a registry. **Not GitHub Packages:**
that requires authentication even for public packages, so a fork could not
`npm install` — which would break the rule that every repo stays independently
forkable. A plain git tag needs no account and no token.

## Use

```astro
---
import '@robyrew/ui/tokens.css';
import GlassBar from '@robyrew/ui/components/GlassBar.astro';
---
<GlassBar
  links={[{ label: 'Work', href: '/', current: true }, { label: 'Notes', href: '/notes' }]}
  action={{ label: 'Contact', href: '/#contact' }}
  hint="⌘K"
/>
```

Import `tokens.css` once, in the root layout. Import components by path so a page
only pays for what it uses.

## The formats

| | Component | Ratio | Radius | Role |
|---|---|---|---|---|
| 01 | `GlassBar` | 21:4 | pill | site navbar |
| 02 | `GlassPalette` | 3:2 | 20 | ⌘K search |
| 03 | `GlassHud` | 1:1 | 26 | transient overlay |
| 04 | `GlassPlayer` | 16:9 | 22 | media transport |
| 05 | `GlassTile` | 1:1 | 24 | stat + sparkline |
| 06 | `GlassList` | 4:5 | 20 | grouped rows |
| 07 | `GlassSheet` | 3:4 | 26 top | bottom sheet |
| 08 | `GlassRail` | 1:2.4 | 22 | vertical nav |
| 09 | `GlassAuthCard` | 4:5 | 24 | sign-in |
| 10 | `GlassToast` | 9:1 | 16 | notification |
| 11 | `GlassFooter` | — | 22 | site footer |

## Changing the taste

A taste is eleven custom properties and nothing else. Override them anywhere —
globally, or on one subtree:

```css
:root {
  --glass-rgb: 26 29 38;   /* material base   */
  --rim-rgb:   190 205 235;/* specular edge   */
  --t-alpha:   .52;        /* opacity         */
  --t-blur:    30px;
  --t-sat:     140%;
  --t-rim:     .30;        /* edge brightness */
  --t-sh-y:    16px;
  --t-sh-blur: 38px;
  --t-sh-a:    .34;
  --g-ink:     #f4f6fb;    /* ink ON glass    */
  --g-ink-dim: #a4adc0;
}
```

Every component reads these; none hard-codes a colour. Swapping them restyles all
eleven at once.

## Rules the components follow

**Concentric radii.** A nested corner shares its centre with the one outside it:
`inner = outer − padding`. `GlassList` is 20px outer, 8px padding, 12px rows.

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

## Theme

Dark-first, because smoked glass only reads over a dark ground. All three theme
states are handled: an explicit `data-theme` wins in either direction, and the
unstamped document — what most visitors get — falls to `prefers-color-scheme`.

Obsidian deliberately keeps its own material base in both themes. It does not
become white glass when the OS turns light; the page around it changes instead.

## Licence

Apache-2.0.

## Apple controls (`controls.css`)

`tokens.css` is the glass material. `controls.css` is everything that is not
glass: the content layer that sits on the page, opaque, never blurred.

```js
import '@robyrew/ui/tokens.css';
import '@robyrew/ui/controls.css';
```

Glass is the functional layer — bar, palette, sheet — floating over content.
A card inside a glass bar makes two blurred layers and the material stops
meaning anything, so the content layer is deliberately opaque.

| Class | Notes |
| --- | --- |
| `.rw-card` | Grouped container, 16px. Add `--interactive` for the hover lift. `.rw-card__row` for divided rows. |
| `.rw-field` | Filled input/textarea. Focus adds an accent ring outside the border, so the control does not resize. `.rw-field-wrap` + `.rw-field-icon` for a leading glyph. |
| `.rw-btn` | Filled. `--primary`, `--plain`, `--sm`, `--lg`, `--block`. |
| `.rw-seg` | Segmented control. Set `--n` to the segment count and `--i` to the selected index; the thumb translates. |
| `.rw-chip` / `.rw-badge` | Pressable vs. label. Separate classes because they behave differently. |
| `.rw-switch` | On a real `<input type="checkbox">`. |

Radii nest concentrically: `.rw-card` republishes its radius as `--rw-r`, so a
child subtracts its own padding from it.

Re-theming is four properties from `tokens.css` — `--panel`, `--hair`, `--ink`,
`--accent`. The `--rw-*` properties above are the shape and elevation knobs.
