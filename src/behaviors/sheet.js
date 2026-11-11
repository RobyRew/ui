/* GlassSheet as a modal: <dialog data-rw-sheet>.
 *
 * Opens from <button commandfor="id" command="show-modal"> (native, or the
 * fallback in core.js) or openSheet(id). Closes through its exit animation on
 * Escape, the close button, the action button (returnValue "confirm") and a
 * backdrop click. While the sheet is docked to the bottom edge — phones, and
 * any viewport under 48rem — it can also be dragged down to dismiss.
 */
import { bindModal, closeDialog, dragAxis, enableCommands, enablePressStates, openDialog, registry, reducedMotion } from './core.js';

const claim = registry();

export const openSheet = openDialog;
export const closeSheet = closeDialog;

/** Docked = anchored to the bottom edge. The CSS publishes it as a custom
 *  property so the script and the stylesheet agree on the breakpoint. */
const docked = (dialog) => getComputedStyle(dialog).getPropertyValue('--rw-sheet-docked').trim() === '1';

function bindSheet(dialog) {
  if (!claim(dialog)) return;
  const dismissible = dialog.dataset.rwDismissible !== 'false';
  bindModal(dialog, { dismissible });

  // Rendered with `open` for no-script visitors: promote to a real modal.
  if (dialog.open && !dialog.matches(':modal')) openDialog(dialog);

  const zone = dialog.querySelector('[data-rw-sheet-drag]');
  if (!zone || !dismissible) return;
  let height = 0;
  dragAxis(zone, {
    axis: 'y',
    onStart: () => {
      if (!docked(dialog) || dialog.classList.contains('is-closing')) return false;
      height = dialog.getBoundingClientRect().height;
      dialog.classList.add('is-dragging');
      return true;
    },
    onMove: (dy) => {
      // Down follows the finger; up resists, so the sheet cannot be pulled
      // off its edge.
      const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2;
      dialog.style.setProperty('--rw-drag', `${y}px`);
    },
    onEnd: (dy, v) => {
      dialog.classList.remove('is-dragging');
      const flick = v > 0.55 && dy > 24;
      if (dy > height * 0.3 || flick) {
        closeDialog(dialog, 'cancel');
      } else {
        // Snap back. The transition on `translate` springs it home.
        dialog.style.setProperty('--rw-drag', '0px');
        if (reducedMotion()) dialog.style.removeProperty('--rw-drag');
      }
    },
  });
}

export function initSheets(root = document) {
  enableCommands();
  enablePressStates();
  for (const d of root.querySelectorAll('dialog[data-rw-sheet]')) bindSheet(d);
}
