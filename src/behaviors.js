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
import { initCopy } from './behaviors/copy.js';
import { initFilters } from './behaviors/filters.js';
import { initFooters } from './behaviors/footer.js';
import { initLoadMore } from './behaviors/loadmore.js';
import { initPalettes } from './behaviors/palette.js';
import { initAvatars } from './behaviors/people.js';
import { initPlayers } from './behaviors/player.js';
import { initPopovers } from './behaviors/popover.js';
import { initRanges } from './behaviors/range.js';
import { initSegments } from './behaviors/seg.js';
import { initSheets } from './behaviors/sheet.js';
import { initSiteHeads } from './behaviors/sitehead.js';
import { initSocial } from './behaviors/social.js';
import { initRelativeTimes } from './behaviors/time.js';
import { initToasts } from './behaviors/toast.js';
import { initThemeControls } from './theme.js';

export { onReady, openDialog, closeDialog, enablePressStates, enableCommands, markJs } from './behaviors/core.js';
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
// App kit (0.5)
export { initSiteHeads } from './behaviors/sitehead.js';
export { initPopovers, openPopover, closePopover } from './behaviors/popover.js';
export { initFilters } from './behaviors/filters.js';
export { initAvatars, avatarHue, initials, AVATAR_HUES } from './behaviors/people.js';
export { initSocial, setReaction, setLike } from './behaviors/social.js';
export { formatCount } from './behaviors/format.js';
export { initCopy, copyText } from './behaviors/copy.js';
export { initLoadMore, loadMore } from './behaviors/loadmore.js';
export { initRelativeTimes, formatRelative, formatAbsolute } from './behaviors/time.js';

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
  initSiteHeads(root);
  initPopovers(root);
  initFilters();
  initAvatars(root);
  initSocial(root);
  initCopy();
  initLoadMore(root);
  initRelativeTimes(root);
  initThemeControls();
}

/** initAll now and after every Astro client-side navigation. */
export function autoInit() {
  onReady(initAll);
}
