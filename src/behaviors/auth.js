/* GlassAuthCard: validity marks and a busy state while the form submits.
 *
 * On submit, an invalid form is left to the browser's own messages and the
 * failing fields get aria-invalid (cleared as soon as they become valid). A
 * valid form that the page did not intercept marks its submit button
 * aria-busy="true" — a spinner, and no second submission while the next page
 * loads. A page that submits with fetch (calls preventDefault) gets no busy
 * state; it can call setBusy(form, true/false) itself. Coming back through the
 * back/forward cache clears it.
 */
import { enablePressStates, registry } from './core.js';

const claim = registry();

export function setBusy(form, busy) {
  for (const btn of form.querySelectorAll('button[type="submit"], button:not([type]), input[type="submit"]')) {
    if (busy) {
      btn.setAttribute('aria-busy', 'true');
      const label = btn.getAttribute('data-busy-label');
      if (label && btn instanceof HTMLButtonElement) {
        btn.dataset.rwIdleLabel = btn.textContent ?? '';
        btn.textContent = label;
      }
    } else {
      btn.removeAttribute('aria-busy');
      if (btn instanceof HTMLButtonElement && btn.dataset.rwIdleLabel != null) {
        btn.textContent = btn.dataset.rwIdleLabel;
        delete btn.dataset.rwIdleLabel;
      }
    }
  }
}

function bindAuth(form) {
  if (!claim(form)) return;
  form.addEventListener('invalid', (e) => {
    const field = e.target;
    if (field instanceof HTMLElement) field.setAttribute('aria-invalid', 'true');
  }, true);
  form.addEventListener('input', (e) => {
    const field = e.target;
    if (field instanceof HTMLInputElement && field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
      field.removeAttribute('aria-invalid');
    }
  });
  form.addEventListener('submit', (e) => {
    // Read defaultPrevented after every other submit listener has run.
    setTimeout(() => {
      if (!e.defaultPrevented && form.checkValidity()) setBusy(form, true);
    });
  });
  addEventListener('pageshow', (e) => { if (e.persisted) setBusy(form, false); });
}

export function initAuth(root = document) {
  enablePressStates();
  for (const form of root.querySelectorAll('form[data-rw-auth]')) bindAuth(form);
}
