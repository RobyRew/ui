// Astro components are consumed as source; there is no build step. Import them
// by path so a consumer only pays for what it uses:
//
//   import Bar from '@robyrew/ui/components/GlassBar.astro';
//   import '@robyrew/ui/tokens.css';    // every token, the themes, the material
//   import '@robyrew/ui/controls.css';  // cards, fields, buttons, segments, …
//
// Runtime helpers live in their own modules:
//
//   import { toast, showHud, initAll } from '@robyrew/ui/behaviors.js';
//   import { setTheme, themeBootstrap } from '@robyrew/ui/theme.js';
//   import { icon, iconSvg } from '@robyrew/ui/icons';
//
// This module exists for the type-level exports only.

/** A format in the Obsidian set. */
export type GlassFormat =
  | 'bar' | 'palette' | 'hud' | 'player' | 'tile'
  | 'list' | 'sheet' | 'rail' | 'auth' | 'toast' | 'footer';

/** Every component takes these two. */
export type Material = 'glass' | 'surface';
export type Theme = 'light' | 'dark';

/** The material's custom properties. A "taste" is only these; each theme
 *  block in tokens.css sets its own values. */
export interface GlassTokens {
  '--t-alpha'?: string;
  '--t-alpha-dense'?: string;
  '--t-blur'?: string;
  '--t-sat'?: string;
  '--t-rim'?: string;
  '--t-edge'?: string;
  '--t-sh-y'?: string;
  '--t-sh-blur'?: string;
  '--t-sh-a'?: string;
  '--glass-rgb'?: string;
  '--rim-rgb'?: string;
  '--edge-rgb'?: string;
  '--shadow-rgb'?: string;
  '--g-ink'?: string;
  '--g-ink-dim'?: string;
  '--g-ink-mute'?: string;
  '--g-fill'?: string;
  '--g-fill-2'?: string;
  '--g-fill-3'?: string;
  '--g-hair'?: string;
  '--g-track'?: string;
  '--g-meter'?: string;
}

/** The page palette. Overriding these re-themes every control. */
export interface PageTokens {
  '--ground'?: string;
  '--ground-2'?: string;
  '--panel'?: string;
  '--hair'?: string;
  '--hair-soft'?: string;
  '--ink'?: string;
  '--ink-2'?: string;
  '--ink-3'?: string;
  '--accent'?: string;
  '--accent-soft'?: string;
  '--on-accent'?: string;
}

/** A control in the Apple set (controls.css). Class names are `rw-` prefixed. */
export type ControlName =
  | 'card' | 'field' | 'btn' | 'seg' | 'chip' | 'badge' | 'switch'
  | 'range' | 'progress' | 'spinner' | 'actions'
  // Content primitives (0.5)
  | 'icon' | 'avatar' | 'avatars' | 'userchip' | 'dot' | 'status' | 'skeleton'
  | 'empty' | 'load-more' | 'table' | 'table-wrap' | 'page-head' | 'disclosure' | 'callout';

