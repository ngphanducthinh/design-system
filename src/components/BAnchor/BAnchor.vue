<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import type { BAnchorDirection, BAnchorItem } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  affix = true,
  bounds = 5,
  direction = 'vertical',
  getContainer,
  offsetTop = 0,
  targetOffset,
  replace = false,
  items = [],
  getCurrentAnchor,
  modelValue,
  ariaLabel = 'Anchor navigation',
} = defineProps<{
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
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires when active anchor changes */
  change: [currentActiveLink: string];
  /** Custom click handler for anchor links */
  click: [e: MouseEvent, link: { href: string; title: string }];
  /** v-model update */
  'update:modelValue': [value: string];
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Custom rendering of anchor item title */
  itemTitle?(props: { item: BAnchorItem; active: boolean }): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const activeLink = ref(modelValue ?? '');
const anchorRef = ref<HTMLElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);
const isAffixed = ref(false);
const scrolling = ref(false);

const isControlled = computed(() => modelValue !== undefined);

// Sync with controlled mode
watch(
  () => modelValue,
  (val) => {
    if (val !== undefined) activeLink.value = val;
  },
);

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-anchor',
  `b-anchor--${direction}`,
  { 'b-anchor--affix': affix && isAffixed.value },
]);

const container = computed<HTMLElement | Window | null>(() => {
  if (getContainer) {
    const c = getContainer();
    return c || null;
  }
  return window;
});

const scrollOffset = computed(() => targetOffset ?? offsetTop);

// ─────────────────────────────────────────────
// Flatten items for scroll detection
// ─────────────────────────────────────────────
function flattenItems(list: BAnchorItem[]): BAnchorItem[] {
  const flat: BAnchorItem[] = [];
  for (const item of list) {
    flat.push(item);
    if (item.children) {
      flat.push(...flattenItems(item.children));
    }
  }
  return flat;
}

const flatItems = computed(() => flattenItems(items));

// ─────────────────────────────────────────────
// Scroll tracking
// ─────────────────────────────────────────────
function getScrollTop(): number {
  const c = container.value;
  if (!c || c === window) return window.scrollY || document.documentElement.scrollTop;
  return (c as HTMLElement).scrollTop;
}

function getOffsetTop(element: HTMLElement): number {
  const c = container.value;
  if (!c || c === window) {
    return element.getBoundingClientRect().top + window.scrollY;
  }
  const containerRect = (c as HTMLElement).getBoundingClientRect();
  const elemRect = element.getBoundingClientRect();
  return elemRect.top - containerRect.top + (c as HTMLElement).scrollTop;
}

function findActiveLink(): string {
  const scrollTop = getScrollTop();
  const offset = scrollOffset.value;

  let active = '';
  for (const item of flatItems.value) {
    const target = document.querySelector(item.href);
    if (!target) continue;

    const top = getOffsetTop(target as HTMLElement) - offset - bounds;
    if (top <= scrollTop) {
      active = item.href;
    }
  }

  if (getCurrentAnchor) {
    return getCurrentAnchor(active);
  }
  return active;
}

function handleScroll() {
  if (scrolling.value) return;

  const newActive = findActiveLink();
  if (newActive !== activeLink.value) {
    if (!isControlled.value) {
      activeLink.value = newActive;
    }
    emit('change', newActive);
    emit('update:modelValue', newActive);
  }

  updateIndicatorPosition();
}

// ─────────────────────────────────────────────
// Indicator position
// ─────────────────────────────────────────────
function updateIndicatorPosition() {
  if (!anchorRef.value || !indicatorRef.value) return;

  const activeEl = anchorRef.value.querySelector<HTMLElement>(
    '.b-anchor-link--active > .b-anchor-link__title',
  );

  if (!activeEl) {
    indicatorRef.value.style.opacity = '0';
    return;
  }

  indicatorRef.value.style.opacity = '1';

  if (direction === 'vertical') {
    const top = activeEl.offsetTop;
    const height = activeEl.offsetHeight;
    indicatorRef.value.style.top = `${top}px`;
    indicatorRef.value.style.height = `${height}px`;
  } else {
    const left = activeEl.offsetLeft;
    const width = activeEl.offsetWidth;
    indicatorRef.value.style.left = `${left}px`;
    indicatorRef.value.style.width = `${width}px`;
  }
}

