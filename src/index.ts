// Astro components are consumed as source; there is no build step. Import them
// by path so a consumer only pays for what it uses:
//
//   import Bar from '@robyrew/ui/components/GlassBar.astro';
//   import '@robyrew/ui/tokens.css';    // the glass material
//   import '@robyrew/ui/controls.css';  // cards, fields, buttons, segments
//
// This module exists for the type-level exports only.

/** A format in the Obsidian set. */
export type GlassFormat =
  | 'bar' | 'palette' | 'hud' | 'player' | 'tile'
  | 'list' | 'sheet' | 'rail' | 'auth' | 'toast' | 'footer';

/** Every custom property a consumer may override. A "taste" is only these. */
export interface GlassTokens {
  '--t-alpha'?: string;
  '--t-blur'?: string;
  '--t-sat'?: string;
  '--t-rim'?: string;
  '--t-sh-y'?: string;
  '--t-sh-blur'?: string;
  '--t-sh-a'?: string;
  '--glass-rgb'?: string;
  '--rim-rgb'?: string;
  '--g-ink'?: string;
  '--g-ink-dim'?: string;
}


/** A control in the Apple set (controls.css). Class names are `rw-` prefixed. */
export type ControlName =
  | 'card' | 'field' | 'btn' | 'seg' | 'chip' | 'badge' | 'switch';

/** Custom properties controls.css reads. Overriding --panel, --hair, --ink and
 *  --accent from tokens.css re-themes every control; these are the shape and
 *  elevation knobs on top of that. */
export interface ControlTokens {
  '--rw-r-card'?: string;
  '--rw-r-ctl'?: string;
  '--rw-r-chip'?: string;
  '--rw-fill'?: string;
  '--rw-fill-2'?: string;
  '--rw-fill-3'?: string;
  '--rw-well'?: string;
  '--rw-danger'?: string;
  '--rw-ease'?: string;
}
