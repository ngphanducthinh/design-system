<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import { computed, inject, ref, useId, watch } from 'vue';
import {
  BCollapseGroupContextKey,
  type BCollapseCollapsible,
  type BCollapseGroupContext,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  panelKey,
  header = '',
  disabled = false,
  collapsible,
  showArrow = true,
  forceRender = false,
  extra,
} = defineProps<{
  /** Unique key identifying this panel within the group. */
  panelKey: string | number;
  /** Title text displayed in the header. */
  header?: string;
  /** Disables the panel (overrides collapsible). */
  disabled?: boolean;
  /** Panel-level collapsible trigger override: 'header' | 'icon' | 'disabled'. */
  collapsible?: BCollapseCollapsible;
  /** Whether to show the expand arrow icon. @default true */
  showArrow?: boolean;
  /** Forces panel content to render even when collapsed. @default false */
  forceRender?: boolean;
  /** Extra content rendered at the end of the header. */
  extra?: string;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Panel body content. */
  default?(): unknown;
  /** Custom header content (replaces header prop text). */
  header?(): unknown;
  /** Custom expand icon. Receives { isActive: boolean }. */
  expandIcon?(props: { isActive: boolean }): unknown;
  /** Extra content at the end of the header. */
  extra?(): unknown;
}>();

// ─────────────────────────────────────────────
// Inject group context (if nested in BCollapseGroup)
// ─────────────────────────────────────────────
const group = inject<BCollapseGroupContext | null>(BCollapseGroupContextKey, null);

// ─────────────────────────────────────────────
// Standalone mode (no group parent)
// ─────────────────────────────────────────────
const standaloneOpen = ref(false);

const isActive = computed(() => {
  if (group) {
    return group.isActive(panelKey);
  }
  return standaloneOpen.value;
});

const resolvedCollapsible = computed<BCollapseCollapsible | undefined>(() => {
  if (disabled) return 'disabled';
  return collapsible ?? group?.collapsible.value;
});

const isDisabled = computed(() => resolvedCollapsible.value === 'disabled');

const expandIconPosition = computed(() => group?.expandIconPosition.value ?? 'start');

const hasRendered = ref(forceRender || isActive.value);

watch(isActive, (val) => {
  if (val) hasRendered.value = true;
});

// ─────────────────────────────────────────────
// IDs for a11y
// ─────────────────────────────────────────────
const headerId = useId();
const contentId = useId();

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────
function toggle() {
  if (isDisabled.value) return;

  if (group) {
    group.toggle(panelKey);
  } else {
    standaloneOpen.value = !standaloneOpen.value;
  }
}

function handleHeaderClick() {
  if (resolvedCollapsible.value === 'icon') return;
  toggle();
}

function handleIconClick(e: MouseEvent) {
  if (resolvedCollapsible.value === 'icon') {
    e.stopPropagation();
    toggle();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (isDisabled.value) return;

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggle();
  }
}
</script>

<template>
  <div
    class="b-collapse-panel"
    :class="{
      'b-collapse-panel--active': isActive,
      'b-collapse-panel--disabled': isDisabled,
    }"
  >
    <!-- Header -->
    <div
      :id="headerId"
      class="b-collapse-panel__header"
      :class="{
        'b-collapse-panel__header--icon-end': expandIconPosition === 'end',
        'b-collapse-panel__header--clickable': !isDisabled && resolvedCollapsible !== 'icon',
        'b-collapse-panel__header--icon-clickable': !isDisabled && resolvedCollapsible === 'icon',
      }"
      role="button"
      :tabindex="isDisabled ? -1 : 0"
      :aria-expanded="isActive"
      :aria-controls="contentId"
      :aria-disabled="isDisabled"
      @click="handleHeaderClick"
      @keydown="handleKeydown"
    >
      <!-- Expand icon -->
      <span
        v-if="showArrow"
        class="b-collapse-panel__arrow"
        :class="{ 'b-collapse-panel__arrow--active': isActive }"
        aria-hidden="true"
        @click="handleIconClick"
      >
        <slot name="expandIcon" :is-active="isActive">
          <BIcon icon="chevron-right" size="sm" class="b-collapse-panel__arrow-icon" />
        </slot>
      </span>

      <!-- Header text / slot -->
      <span class="b-collapse-panel__header-text">
        <slot name="header">{{ header }}</slot>
      </span>

      <!-- Extra -->
      <span v-if="extra || $slots.extra" class="b-collapse-panel__extra">
        <slot name="extra">{{ extra }}</slot>
      </span>
    </div>

    <!-- Content -->
    <div
      :id="contentId"
      class="b-collapse-panel__content-wrapper"
      :class="{ 'b-collapse-panel__content-wrapper--active': isActive }"
      role="region"
      :aria-labelledby="headerId"
      :aria-hidden="!isActive"
    >
      <div v-if="isActive || hasRendered || forceRender" class="b-collapse-panel__content">
        <div class="b-collapse-panel__body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ───────────────────────────────────────────── */
.b-collapse-panel {
  --b-collapse-header-padding: 12px 16px;
  --b-collapse-header-bg: oklch(97% 0 0);
  --b-collapse-header-color: oklch(15% 0 0);
  --b-collapse-header-font-size: 14px;
  --b-collapse-header-font-weight: 500;
  --b-collapse-header-line-height: 1.5;
  --b-collapse-content-padding: 16px;
  --b-collapse-content-bg: oklch(100% 0 0);
  --b-collapse-content-color: oklch(27% 0.01 260);
  --b-collapse-border-color: oklch(88% 0 0);
  --b-collapse-border-radius: 8px;
  --b-collapse-arrow-size: 12px;
  --b-collapse-arrow-color: oklch(45% 0 0);
  --b-collapse-extra-color: oklch(45% 0 0);
  --b-collapse-disabled-color: oklch(63% 0 0);
  --b-collapse-disabled-bg: oklch(96% 0 0);
  --b-collapse-transition-duration: 300ms;
}

