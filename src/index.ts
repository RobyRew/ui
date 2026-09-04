// Astro components are consumed as source; there is no build step. Import them
// by path so a consumer only pays for what it uses:
//
//   import Bar from '@robyrew/ui/components/GlassBar.astro';
//   import '@robyrew/ui/tokens.css';
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
