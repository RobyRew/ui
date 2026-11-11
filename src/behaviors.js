/* @robyrew/ui — behaviours, for pages that are not built from the Astro
 * components (React islands, plain HTML) or that raise toasts and HUDs from
 * script.
 *
 *     import { initAll, toast } from '@robyrew/ui/behaviors.js';
 *     initAll();                         // binds everything on the page
 *     toast({ title: 'Saved.' });
 *
 * The Astro components already load the part they need, so an Astro page only
 * needs this module for the imperative helpers. Every export is plain ESM with
 * no dependencies; nothing runs on import.
 */
import { onReady } from './behaviors/core.js';
import { initAuth } from './behaviors/auth.js';
import { initBars } from './behaviors/bar.js';
import { initFooters } from './behaviors/footer.js';
import { initPalettes } from './behaviors/palette.js';
import { initPlayers } from './behaviors/player.js';
import { initRanges } from './behaviors/range.js';
import { initSegments } from './behaviors/seg.js';
import { initSheets } from './behaviors/sheet.js';
import { initToasts } from './behaviors/toast.js';
import { initThemeControls } from './theme.js';

export { onReady, openDialog, closeDialog, enablePressStates, enableCommands } from './behaviors/core.js';
export { initAuth, setBusy } from './behaviors/auth.js';
export { initBars } from './behaviors/bar.js';
export { initFooters } from './behaviors/footer.js';
export { showHud, hideHud } from './behaviors/hud.js';
export { initPalettes } from './behaviors/palette.js';
export { initPlayers } from './behaviors/player.js';
export { initRanges, syncRange } from './behaviors/range.js';
export { initSegments } from './behaviors/seg.js';
export { initSheets, openSheet, closeSheet } from './behaviors/sheet.js';
export { initToasts, toast, dismissToast } from './behaviors/toast.js';
export { initThemeControls, setTheme, getThemePreference, resolveTheme, applyTheme, syncThemeColor } from './theme.js';

/** Binds every behaviour under root. Idempotent. */
export function initAll(root = document) {
  initBars(root);
  initSheets(root);
  initToasts(root);
  initPalettes(root);
  initSegments(root);
  initRanges(root);
  initPlayers(root);
  initAuth(root);
  initFooters(root);
  initThemeControls();
}

/** initAll now and after every Astro client-side navigation. */
export function autoInit() {
  onReady(initAll);
}
