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
  | 'range' | 'progress' | 'spinner' | 'actions';

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
