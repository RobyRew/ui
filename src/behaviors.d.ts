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
/** Puts .js on <html> (themeBootstrap already does, before the first paint). */
export declare function markJs(): void;

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

/* ── App kit (0.5) ─────────────────────────────────────────────── */

/** SiteHeader: --site-head, the phone menu, the theme switch. */
export declare function initSiteHeads(root?: Root): void;

export interface PopoverOptions {
  /** Hang it from this element (end-aligned under it, or above it). */
  anchor?: Element;
  /** Put it at a point instead (a context menu). */
  at?: { x: number; y: number };
  /** Focus the first menu item, as a keyboard-opened menu does. */
  keyboard?: boolean;
}
export declare function initPopovers(root?: Root): void;
export declare function openPopover(target: string | HTMLDialogElement, opts?: PopoverOptions): HTMLDialogElement | null;
export declare function closePopover(target: string | HTMLDialogElement, value?: string): Promise<void>;

/** SearchField, ActiveFilters, autosubmit forms (delegated; call once). */
export declare function initFilters(): void;

export declare const AVATAR_HUES: 8;
/** A stable tint index, 0–7, for a name or handle. */
export declare function avatarHue(label?: string): number;
/** Up to two letters for a name or handle. */
export declare function initials(label?: string): string;
/** Swaps avatar pictures that fail to load for their initials. */
export declare function initAvatars(root?: Root): void;

/** Reactions, likes and composers. */
export declare function initSocial(root?: Root): void;
export declare function setReaction(bar: Element, emoji: string, state: { count: number; mine?: boolean; animate?: boolean }): void;
export declare function setLike(button: Element, state: { liked: boolean; count: number; animate?: boolean }): void;
/** 1234 → "1.2K" in the given language. */
export declare function formatCount(n: number, locale?: string): string;

export declare function initCopy(): void;
/** Resolves false where the clipboard is refused. */
export declare function copyText(text: string): Promise<boolean>;

export declare function initLoadMore(root?: Root): void;
/** Loads the next page of a LoadMore now; resolves false on failure. */
export declare function loadMore(target: string | Element): Promise<boolean | undefined>;

export declare function initRelativeTimes(root?: Root): void;
export declare function formatRelative(date: Date | string | number, opts?: { now?: Date | number; locale?: string }): string;
export declare function formatAbsolute(date: Date | string | number, locale?: string): string;

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
    /** A palette row or a menu item was chosen. Cancelable: keeps a menu open. */
    'rw:select': CustomEvent<{ row: HTMLElement; value: string | null }>;
    /** A reaction was pressed. Cancelable: "the page persists it" (a form bar then does not post). */
    'rw:react': CustomEvent<{ emoji: string; mine: boolean; count: number; previous: { mine: boolean; count: number } }>;
    /** A like was pressed. Cancelable, as rw:react. */
    'rw:like': CustomEvent<{ liked: boolean; count: number; previous: { liked: boolean; count: number } }>;
    /** An active filter chip was removed. Cancelable: the chip stays. */
    'rw:remove': CustomEvent<{ name: string | null; value: string | null; chip: HTMLElement }>;
    /** "Clear all" in ActiveFilters. Cancelable. */
    'rw:clear': CustomEvent<Record<string, never>>;
    /** A value was copied. */
    'rw:copy': CustomEvent<{ value: string }>;
    /** LoadMore appended a page. */
    'rw:loaded': CustomEvent<{ added: Element[]; next: string | null }>;
    'rw:loaderror': CustomEvent<{ error: unknown }>;
    'rw:change': CustomEvent<{ index: number; item: HTMLElement; value: string | null }>;
    'rw:dismiss': CustomEvent<undefined>;
    'rw:play': CustomEvent<undefined>;
    'rw:pause': CustomEvent<undefined>;
    'rw:prev': CustomEvent<undefined>;
    'rw:next': CustomEvent<undefined>;
    'rw:seek': CustomEvent<{ value: number }>;
  }
}
