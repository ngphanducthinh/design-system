<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import type { BIconBrandName, BIconName } from '@/components/BIcon/BIconEnum.ts';
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { BContextMenuItem } from './types.ts';

const {
  items,
  disabled = false,
  id: idProp,
  ariaLabel = 'Context menu',
} = defineProps<{
  /** Items to render. Each item is either a regular entry (with `label`) or a divider (`{ divider: true, key }`). */
  items: BContextMenuItem[];
  /** When true, the trigger area ignores `contextmenu` events — the menu cannot be opened. @default false */
  disabled?: boolean;
  /** Optional explicit `id` for the menu element. Falls back to a per-instance auto-generated id. */
  id?: string;
  /** Accessible label announced when the menu opens. @default 'Context menu' */
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  /** Emitted when an item is activated (click or Enter/Space). Not emitted for dividers or disabled items. */
  select: [item: BContextMenuItem, event: Event];
  /** Emitted when the menu opens via `contextmenu` (or `open()`). */
  open: [event: MouseEvent];
  /** Emitted when the menu closes. */
  close: [];
}>();

defineSlots<{
  /** The trigger area. The component listens for `contextmenu` on the wrapping element. */
  default?(): unknown;
  /** Optional per-item override. Receives `{ item, active }`. */
  item?(props: { item: BContextMenuItem; active: boolean }): unknown;
}>();

// ── Identity ────────────────────────────────────────────────────────────────
const { componentUID } = useComponentId();
const baseId = computed(() => idProp ?? `b-context-menu-${componentUID.value}`);
const optionId = (i: number) => `${baseId.value}-item-${i}`;

// ── State ───────────────────────────────────────────────────────────────────
const isOpen = ref(false);
const x = ref(0);
const y = ref(0);
const activeIndex = ref(-1);
const menuRef = ref<HTMLUListElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

// ── Activatable items (skip dividers + disabled) ────────────────────────────
const isActivatable = (item: BContextMenuItem): boolean =>
  !item.divider && !item.disabled;

const firstActivatableIndex = (): number => items.findIndex(isActivatable);
const lastActivatableIndex = (): number => {
  for (let i = items.length - 1; i >= 0; i--) {
    if (isActivatable(items[i]!)) return i;
  }
  return -1;
};

const moveActive = (delta: number) => {
  if (items.length === 0) return;
  const len = items.length;
  let next = activeIndex.value;
  for (let step = 0; step < len; step++) {
    next = ((next + delta) % len + len) % len;
    if (isActivatable(items[next]!)) {
      activeIndex.value = next;
      return;
    }
  }
};

const setActiveByIndex = (idx: number) => {
  if (idx < 0 || idx >= items.length) return;
  if (isActivatable(items[idx]!)) {
    activeIndex.value = idx;
  }
};

const activeId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
);

// ── Open / close ────────────────────────────────────────────────────────────
const handleContextMenu = (event: MouseEvent) => {
  if (disabled) return;
  openAt(event.clientX, event.clientY, event);
};

const openAt = (px: number, py: number, event?: MouseEvent) => {
  if (typeof document !== 'undefined') {
    previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;
  }
  x.value = px;
  y.value = py;
  activeIndex.value = firstActivatableIndex();
  isOpen.value = true;
  // Synthesize a MouseEvent-like object if called programmatically.
  const evt =
    event ??
    (typeof MouseEvent !== 'undefined'
      ? new MouseEvent('contextmenu', { clientX: px, clientY: py })
      : ({ clientX: px, clientY: py } as MouseEvent));
  emit('open', evt);
};

const close = () => {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit('close');
};

// Public API.
const openProgrammatic = (px: number, py: number) => {
  openAt(px, py);
};

defineExpose({
  /** Open the menu programmatically at viewport coordinates. */
  open: openProgrammatic,
  /** Close the menu programmatically. */
  close,
});

// ── Position clamping & focus ───────────────────────────────────────────────
const clampPosition = () => {
  if (typeof window === 'undefined') return;
  const el = menuRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth || 0;
  const vh = window.innerHeight || 0;
  let nx = x.value;
  let ny = y.value;
  if (nx + rect.width > vw) {
    nx = Math.max(0, nx - rect.width);
  }
  if (ny + rect.height > vh) {
    ny = Math.max(0, ny - rect.height);
  }
  x.value = nx;
  y.value = ny;
};

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    clampPosition();
    menuRef.value?.focus();
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', onDocumentMouseDown, true);
    }
  } else {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', onDocumentMouseDown, true);
    }
    activeIndex.value = -1;
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      try {
        previouslyFocused.focus();
      } catch {
        // ignore — element may have been removed
      }
    }
    previouslyFocused = null;
  }
});

// ── Click-outside ───────────────────────────────────────────────────────────
const onDocumentMouseDown = (event: MouseEvent) => {
  if (!isOpen.value) return;
  const target = event.target as Node | null;
  if (target && menuRef.value && menuRef.value.contains(target)) return;
  close();
};

