/** "system" means no stored preference: the theme follows the OS. */
export type ThemePreference = 'light' | 'dark' | 'system';

export declare const THEME_KEY: 'theme';
export declare const ACCENT_KEY: 'accent';

/** The pre-paint stamp, as a string to inline in <head> before any stylesheet. */
export declare const themeBootstrap: string;

export declare function getThemePreference(): ThemePreference;
export declare function resolveTheme(pref?: ThemePreference): 'light' | 'dark';
export declare function applyTheme(pref?: ThemePreference): void;
export declare function setTheme(pref: ThemePreference, opts?: { animate?: boolean }): void;
export declare function syncThemeColor(): void;
export declare function initThemeControls(): void;

declare global {
  interface DocumentEventMap {
    'rw:themechange': CustomEvent<{ preference: ThemePreference; theme: 'light' | 'dark' }>;
  }
}
