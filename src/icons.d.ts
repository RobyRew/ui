export type IconName =
  | 'upload' | 'download' | 'folder' | 'file' | 'fileText' | 'package' | 'braces' | 'globe' | 'send'
  | 'chevronLeft' | 'chevronRight' | 'chevronDown' | 'chevronUp' | 'arrowLeft' | 'arrowRight' | 'more'
  | 'search' | 'x' | 'check' | 'checkCircle' | 'sliders' | 'message' | 'users' | 'calendar' | 'clock'
  | 'image' | 'video' | 'film' | 'mic' | 'music' | 'smile' | 'smilePlus' | 'paperclip' | 'pin' | 'contact'
  | 'userCircle' | 'poll' | 'checklist' | 'phone' | 'info' | 'alert' | 'lock' | 'shield' | 'sun' | 'moon'
  | 'monitor' | 'menu' | 'list' | 'undo' | 'trash' | 'minusCircle' | 'plusCircle' | 'swap' | 'forward'
  | 'reply' | 'pencil' | 'zap' | 'book' | 'code' | 'filter' | 'sort' | 'layers' | 'plus' | 'minus'
  | 'heart' | 'copy' | 'link' | 'external' | 'logIn' | 'logOut' | 'flag' | 'refresh' | 'eye' | 'history'
  | 'tag' | 'hash' | 'server' | 'cloud' | 'archive' | 'activity' | 'xCircle' | 'helpCircle' | 'bell'
  | 'terminal' | 'cpu'
  | 'windows' | 'apple' | 'linux' | 'android' | 'store';

export type PlatformMark = 'windows' | 'apple' | 'linux' | 'android' | 'store';

/** The inner markup of each icon, for a 24×24 viewBox. */
export declare const ICON_PATHS: Record<IconName, string>;
export declare const PLATFORM_MARKS: readonly PlatformMark[];

export interface IconOptions {
  /** Pixels; default 18. */
  size?: number;
  /** Gives the icon role="img" and this accessible name. Without it the icon is aria-hidden. */
  label?: string;
  class?: string;
}

/** The icon as an SVG string. */
export declare function iconSvg(name: IconName, opts?: IconOptions): string;
/** The icon as an element (browser only). */
export declare function icon(name: IconName, opts?: IconOptions): SVGSVGElement;