/** Shape, motion and state knobs. All defined in tokens.css. */
export interface ControlTokens {
  '--rw-r-card'?: string;
  '--rw-r-ctl'?: string;
  '--rw-r-ctl-sm'?: string;
  '--rw-r-ctl-lg'?: string;
  '--rw-r-chip'?: string;
  '--rw-r-glass-sm'?: string;
  '--rw-r-glass'?: string;
  '--rw-r-glass-lg'?: string;
  '--rw-e1'?: string;
  '--rw-e2'?: string;
  '--rw-e3'?: string;
  '--rw-e4'?: string;
  '--rw-av-0'?: string;
  '--rw-av-1'?: string;
  '--rw-av-2'?: string;
  '--rw-av-3'?: string;
  '--rw-av-4'?: string;
  '--rw-av-5'?: string;
  '--rw-av-6'?: string;
  '--rw-av-7'?: string;
  '--rw-av-ink'?: string;
  '--g-emoji'?: string;
  '--site-max'?: string;
  '--gutter'?: string;
  '--site-head'?: string;
  '--rw-ctl-h'?: string;
  '--rw-ctl-h-sm'?: string;
  '--rw-ctl-h-lg'?: string;
  '--rw-field-fs'?: string;
  '--rw-fill'?: string;
  '--rw-fill-2'?: string;
  '--rw-fill-3'?: string;
  '--rw-well'?: string;
  '--rw-thumb'?: string;
  '--rw-thumb-sh'?: string;
  '--rw-knob'?: string;
  '--rw-scrim'?: string;
  '--rw-ok'?: string;
  '--rw-warn'?: string;
  '--rw-danger'?: string;
  '--rw-focus'?: string;
  '--rw-focus-w'?: string;
  '--rw-focus-o'?: string;
  '--rw-ease'?: string;
  '--rw-ease-out'?: string;
  '--rw-ease-spring'?: string;
  '--rw-dur-1'?: string;
  '--rw-dur-2'?: string;
  '--rw-dur-3'?: string;
  '--rw-dur-4'?: string;
  '--rw-dur-move'?: string;
  '--rw-travel'?: string;
  '--rw-press'?: string;
  '--rw-lift'?: string;
}

export type { ThemePreference } from './theme.js';
export type { IconName, PlatformMark } from './icons.js';

/* ── App kit (0.5) ────────────────────────────────────────────────
 * Opaque content-layer components for app pages, plus SiteHeader (glass).
 * Imported by path like the glass formats:
 *   import SiteHeader from '@robyrew/ui/components/SiteHeader.astro';
 */
import type { IconName } from './icons.js';

/** A component in the app kit. */
export type KitComponent =
  | 'SiteHeader' | 'Popover' | 'Menu'
  | 'ChipSelect' | 'FilterChip' | 'SearchField' | 'ActiveFilters'
  | 'Avatar' | 'UserChip'
  | 'ReactionBar' | 'LikeButton' | 'Comment' | 'Composer'
  | 'SplitButton' | 'CopyField' | 'StatusDot'
  | 'EmptyState' | 'Skeleton' | 'LoadMore' | 'PageHead' | 'Disclosure' | 'Callout'
  | 'Icon';

/** A health or availability state (StatusDot, mirror menus). */
export type Status = 'ok' | 'warn' | 'danger' | 'unknown';

/** A link in SiteHeader's bar and its phone menu. */
export interface SiteLink {
  label: string;
  href: string;
  current?: boolean;
  icon?: IconName;
}

/** One item in a Menu. A link when it has an href, a button otherwise. */
export interface MenuItem {
  label: string;
  href?: string;
  /** Sent as rw:select's detail.value (default the label). */
  value?: string;
  icon?: IconName;
  /** A status dot in place of the icon. */
  dot?: Status;
  /** A second, quieter line. */
  hint?: string;
  /** Text at the end of the row (a size, a shortcut). */
  tail?: string;
  danger?: boolean;
  disabled?: boolean;
  /** Makes it a menuitemradio (or a menuitemcheckbox with role: 'checkbox'). */
  checked?: boolean;
  role?: 'radio' | 'checkbox';
  /** rel="noopener" on a link that leaves the site. */
  external?: boolean;
  /** The download attribute: true, or a file name. */
  download?: boolean | string;
}
export type MenuEntry = MenuItem | { heading: string } | 'separator' | null | false | undefined;

/** A download mirror in a SplitButton. Without an href it is listed but disabled. */
export interface Mirror {
  label: string;
  href?: string | null;
  status?: Status;
  hint?: string;
  tail?: string;
  disabled?: boolean;
  download?: boolean | string;
  external?: boolean;
  value?: string;
}

/** One reaction in a ReactionBar. */
export interface Reaction {
  emoji: string;
  count: number;
  /** The reader reacted with it. */
  mine?: boolean;
  /** A tooltip ("You and 2 others"). */
  label?: string;
}

/** An option of a ChipSelect. */
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** One chip of ActiveFilters: a link without the filter, or a button. */
export interface ActiveFilter {
  label: string;
  href?: string;
  name?: string;
  value?: string;
}
