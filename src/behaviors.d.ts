export type Root = Document | Element | DocumentFragment;

/** Runs fn(document) once the DOM is parsed and after each Astro client-side navigation. */
export declare function onReady(fn: (doc: Document) => void): void;
/** Binds every behaviour under root. Idempotent. */
export declare function initAll(root?: Root): void;
/** initAll now and after every Astro client-side navigation. */
export declare function autoInit(): void;

export declare function openDialog(target: string | HTMLDialogElement): HTMLDialogElement | null;
export declare function closeDialog(dialog: HTMLDialogElement, value?: string): Promise<void>;
export declare function enablePressStates(): void;
export declare function enableCommands(): void;

export declare function initBars(root?: Root): void;
export declare function initSheets(root?: Root): void;
export declare const openSheet: typeof openDialog;
export declare const closeSheet: typeof closeDialog;
export declare function initPalettes(root?: Root): void;
export declare function initSegments(root?: Root): void;
export declare function initRanges(root?: Root): void;
export declare function syncRange(input: HTMLInputElement): void;
export declare function initPlayers(root?: Root): void;
export declare function initAuth(root?: Root): void;
export declare function setBusy(form: HTMLFormElement, busy: boolean): void;
export declare function initFooters(root?: Root): void;
export declare function initToasts(root?: Root): void;

export interface ToastOptions {
  title: string;
  detail?: string;
  tone?: 'ok' | 'warn' | 'error' | 'info';
  action?: { label: string; href?: string; onClick?: (e: MouseEvent) => void };
  /** Milliseconds before it dismisses itself; 0 keeps it until dismissed. Default 5000. */
  timeout?: number;
  dismissible?: boolean;
  placement?: 'top' | 'bottom';
  labels?: { dismiss?: string; region?: string };
}
export declare function toast(opts: ToastOptions): { el: HTMLElement; dismiss: () => Promise<void> };
export declare function dismissToast(el: HTMLElement): Promise<void>;

export interface HudOptions { value?: number; caption?: string; glyph?: string; timeout?: number }
export declare function showHud(target: string | HTMLElement, opts?: HudOptions): void;
export declare function hideHud(target: string | HTMLElement): void;

export {
  initThemeControls,
  setTheme,
  getThemePreference,
  resolveTheme,
  applyTheme,
  syncThemeColor,
} from './theme.js';

declare global {
  interface HTMLElementEventMap {
    'rw:select': CustomEvent<{ row: HTMLElement; value: string | null }>;
    'rw:change': CustomEvent<{ index: number; item: HTMLElement; value: string | null }>;
    'rw:dismiss': CustomEvent<undefined>;
    'rw:play': CustomEvent<undefined>;
    'rw:pause': CustomEvent<undefined>;
    'rw:prev': CustomEvent<undefined>;
    'rw:next': CustomEvent<undefined>;
    'rw:seek': CustomEvent<{ value: number }>;
  }
}