/* ── Dark mode ──────────────────────────────── */
[data-prefers-color='dark'] .b-collapse-panel {
  --b-collapse-header-bg: oklch(22% 0.005 260);
  --b-collapse-header-color: oklch(90% 0 0);
  --b-collapse-content-bg: oklch(18% 0.005 260);
  --b-collapse-content-color: oklch(80% 0.01 260);
  --b-collapse-border-color: oklch(32% 0.005 260);
  --b-collapse-arrow-color: oklch(65% 0 0);
  --b-collapse-extra-color: oklch(65% 0 0);
  --b-collapse-disabled-color: oklch(45% 0 0);
  --b-collapse-disabled-bg: oklch(20% 0.005 260);
}

/* ─────────────────────────────────────────────
   Panel layout
   ───────────────────────────────────────────── */
.b-collapse-panel {
  border-bottom: 1px solid var(--b-collapse-border-color);
}

.b-collapse-panel:first-child .b-collapse-panel__header {
  border-radius: var(--b-collapse-border-radius) var(--b-collapse-border-radius) 0 0;
}

.b-collapse-panel:last-child {
  border-bottom: none;
}

.b-collapse-panel:last-child:not(.b-collapse-panel--active) .b-collapse-panel__header {
  border-radius: 0 0 var(--b-collapse-border-radius) var(--b-collapse-border-radius);
}

/* ─────────────────────────────────────────────
   Header
   ───────────────────────────────────────────── */
.b-collapse-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--b-collapse-header-padding);
  background: var(--b-collapse-header-bg);
  color: var(--b-collapse-header-color);
  font-size: var(--b-collapse-header-font-size);
  font-weight: var(--b-collapse-header-font-weight);
  line-height: var(--b-collapse-header-line-height);
  cursor: default;
  user-select: none;
  border: none;
  outline: none;
  position: relative;
  transition: background-color var(--b-collapse-transition-duration) ease;
}

.b-collapse-panel__header--clickable {
  cursor: pointer;
}

.b-collapse-panel__header--clickable:hover {
  background: oklch(95% 0 0);
}

[data-prefers-color='dark'] .b-collapse-panel__header--clickable:hover {
  background: oklch(25% 0.005 260);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-collapse-panel {
    --b-collapse-header-bg: oklch(22% 0.005 260);
    --b-collapse-header-color: oklch(90% 0 0);
    --b-collapse-content-bg: oklch(18% 0.005 260);
    --b-collapse-content-color: oklch(80% 0.01 260);
    --b-collapse-border-color: oklch(32% 0.005 260);
    --b-collapse-arrow-color: oklch(65% 0 0);
    --b-collapse-extra-color: oklch(65% 0 0);
    --b-collapse-disabled-color: oklch(45% 0 0);
    --b-collapse-disabled-bg: oklch(20% 0.005 260);
  }
  [data-prefers-color='system'] .b-collapse-panel__header--clickable:hover {
    background: oklch(25% 0.005 260);
  }
}

.b-collapse-panel__header--icon-clickable {
  cursor: default;
}

.b-collapse-panel__header:focus-visible {
  outline: 2px solid oklch(54.6% 0.245 262.881);
  outline-offset: -2px;
  z-index: 1;
}

.b-collapse-panel__header--icon-end {
  flex-direction: row-reverse;
}

.b-collapse-panel__header--icon-end .b-collapse-panel__arrow {
  order: 1;
  margin-left: auto;
}

.b-collapse-panel__header--icon-end .b-collapse-panel__extra {
  order: 0;
  margin-left: auto;
  margin-right: 8px;
}

/* ─────────────────────────────────────────────
   Arrow
   ───────────────────────────────────────────── */
.b-collapse-panel__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--b-collapse-arrow-color);
  transition: transform var(--b-collapse-transition-duration) ease;
}

.b-collapse-panel__arrow--active {
  transform: rotate(90deg);
}

.b-collapse-panel__header--icon-clickable .b-collapse-panel__arrow {
  cursor: pointer;
}

.b-collapse-panel__arrow-icon {
  font-size: var(--b-collapse-arrow-size);
}

/* ─────────────────────────────────────────────
   Header text & extra
   ───────────────────────────────────────────── */
.b-collapse-panel__header-text {
  flex: 1;
  min-width: 0;
}

.b-collapse-panel__extra {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--b-collapse-extra-color);
  font-weight: 400;
}

/* ─────────────────────────────────────────────
   Disabled state
   ───────────────────────────────────────────── */
.b-collapse-panel--disabled .b-collapse-panel__header {
  color: var(--b-collapse-disabled-color);
  background: var(--b-collapse-disabled-bg);
  cursor: not-allowed;
}

.b-collapse-panel--disabled .b-collapse-panel__arrow {
  color: var(--b-collapse-disabled-color);
}

/* ─────────────────────────────────────────────
   Content (animated with grid)
   ───────────────────────────────────────────── */
.b-collapse-panel__content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--b-collapse-transition-duration) ease;
  overflow: hidden;
}

.b-collapse-panel__content-wrapper--active {
  grid-template-rows: 1fr;
}

.b-collapse-panel__content {
  min-height: 0;
  overflow: hidden;
}

.b-collapse-panel__body {
  padding: var(--b-collapse-content-padding);
  background: var(--b-collapse-content-bg);
  color: var(--b-collapse-content-color);
  border-top: 1px solid var(--b-collapse-border-color);
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-collapse-panel__content-wrapper {
    transition: none;
  }

  .b-collapse-panel__arrow {
    transition: none;
  }
}
</style>
