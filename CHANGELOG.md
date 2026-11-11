# Changelog

Versions are git tags (`npm i github:RobyRew/ui#vX.Y.Z`). While the package is
0.x the minor digit is the breaking one: a 0.4 app may need the notes below
before it moves from 0.3.

## 0.4.0 — 2026-11-11

### Themes

- The light theme is a neutral grey family matching the dark one: grounds
  `#f2f2f2` / `#f7f7f7`, panel `#fff`, ink `#1d1d1f` / `#545458` / `#6b6b70`,
  hairlines `#e0e0e0` / `#ebebeb`. `--ground-2` is now a step *toward* the panel
  in both themes (it was darker than the ground in light, lighter in dark).
- The glass follows the theme. In light it is frosted (`252 252 252` at .66,
  saturation 160%, white rim, a faint dark edge, softer shadow) with dark glass
  ink; until 0.3.3 the light page carried the dark smoked glass. Apps that set
  `--t-alpha: .86` on their bar in the light theme to keep that dark glass
  legible can drop the override.
- Light accent `#2b6ef6` → `#2563eb`, so links on the light ground reach 4.5:1;
  `--accent-soft` is a neutral wash in both themes.
- New `--on-accent`: the text colour on an accent fill. `.rw-btn--primary`,
  pressed chips and the glass CTAs use it. In dark it is `#0a0a0a` — the white
  label on `#7aa2ff` used until now measured 2.5:1.
- Dark `--ink-3` `#737373` → `#8c8c8c` and `--g-ink-mute` `#7a7a7a` → `#8e8e8e`,
  which were below 4.5:1 on the panel and on glass.
- Status tones `--rw-ok`, `--rw-warn` (new) and `--rw-danger`, per theme.
- `data-theme` now themes any element, not only `<html>`. The light block's
  selector is `[data-theme="light"]` (0,1,0) instead of
  `:root[data-theme="light"]` (0,2,0), so an app's own `:root` override placed
  after the import wins without extra specificity.
- `color-scheme` and `accent-color` are set per theme, so scrollbars, native
  form controls, checkboxes and radios follow it.
- Every custom property is declared in `tokens.css`; `controls.css` declares
  none. The control fills, wells, thumbs, radii, elevation and easing moved
  there with their names unchanged.
- `scripts/check-contrast.mjs` (`npm run check`) computes every text pair, the
  focus ring and the glass composites from `tokens.css`, and fails below AA or
  when the two light blocks differ.

### Theme runtime — `@robyrew/ui/theme.js` (new)

- `themeBootstrap` now lives here (web-config re-exports it). It accepts only
  `light` / `dark` from storage and follows OS appearance changes while no
  preference is stored. The string changed: regenerate any CSP hash pinned for
  it.
- `setTheme()`, `getThemePreference()`, `resolveTheme()`, `applyTheme()`,
  `syncThemeColor()` (keeps `<meta name="theme-color">` on the current ground)
  and `initThemeControls()` for `[data-rw-theme-set]` buttons. A switch
  cross-fades with a view transition where available.

### Components

Class names and props from 0.3 are unchanged; everything below is additive
unless it says otherwise.

- Styles moved from scoped `<style>` blocks to one global stylesheet per
  component (`components/GlassBar.css` …), imported by the component, so
  script-created markup (`toast()`) and non-Astro pages can use the same
  classes. `glass.css` bundles all eleven. The rules lost the scoping attribute,
  so page overrides need less specificity.
- No component writes an inline `style` attribute any more (a strict
  `style-src` blocked them): HUD level, player progress and sparkline heights
  are `data-pct`. GlassPlayer's artwork is an `<img>` inside `.rw-player__art`
  (was a background image).
- Common props on all eleven: `theme`, `material` (`'surface'` = the opaque
  twin, `.rw-surface`) and, where they generate text, `labels`.
- Radii and paddings follow one scale (`--rw-r-glass-sm/-/-lg` = 18/22/28) and
  inner corners are computed: `calc(var(--r) - var(--pad))`.