// ── Selection ───────────────────────────────────────────────────────────────
const selectItem = (item: BContextMenuItem, event: Event) => {
  if (item.divider || item.disabled) return;
  try {
    item.onSelect?.();
  } finally {
    emit('select', item, event);
    close();
  }
};

const onItemClick = (item: BContextMenuItem, idx: number, event: MouseEvent) => {
  if (item.divider || item.disabled) return;
  setActiveByIndex(idx);
  selectItem(item, event);
};

const onItemMouseEnter = (item: BContextMenuItem, idx: number) => {
  if (item.divider || item.disabled) return;
  activeIndex.value = idx;
};

// ── Keyboard ────────────────────────────────────────────────────────────────
const onKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActive(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveActive(-1);
      break;
    case 'Home':
      event.preventDefault();
      setActiveByIndex(firstActivatableIndex());
      break;
    case 'End':
      event.preventDefault();
      setActiveByIndex(lastActivatableIndex());
      break;
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const idx = activeIndex.value;
      if (idx >= 0 && idx < items.length) {
        const item = items[idx]!;
        if (isActivatable(item)) {
          selectItem(item, event);
        }
      }
      break;
    }
    case 'Escape':
      event.preventDefault();
      close();
      break;
    case 'Tab':
      // Close — let Tab focus traversal continue naturally.
      close();
      break;
  }
};

// ── Cleanup ─────────────────────────────────────────────────────────────────
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', onDocumentMouseDown, true);
  }
});

// Reset the active index if items shrink while open.
watch(
  () => items.length,
  (len) => {
    if (!isOpen.value) return;
    if (activeIndex.value >= len) {
      activeIndex.value = firstActivatableIndex();
    }
  },
);

const menuStyle = computed(() => ({
  top: `${y.value}px`,
  left: `${x.value}px`,
}));
</script>

<template>
  <div class="b-context-menu" @contextmenu.prevent="handleContextMenu">
    <slot />

    <Teleport to="body">
      <Transition name="b-context-menu-fade">
        <ul
          v-if="isOpen"
          ref="menuRef"
          :id="baseId"
          role="menu"
          aria-orientation="vertical"
          :aria-label="ariaLabel"
          :aria-activedescendant="activeId"
          tabindex="-1"
          class="b-context-menu__list"
          :style="menuStyle"
          @keydown="onKeyDown"
        >
          <template v-for="(item, i) in items" :key="item.key">
            <li
              v-if="item.divider"
              role="separator"
              aria-hidden="true"
              class="b-context-menu__divider-row"
            >
              <hr class="b-context-menu__divider" />
            </li>
            <li
              v-else
              :id="optionId(i)"
              role="menuitem"
              :aria-disabled="!!item.disabled"
              :class="[
                'b-context-menu__item',
                {
                  'b-context-menu__item--active': activeIndex === i,
                  'b-context-menu__item--disabled': item.disabled,
                  'b-context-menu__item--danger': item.danger,
                },
              ]"
              @click="onItemClick(item, i, $event)"
              @mouseenter="onItemMouseEnter(item, i)"
            >
              <slot name="item" :item="item" :active="activeIndex === i">
                <span
                  v-if="item.icon"
                  class="b-context-menu__item-icon"
                  aria-hidden="true"
                >
                  <BIcon :icon="(item.icon as `${BIconName}` | `${BIconBrandName}`)" size="sm" />
                </span>
                <span class="b-context-menu__item-label">{{ item.label }}</span>
              </slot>
            </li>
          </template>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.b-context-menu {
  /* Trigger wrapper — also defines the tokens so consumers can override on the wrapper. */
  --b-context-menu-bg: oklch(100% 0 0);
  --b-context-menu-fg: oklch(20% 0.005 286);
  --b-context-menu-border-color: oklch(92% 0.004 286.32);
  --b-context-menu-radius: 8px;
  --b-context-menu-shadow:
    0 6px 16px 0 oklch(0% 0 0 / 0.08),
    0 3px 6px -4px oklch(0% 0 0 / 0.12),
    0 9px 28px 8px oklch(0% 0 0 / 0.05);
  --b-context-menu-padding: 4px;
  --b-context-menu-min-width: 180px;
  --b-context-menu-item-padding-x: 12px;
  --b-context-menu-item-padding-y: 6px;
  --b-context-menu-item-bg-hover: oklch(96% 0.003 286);
  --b-context-menu-item-bg-active: oklch(94% 0.02 240);
  --b-context-menu-item-fg-disabled: oklch(70% 0.005 286);
  --b-context-menu-item-fg-danger: oklch(55% 0.22 25.331);
  --b-context-menu-divider-color: oklch(92% 0.004 286.32);
}

