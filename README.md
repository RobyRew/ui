# @robyrew/ui

The RobyRew design system: one glass material — **Obsidian** — in eleven
formats, an Apple-style control set for the content underneath it, an app kit
of components for app pages (a site header, menus, filters, people, reactions
and comments, downloads, list states), an icon set, and the small scripts that
make all of it behave on a watch, a phone, an iPad and a desktop.

Astro components, no React, no icon font, no build step, no dependencies.

## Install

```bash
npm i github:RobyRew/ui#v0.5.0
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
menu still opens (it is a popover), a modal sheet, palette, popover or menu
opens from `<button commandfor="id" command="show-modal">` in browsers with
invoker commands, forms post, and the footer simply shows every column. The
script adds gestures, keyboard handling, timers and exit animations. Events:
`rw:select` (palette, menu), `rw:change` (managed segmented control),
`rw:dismiss` (toast), `rw:play` / `rw:pause` / `rw:prev` / `rw:next` /
`rw:seek` (player), `rw:react`, `rw:like` (social), `rw:remove`, `rw:clear`
(active filters), `rw:copy`, `rw:loaded` / `rw:loaderror` (load more),
`rw:themechange` (on `document`). The app kit's events are listed with it
below.

**CSP.** No component writes a `style=""` attribute, and none uses an inline
event handler — a strict `style-src` / `script-src` (Astro's `security.csp`)
would block both. Levels and bar heights travel as `data-pct` and become
`--rw-pct` through generated rules, avatar tints and sizes as `data-hue` /
`data-size`; scripts set custom properties (a popover's position, the
measured `--site-head`) through the CSSOM, which a CSP does not block.
Controls that need script to work (a copy button, the header's menu toggle,
the theme switch) are hidden until `.js` is on `<html>`, which
`themeBootstrap` sets before the first paint.

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

Since 0.5 `controls.css` also carries the content primitives the app kit is
built from — `.rw-icon`, `.rw-avatar` (+ `.rw-avatars`), `.rw-userchip`,
`.rw-dot` / `.rw-status`, `.rw-skeleton`, `.rw-empty`, `.rw-load-more`,
`.rw-table`, `.rw-page-head`, `.rw-disclosure`, `.rw-callout`, a `.rw-chip`
that wraps a checkbox, and `.rw-seg--icon` — described with the kit below.

## App kit (0.5)

Components for app pages — the Spotify versions archive is the first user.
They are the opaque content layer, except SiteHeader, whose bar and phone
menu are glass. Import them by path like the glass formats:

```astro
---
import SiteHeader from '@robyrew/ui/components/SiteHeader.astro';
import SplitButton from '@robyrew/ui/components/SplitButton.astro';
import Icon from '@robyrew/ui/components/Icon.astro';
---
```

Each component imports its family's stylesheet (`components/SiteHeader.css`,
`Popover.css`, `Filters.css`, `Social.css`, `Downloads.css`), so a page pays
for the families it renders. A page that builds this markup from script — a
comment appended after a post, rows a React island draws — imports the
family sheet itself, or all of them at once:

```css
@import '@robyrew/ui/kit.css' layer(components);   /* layer(...) under Tailwind */
```

The simple pieces (avatar, user chip, status dot, skeleton, empty state, load
more, table, page head, disclosure, callout, icon) are **content primitives in
`controls.css`**: plain classes, available wherever the two root sheets are,
with thin Astro components that render exactly those classes.

| Family | Component | What it is | Script adds · events |
| --- | --- | --- | --- |
| Header | `SiteHeader` | Sticky shell with an 18px glass bar: brand (name + icon mark, or a `brand` slot), links, an icon theme radiogroup (system / light / dark), action pills, an `account` slot. Under 760px links, switch and pills fold into a glass menu under the bar. Ported from chat-converter's header (not GlassBar). | Measures itself into `--site-head` on `<html>`; menu toggle (Escape, click outside, link followed, focus leaving, growing past 760px close it). Without script the links stay in the bar. |
| Overlays | `Popover` | Opaque `<dialog>`: hangs from its trigger on a wide screen (end- or start-aligned, flips above, follows scroll/resize), a bottom sheet under 40rem (drag the handle down). | Anchoring, focus to `[data-autofocus]` or the panel, focus back to the trigger, `aria-expanded`, exit animations. `openPopover(id, { anchor, at })`. |
| | `Menu` | A Popover with `role="menu"` items: buttons or links, icon or status dot, `hint`, `tail`, `danger`, `disabled`, radios/checkboxes, headings that open labelled groups; optional `trigger` button. | Arrow keys, Home/End, type-ahead; `rw:select` { row, value } (cancelable: keeps it open). |
| Filters | `ChipSelect` | A native `<select>` in a chip; tints when set (anything but the first option), `neutral` for sort orders. | `autosubmit` submits its form on change. |
| | `FilterChip` | A checkbox or radio as a chip, with an icon and a count; checked shows a check mark. | — (pure CSS, `:has(:checked)`) |
| | `SearchField` | Capsule search with an icon, a clear button and a `shortcut` key hint. | ✕ and Escape clear (and fire `input`); the shortcut key focuses it. |
| | `ActiveFilters` | The filters in force: link chips (server-rendered lists) or button chips, and Clear all. | `rw:remove` { name, value, chip }, `rw:clear` (cancelable; the chip removes itself). |
| People | `Avatar` | Picture, or initials on one of eight low-chroma tints (`data-hue` from the name, `data-size` xs–2xl). | A picture that fails to load turns into the initials. `avatarHue()`, `initials()`. |
| | `UserChip` | Avatar + @handle, linked. | — |
| Social | `ReactionBar` | Emoji pills with counts and a picker (a Popover). With `action`, a POST form (one submit button per emoji). | Optimistic toggle; `rw:react` { emoji, mine, count, previous }. `setReaction()`. |
| | `LikeButton` | A heart and a count (`aria-pressed`); `plain` for rows. With `action`, a POST form (value 1 / 0). | Optimistic toggle; `rw:like` { liked, count, previous }. `setLike()`. |
| | `Comment` | Avatar, name/@handle, badge, relative `<time>` linking to the comment, body (`text` keeps line breaks), `actions` and `replies` slots, deleted state, a `:target` flash. | Relative times refreshed against the reader's clock every minute (`initRelativeTimes`). |
| | `Composer` | A comment form whose field grows with its text (16rem max), hint, counter near `maxlength`, `context` and `tools` slots. | ⌘↵ / Ctrl+↵ submits (`enter="send"`: Enter does); submit disabled while blank; busy spinner on a native submit. |
| Downloads | `SplitButton` | The main action (a link, or disabled) joined to a Menu of mirrors with status dots, hints and sizes. | As Menu. |
| | `CopyField` | Monospace value (one click selects it) and a copy button; `display` shows a short form while the full value is copied. | Clipboard, "Copied" for 2s, a live-region announcement, `rw:copy` { value }. Any `[data-rw-copy]` button works too. |
| | `StatusDot` | ok / warn / danger / unknown (a hollow ring), with its word or as a labelled dot; `pulse` for a live check. | — |
| States | `EmptyState` | Icon, title, text, actions; `bordered`, `compact`. | — |
| | `Skeleton` | Text lines, blocks, circles; sweeps (breathes under reduced motion). | — |
| | `LoadMore` | A `rel="next"` link plus a polite status line. | Fetches the next page, appends the same list's items in place, takes that page's next link and status; `auto` loads on scroll; `rw:loaded` { added, next }, `rw:loaderror`. |
| Layout | `.rw-table` | On a real `<table>` in `.rw-table-wrap`: filled head, hairline rows, `th[aria-sort]` + `.rw-table__sort`, `.is-num`, `.is-actions`, `<small>` second lines; `--compact`, `--stack` (cards under 40rem, cells show `data-label`), `--sticky` (under `--site-head`, with `.rw-table-wrap--open`). | — |
| | `PageHead` | Eyebrow in the accent, title, lead, a row for chips or actions. | — |
| | `Disclosure` | A real `<details>` (accordion with `name`, `meta`, `plain` rows), animated open where the browser sizes to auto. | — |
| | `Callout` | A note in the accent (info) or a status tone, with its icon and a title. | — |
| Icons | `Icon` / `@robyrew/ui/icons` | See below. | — |

Every component takes `class`; text it generates comes from props or a
`labels` prop, so a page in Spanish, Catalan or Romanian can name it.

**Forms first.** Reactions, likes, filters, the composer and load-more are
real forms and links, so a page with no script still posts and navigates.
With script, a listener that calls `preventDefault()` on `rw:react` /
`rw:like` takes the request over (sends it with `fetch`, then corrects the
count with `setReaction()` / `setLike()`); without a listener the form posts.

**Opaque overlays.** Menus, popovers and pickers are the panel colour, never
glass: in WebKit a top-layer dialog with a `backdrop-filter` showed the page's
text through it unblurred, and a menu is content to act on rather than chrome.

### Tokens added in 0.5

| Token | |
| --- | --- |
| `--rw-av-0` … `--rw-av-7`, `--rw-av-ink` | Avatar tints, per theme: eight hues 45° apart at OKLCH chroma ≈ .04 — the one place a hue other than the accent appears, kept low so the accent stays the only strong one. |
| `--rw-e4` | Overlay elevation (menus, popovers). |
| `--g-emoji` | Colour-emoji font stack, for reactions. |
| `--site-max`, `--gutter`, `--site-head` | Page frame: 96rem, 1rem (1.5rem from 40rem), and the header-height estimate SiteHeader replaces with its measurement. An app's own `:root` values win. |

`npm run check` measures the new pairs too: initials on every tint, status
dots against the panel and the ground, text and icons on each callout tone,
the table head, menu hover, soft-accent chips, the search and copy fields,
and the header's brand mark and theme switch.

### Icons — `@robyrew/ui/icons`

Stroke icons on a 24 grid at stroke-width 1.8, in `currentColor`: chat-converter's
59 (same names, same paths) plus 26 the kit needs — 85 in all — and five
monochrome platform marks drawn for this set: `windows`, `apple`, `linux`,
`android`, `store`.

```astro
<Icon name="download" size={18} />                <!-- decorative: aria-hidden -->
<Icon name="apple" label="macOS" />               <!-- role="img" with a name -->
```

```js
import { icon, iconSvg, ICON_PATHS, PLATFORM_MARKS } from '@robyrew/ui/icons';
button.append(icon('copy', { size: 16 }));        // an SVGSVGElement
html += iconSvg('search');                        // a string, for templates
```

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
behaviour, an environment readout (pointer, hover, reduced motion, contrast…),
a page of device-sized frames (watch, phone, iPad), and under `/kit/` a page
per app-kit component (both themes, an event log of every `rw:*` event) plus
an archive demo that puts them together:

```bash
cd preview && npm install && npm run dev        # http://localhost:4410
npm run dev -- --host                           # to open it on a real phone, iPad or watch
```

## Licence

Apache-2.0.