// ─────────────────────────────────────────────
// Click handling
// ─────────────────────────────────────────────
function handleLinkClick(e: MouseEvent, item: BAnchorItem) {
  emit('click', e, { href: item.href, title: item.title });

  if (e.defaultPrevented) return;

  e.preventDefault();

  activeLink.value = item.href;
  emit('change', item.href);
  emit('update:modelValue', item.href);

  const target = document.querySelector(item.href);
  if (!target) return;

  scrolling.value = true;

  const top = getOffsetTop(target as HTMLElement) - scrollOffset.value;
  const c = container.value;

  if (!c || c === window) {
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    (c as HTMLElement).scrollTo({ top, behavior: 'smooth' });
  }

  if (replace) {
    window.history.replaceState(null, '', item.href);
  } else {
    window.history.pushState(null, '', item.href);
  }

  setTimeout(() => {
    scrolling.value = false;
    updateIndicatorPosition();
  }, 500);
}

// ─────────────────────────────────────────────
// Affix handling
// ─────────────────────────────────────────────
function handleAffixScroll() {
  if (!affix || !anchorRef.value) return;
  const rect = anchorRef.value.getBoundingClientRect();
  isAffixed.value = rect.top <= offsetTop;
}

// ─────────────────────────────────────────────
// Lifecycle - attach scroll listener reactively
// ─────────────────────────────────────────────
let scrollHandler: (() => void) | null = null;
let currentContainer: HTMLElement | Window | null = null;

function attachScrollListener(c: HTMLElement | Window | null) {
  if (!c) return;
  scrollHandler = () => {
    handleScroll();
    handleAffixScroll();
  };
  c.addEventListener('scroll', scrollHandler, { passive: true });
  currentContainer = c;

  // Initial detection
  nextTick(() => {
    handleScroll();
    updateIndicatorPosition();
  });
}

function detachScrollListener() {
  if (scrollHandler && currentContainer) {
    currentContainer.removeEventListener('scroll', scrollHandler);
  }
  scrollHandler = null;
  currentContainer = null;
}

watch(
  container,
  (newC, oldC) => {
    if (oldC && oldC !== newC) detachScrollListener();
    if (newC) attachScrollListener(newC);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  detachScrollListener();
});

// Update indicator when active link changes
watch(activeLink, () => {
  requestAnimationFrame(updateIndicatorPosition);
});
</script>

<template>
  <nav
    ref="anchorRef"
    :class="rootClasses"
    role="navigation"
    :aria-label="ariaLabel"
    :style="affix && isAffixed ? { position: 'fixed', top: `${offsetTop}px` } : undefined"
  >
    <div ref="indicatorRef" class="b-anchor__indicator" aria-hidden="true" />

    <div class="b-anchor__list" role="list">
      <template v-for="item in items" :key="item.key">
        <div
          class="b-anchor-link"
          :class="[{ 'b-anchor-link--active': activeLink === item.href }, item.className]"
          role="listitem"
        >
          <a
            class="b-anchor-link__title"
            :href="item.href"
            :target="item.target"
            :aria-current="activeLink === item.href ? 'location' : undefined"
            :title="item.title"
            @click="handleLinkClick($event, item)"
          >
            <slot name="itemTitle" :item="item" :active="activeLink === item.href">
              {{ item.title }}
            </slot>
          </a>

          <!-- Nested children (vertical only) -->
          <div
            v-if="direction === 'vertical' && item.children?.length"
            class="b-anchor__nested"
            role="list"
          >
            <div
              v-for="child in item.children"
              :key="child.key"
              class="b-anchor-link b-anchor-link--child"
              :class="[{ 'b-anchor-link--active': activeLink === child.href }, child.className]"
              role="listitem"
            >
              <a
                class="b-anchor-link__title"
                :href="child.href"
                :target="child.target"
                :aria-current="activeLink === child.href ? 'location' : undefined"
                :title="child.title"
                @click="handleLinkClick($event, child)"
              >
                <slot name="itemTitle" :item="child" :active="activeLink === child.href">
                  {{ child.title }}
                </slot>
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </nav>
</template>

