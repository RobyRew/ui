/** The app-kit preview pages, in the order the index lists them. */
export interface KitPage { slug: string; name: string; blurb: string }
export interface KitGroup { title: string; pages: KitPage[] }

export const KIT: KitGroup[] = [
  {
    title: 'Header and overlays',
    pages: [
      { slug: 'site-header', name: 'SiteHeader', blurb: '18px glass bar, icon theme switch, account slot, --site-head, the 760px menu.' },
      { slug: 'popover', name: 'Popover', blurb: 'Opaque panel: hangs from its button, a bottom sheet under 40rem.' },
      { slug: 'menu', name: 'Menu', blurb: 'Actions in a Popover: arrow keys, type-ahead, radios, status dots.' },
    ],
  },
  {
    title: 'Filters',
    pages: [
      { slug: 'chip-select', name: 'ChipSelect', blurb: 'A native select inside a chip; tints when set.' },
      { slug: 'filter-chip', name: 'FilterChip', blurb: 'A checkbox or radio as a chip, with a count.' },
      { slug: 'search-field', name: 'SearchField', blurb: 'Capsule search with clear, Escape and a shortcut key.' },
      { slug: 'active-filters', name: 'ActiveFilters', blurb: 'The filters in force, each removable.' },
    ],
  },
  {
    title: 'People',
    pages: [
      { slug: 'avatar', name: 'Avatar', blurb: 'Picture or initials on a tint; data-hue and data-size.' },
      { slug: 'user-chip', name: 'UserChip', blurb: 'Avatar and @handle, linked.' },
    ],
  },
  {
    title: 'Social',
    pages: [
      { slug: 'reaction-bar', name: 'ReactionBar', blurb: 'Emoji reactions, counts and a picker.' },
      { slug: 'like-button', name: 'LikeButton', blurb: 'A heart and a count.' },
      { slug: 'comment', name: 'Comment', blurb: 'Avatar, handle, relative time, body, actions, replies.' },
      { slug: 'composer', name: 'Composer', blurb: 'A comment box that grows with its text.' },
    ],
  },
  {
    title: 'Downloads',
    pages: [
      { slug: 'split-button', name: 'SplitButton', blurb: 'A primary action and a menu of mirrors with status dots.' },
      { slug: 'copy-field', name: 'CopyField', blurb: 'A monospace value and a copy button.' },
      { slug: 'status-dot', name: 'StatusDot', blurb: 'ok / warn / danger / unknown.' },
    ],
  },
  {
    title: 'States and layout',
    pages: [
      { slug: 'empty-state', name: 'EmptyState', blurb: 'What an empty list says.' },
      { slug: 'skeleton', name: 'Skeleton', blurb: 'Placeholder shapes while content loads.' },
      { slug: 'load-more', name: 'LoadMore', blurb: 'Fetches the next page and appends it in place.' },
      { slug: 'table', name: 'rw-table', blurb: 'Data table: sortable heads, stacked rows on a phone.' },
      { slug: 'page-head', name: 'PageHead', blurb: 'Eyebrow, h1, lead.' },
      { slug: 'disclosure', name: 'Disclosure', blurb: 'A <details> section; an accordion with name.' },
      { slug: 'callout', name: 'Callout', blurb: 'A note in the accent or a status tone.' },
    ],
  },
  {
    title: 'Icons',
    pages: [
      { slug: 'icons', name: 'Icons', blurb: '@robyrew/ui/icons and the platform marks.' },
    ],
  },
];

export const ALL = KIT.flatMap((g) => g.pages);
export const THEMES = ['dark', 'light'] as const;
export type PaneTheme = (typeof THEMES)[number];
