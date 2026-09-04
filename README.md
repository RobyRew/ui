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

## Theme

Dark-first, because smoked glass only reads over a dark ground. All three theme
states are handled: an explicit `data-theme` wins in either direction, and the
unstamped document — what most visitors get — falls to `prefers-color-scheme`.

Obsidian deliberately keeps its own material base in both themes. It does not
become white glass when the OS turns light; the page around it changes instead.

## Licence

Apache-2.0.
