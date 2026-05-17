export interface BAnchorItem {
  /** Unique key for the item */
  key: string;
  /** Target element selector (e.g., '#section-1') */
  href: string;
  /** Display title for the link */
  title: string;
  /** Link target attribute (e.g., '_blank') */
  target?: string;
  /** Nested child items (vertical direction only) */
  children?: BAnchorItem[];
  /** Custom class for this item */
  className?: string;
}

export type BAnchorDirection = 'vertical' | 'horizontal';

export interface BAnchorProps {
  /** Whether to show affix (fixed positioning) */
  affix?: boolean;
  /** Bounding distance of anchor area in pixels */
  bounds?: number;
  /** Layout direction */
  direction?: BAnchorDirection;
  /** Scrolling container reference */
  getContainer?: () => HTMLElement | Window;
  /** Pixels to offset from top when calculating scroll position */
  offsetTop?: number;
  /** Anchor scroll offset for target elements */
  targetOffset?: number;
  /** Whether to replace browser history instead of push */
  replace?: boolean;
  /** Data-driven link items */
  items?: BAnchorItem[];
  /** Custom logic to determine the current active link */
  getCurrentAnchor?: (activeLink: string) => string;
  /** Currently active link (controlled mode via v-model) */
  modelValue?: string;
  /** Accessible label for the navigation landmark */
  ariaLabel?: string;
}