<style>
/* ─────────────────────────────────────────────
   BAnchor - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-anchor {
  --b-anchor-link-padding-block: 4px;
  --b-anchor-link-padding-inline-start: 16px;
  --b-anchor-indicator-color: oklch(54.6% 0.245 262.881);
  --b-anchor-indicator-width: 2px;
  --b-anchor-link-color: oklch(40% 0.01 260);
  --b-anchor-link-color-active: oklch(54.6% 0.245 262.881);
  --b-anchor-link-color-hover: oklch(54.6% 0.245 262.881);
  --b-anchor-background: transparent;
  --b-anchor-font-size: 14px;
  --b-anchor-line-height: 1.5;
  --b-anchor-transition-duration: 200ms;
  --b-anchor-border-color: oklch(90% 0.005 260);
  --b-anchor-child-indent: 16px;

  position: relative;
  font-size: var(--b-anchor-font-size);
  line-height: var(--b-anchor-line-height);
  background: var(--b-anchor-background);
  box-sizing: border-box;
}

/* ─────────────────────────────────────────────
   Vertical layout
   ───────────────────────────────────────────── */
.b-anchor--vertical .b-anchor__list {
  border-left: var(--b-anchor-indicator-width) solid var(--b-anchor-border-color);
  padding-left: 0;
}

.b-anchor--vertical .b-anchor__indicator {
  position: absolute;
  left: 0;
  width: var(--b-anchor-indicator-width);
  background: var(--b-anchor-indicator-color);
  border-radius: 1px;
  opacity: 0;
  transition:
    top var(--b-anchor-transition-duration) ease,
    height var(--b-anchor-transition-duration) ease,
    opacity var(--b-anchor-transition-duration) ease;
}

.b-anchor--vertical .b-anchor-link__title {
  display: block;
  padding: var(--b-anchor-link-padding-block) var(--b-anchor-link-padding-block)
    var(--b-anchor-link-padding-block) var(--b-anchor-link-padding-inline-start);
}

.b-anchor--vertical .b-anchor-link--child .b-anchor-link__title {
  padding-left: calc(var(--b-anchor-link-padding-inline-start) + var(--b-anchor-child-indent));
}

/* ─────────────────────────────────────────────
   Horizontal layout
   ───────────────────────────────────────────── */
.b-anchor--horizontal .b-anchor__list {
  display: flex;
  flex-direction: row;
  border-bottom: var(--b-anchor-indicator-width) solid var(--b-anchor-border-color);
}

.b-anchor--horizontal .b-anchor__indicator {
  position: absolute;
  bottom: 0;
  height: var(--b-anchor-indicator-width);
  background: var(--b-anchor-indicator-color);
  border-radius: 1px;
  opacity: 0;
  transition:
    left var(--b-anchor-transition-duration) ease,
    width var(--b-anchor-transition-duration) ease,
    opacity var(--b-anchor-transition-duration) ease;
}

.b-anchor--horizontal .b-anchor-link__title {
  display: block;
  padding: var(--b-anchor-link-padding-block) var(--b-anchor-link-padding-inline-start);
  white-space: nowrap;
}

/* ─────────────────────────────────────────────
   Anchor link
   ───────────────────────────────────────────── */
.b-anchor-link {
  box-sizing: border-box;
}

.b-anchor-link__title {
  color: var(--b-anchor-link-color);
  text-decoration: none;
  font-size: inherit;
  line-height: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--b-anchor-transition-duration) ease;
  outline: none;
  border-radius: 2px;
}

.b-anchor-link__title:hover {
  color: var(--b-anchor-link-color-hover);
}

.b-anchor-link__title:focus-visible {
  outline: 2px solid var(--b-anchor-indicator-color);
  outline-offset: 2px;
}

.b-anchor-link--active > .b-anchor-link__title {
  color: var(--b-anchor-link-color-active);
}

/* ─────────────────────────────────────────────
   Affix
   ───────────────────────────────────────────── */
.b-anchor--affix {
  z-index: 10;
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-anchor,
@media (prefers-color-scheme: dark) {
  .b-anchor {
    --b-anchor-link-color: oklch(72% 0.01 260);
    --b-anchor-link-color-active: oklch(70% 0.18 262);
    --b-anchor-link-color-hover: oklch(70% 0.18 262);
    --b-anchor-indicator-color: oklch(70% 0.18 262);
    --b-anchor-border-color: oklch(35% 0.01 260);
  }
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-anchor {
    --b-anchor-transition-duration: 0ms;
  }
}
</style>