- **GlassBar** folds its links into a popover menu below its collapse width
  (`collapse`: sm/md/lg/always/never, default md = 40rem). It is a size
  container that fills its parent; `fit` restores a shrink-wrapped pill (and
  never collapses). New: `end` and `menu` slots, `action.primary`, a default
  brand mark when no `brand` slot is given, the hint is a `<kbd>` hidden on
  touch-only devices.
- **GlassSheet** `modal` renders a `<dialog>` — docked to the bottom on phones
  with drag-to-dismiss, a centred form sheet from 48rem, returnValue
  `confirm` / `cancel`, `size`, `dismissible`, `open`. The inline sheet is a
  `<section aria-labelledby>`; it claimed `role="dialog" aria-modal="true"`
  while sitting in the page flow.
- **GlassToast** `timeout`, tone `info`, swipe to dismiss; `toast()` raises one
  from script into a `.rw-toaster` live region (`--rw-toast-offset` clears a
  sticky bar). `.rw-toast__act` is rendered only when it has something in it.
- **GlassPalette** filters, keeps an ARIA combobox/listbox, `modal` makes it a
  ⌘K dialog (`shortcut`), rows take `keywords`, `group`, `value`. The inline
  palette's role is `search` (it was `dialog`).
- **GlassPlayer** `media` (drives an `<audio>`/`<video>` and the Media Session
  API), `seekable`, a stacked layout under 20rem and an art-less one under
  13rem.
- **GlassTile** `trend: 'flat'`, `href`, the trend announced in words, the
  figure scales with the tile, bars grow in on scroll where scroll-driven
  animation exists.
- **GlassList** rows take `detail`, `current`, `external`; the label is wrapped
  in `.rw-list__text`; separators inset to the text.
- **GlassRail** `orientation` (`horizontal`, `adaptive`), `labels`, `dock`,
  `label`.
- **GlassHud** `overlay` + `showHud()`.
- **GlassAuthCard** `formAction`, `subtitle`, `busyLabel`, a `footer` slot;
  the submit button is the accent fill (was a light neutral fill with
  `#0b0d12` text); busy state while it submits; 16px fields on touch.
- **GlassFooter** `headingLevel`, `external` links, columns fold into
  disclosures under 30rem.

### Controls

- Heights from `--rw-ctl-h*` (36px on a fine pointer, 44px on a coarse one);
  fields are 16px on touch so iOS does not zoom; hover styles only where the
  device hovers; one focus ring (`--rw-focus`, default the accent).
- New: `.rw-btn--icon`, `aria-busy` on `.rw-btn`, `.rw-actions`,
  `.rw-field--grow`, `:user-invalid`, styled `select.rw-field`, autofill that
  keeps the house fill, `.rw-hint--error`, badge tones, `.rw-range`,
  `.rw-progress`, `.rw-spinner`, `.rw-sr-only`.
- Segmented controls: `behaviors.js` keeps `--n` / `--i` in step with the aria
  state; `data-rw-seg="select"` adds selection, arrow keys and tab panels.
- The switch knob stretches while held; the segment thumb springs.
- Logical properties throughout (right-to-left mirrors).
- `prefers-contrast: more` and forced-colours rules.

### Motion

- Tokens `--rw-dur-1…4`, `--rw-dur-move`, `--rw-ease-out`, `--rw-ease-spring`,
  `--rw-travel`, `--rw-press`, `--rw-lift`; reduced motion zeroes travel,
  press and lift.
- Inside glass, reduced motion now shortens durations to .01ms instead of
  setting `animation: none`, so `animationend` / `transitionend` still fire.

### Other

- `.rw-glass--dense`, `.rw-scroll-edge`, `.rw-bp-daylight`.
- `behaviors.js` (new): `initAll()`, `toast()`, `showHud()`, `openSheet()`,
  `setBusy()`, `syncRange()` and the per-format inits. Plain ESM, no
  dependencies; nothing runs on import.
- Type declarations for `behaviors.js`, `theme.js` and `refraction.js`.
- `preview/`: every component and control in both themes, behaviour demos, an
  environment readout and device frames. Not part of the published files.