/* The list is teleported to <body> — re-declare tokens on its root so they resolve. */
.b-context-menu__list {
  --b-context-menu-bg: oklch(100% 0 0);
  --b-context-menu-fg: oklch(20% 0.005 286);
  --b-context-menu-border-color: oklch(92% 0.004 286.32);
  --b-context-menu-radius: 8px;
  --b-context-menu-shadow:
    0 6px 16px 0 oklch(0% 0 0 / 0.08),
    0 3px 6px -4px oklch(0% 0 0 / 0.12),
    0 9px 28px 8px oklch(0% 0 0 / 0.05);
  --b-context-menu-padding: 4px;
  --b-context-menu-min-width: 180px;
  --b-context-menu-item-padding-x: 12px;
  --b-context-menu-item-padding-y: 6px;
  --b-context-menu-item-bg-hover: oklch(96% 0.003 286);
  --b-context-menu-item-bg-active: oklch(94% 0.02 240);
  --b-context-menu-item-fg-disabled: oklch(70% 0.005 286);
  --b-context-menu-item-fg-danger: oklch(55% 0.22 25.331);
  --b-context-menu-divider-color: oklch(92% 0.004 286.32);

  position: fixed;
  z-index: 1100;
  list-style: none;
  margin: 0;
  padding: var(--b-context-menu-padding);
  min-width: var(--b-context-menu-min-width);
  background: var(--b-context-menu-bg);
  color: var(--b-context-menu-fg);
  border: 1px solid var(--b-context-menu-border-color);
  border-radius: var(--b-context-menu-radius);
  box-shadow: var(--b-context-menu-shadow);
  outline: none;
  font-size: 14px;
  line-height: 1.4;
}

.b-context-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--b-context-menu-item-padding-y) var(--b-context-menu-item-padding-x);
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  color: inherit;
  transition: background-color 0.12s ease;
}

.b-context-menu__item:hover {
  background: var(--b-context-menu-item-bg-hover);
}

.b-context-menu__item--active {
  background: var(--b-context-menu-item-bg-active);
}

.b-context-menu__item--disabled {
  color: var(--b-context-menu-item-fg-disabled);
  cursor: not-allowed;
  pointer-events: none;
}

.b-context-menu__item--danger {
  color: var(--b-context-menu-item-fg-danger);
}

.b-context-menu__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.b-context-menu__item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-context-menu__divider-row {
  margin: 0;
  padding: 0;
  list-style: none;
}

.b-context-menu__divider {
  border: 0;
  height: 1px;
  margin: 4px 0;
  background: var(--b-context-menu-divider-color);
}

/* Animations */
.b-context-menu-fade-enter-active,
.b-context-menu-fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
  transform-origin: top left;
}

.b-context-menu-fade-enter-from,
.b-context-menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .b-context-menu-fade-enter-active,
  .b-context-menu-fade-leave-active,
  .b-context-menu__item {
    transition: none;
  }
}

/* Dark mode — reassign the same vars on both the trigger root and the teleported panel. */
[data-prefers-color='dark'] .b-context-menu,
[data-prefers-color='dark'] .b-context-menu__list {
  --b-context-menu-bg: oklch(20% 0.005 286);
  --b-context-menu-fg: oklch(96% 0.002 286);
  --b-context-menu-border-color: oklch(30% 0.005 286);
  --b-context-menu-shadow:
    0 6px 16px 0 oklch(0% 0 0 / 0.24),
    0 3px 6px -4px oklch(0% 0 0 / 0.36),
    0 9px 28px 8px oklch(0% 0 0 / 0.2);
  --b-context-menu-item-bg-hover: oklch(28% 0.005 286);
  --b-context-menu-item-bg-active: oklch(35% 0.04 240);
  --b-context-menu-item-fg-disabled: oklch(55% 0.005 286);
  --b-context-menu-item-fg-danger: oklch(70% 0.18 25);
  --b-context-menu-divider-color: oklch(30% 0.005 286);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-context-menu,
  [data-prefers-color='system'] .b-context-menu__list {
    --b-context-menu-bg: oklch(20% 0.005 286);
    --b-context-menu-fg: oklch(96% 0.002 286);
    --b-context-menu-border-color: oklch(30% 0.005 286);
    --b-context-menu-shadow:
      0 6px 16px 0 oklch(0% 0 0 / 0.24),
      0 3px 6px -4px oklch(0% 0 0 / 0.36),
      0 9px 28px 8px oklch(0% 0 0 / 0.2);
    --b-context-menu-item-bg-hover: oklch(28% 0.005 286);
    --b-context-menu-item-bg-active: oklch(35% 0.04 240);
    --b-context-menu-item-fg-disabled: oklch(55% 0.005 286);
    --b-context-menu-item-fg-danger: oklch(70% 0.18 25);
    --b-context-menu-divider-color: oklch(30% 0.005 286);
  }
}
</style>
