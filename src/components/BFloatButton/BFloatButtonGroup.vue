<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue';
import { BFloatButtonGroupPlacement, BFloatButtonShape, BFloatButtonTrigger } from './types.ts';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const props = defineProps<{
  /**
   * Controlled open state. Use with `v-model:open` for two-way binding.
   * When this prop changes, the internal state syncs to it.
   */
  open?: boolean | null;
  /**
   * The trigger mode for expanding/collapsing the group menu.
   * When set, a trigger button is shown that reveals child buttons.
   */
  trigger?: `${BFloatButtonTrigger}`;
  /**
   * Animation direction when expanding/collapsing.
   * @default 'top'
   */
  placement?: `${BFloatButtonGroupPlacement}`;
  /**
   * Shape applied to all child float buttons.
   * @default 'circle'
   */
  shape?: `${BFloatButtonShape}`;
  /**
   * Icon name for the close/collapse trigger button.
   */
  closeIcon?: string;
}>();

const emit = defineEmits<{
  /** Emitted when the group open state changes. */
  (e: 'openChange', open: boolean): void;
  /** v-model support. */
  (e: 'update:open', open: boolean): void;
}>();

defineSlots<{
  /** Float button children. */
  default?(): unknown;
  /** Custom trigger icon (open state). */
  icon?(): unknown;
  /** Custom close icon (close state). */
  closeIcon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state — always the rendering source of truth
// ─────────────────────────────────────────────
const internalOpen = ref(false);

// Sync from controlled prop → internal state when explicitly changed
watch(
  () => props.open,
  (val) => {
    if (val === true) internalOpen.value = true;
    else if (val === false) internalOpen.value = false;
    // null/undefined means "uncontrolled" — do not override internal state
  },
  { immediate: true },
);

function setOpen(val: boolean) {
  internalOpen.value = val;
  emit('update:open', val);
  emit('openChange', val);
}

function toggle() {
  setOpen(!internalOpen.value);
}

function openGroup() {
  setOpen(true);
}

function closeGroup() {
  setOpen(false);
}

// ─────────────────────────────────────────────
// Hover trigger
// ─────────────────────────────────────────────
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function onMouseEnter() {
  if (props.trigger !== BFloatButtonTrigger.Hover) return;
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  openGroup();
}

function onMouseLeave() {
  if (props.trigger !== BFloatButtonTrigger.Hover) return;
  hideTimer = setTimeout(() => closeGroup(), 100);
}

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer);
});

// ─────────────────────────────────────────────
// Provide shape to children
// ─────────────────────────────────────────────
provide(
  'bFloatButtonGroupShape',
  computed(() => props.shape ?? BFloatButtonShape.Circle),
);

const isGroup = computed(() => props.trigger !== undefined);
const placementClass = computed(
  () => `b-float-button-group--${props.placement ?? BFloatButtonGroupPlacement.Top}`,
);
const shapeClass = computed(
  () => `b-float-button-group--shape-${props.shape ?? BFloatButtonShape.Circle}`,
);
</script>

<template>
  <div
    class="b-float-button-group"
    :class="[
      placementClass,
      shapeClass,
      {
        'b-float-button-group--menu': isGroup,
        'b-float-button-group--open': isGroup && internalOpen,
      },
    ]"
    :role="!isGroup ? 'group' : undefined"
    :aria-label="!isGroup ? 'Float button group' : undefined"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Child buttons list (always rendered; hidden when group is collapsed) -->
    <div
      class="b-float-button-group__list"
      :aria-hidden="isGroup ? !internalOpen : undefined"
      :inert="isGroup && !internalOpen ? true : undefined"
    >
      <slot />
    </div>

    <!-- Trigger button (only rendered when trigger is set) -->
    <button
      v-if="isGroup"
      type="button"
      class="b-float-button-group__trigger"
      :class="[
        'b-float-button',
        `b-float-button--${props.shape ?? 'circle'}`,
        'b-float-button--primary',
      ]"
      :aria-expanded="internalOpen"
      :aria-label="internalOpen ? 'Collapse button group' : 'Expand button group'"
      @click="toggle"
    >
      <span class="b-float-button__body">
        <span class="b-float-button__icon" aria-hidden="true">
          <template v-if="internalOpen">
            <slot name="closeIcon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </slot>
          </template>
          <template v-else>
            <slot name="icon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </slot>
          </template>
        </span>
      </span>
    </button>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   Group container
   ───────────────────────────────────────────── */
.b-float-button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.b-float-button-group--menu {
  position: relative;
}

/* ─────────────────────────────────────────────
   Items list (collapsible)
   ───────────────────────────────────────────── */
.b-float-button-group__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;

  /* Collapsed: hidden */
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  transition:
    max-height 300ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 250ms ease;
}

.b-float-button-group--open .b-float-button-group__list {
  max-height: 60vh;
  opacity: 1;
  pointer-events: auto;
}

/* ── Placement variants for list direction ── */
.b-float-button-group--top .b-float-button-group__list {
  flex-direction: column-reverse;
}

.b-float-button-group--bottom .b-float-button-group__list {
  flex-direction: column;
}

.b-float-button-group--left .b-float-button-group__list {
  flex-direction: row-reverse;
  margin: 0 0.75rem 0 0;
}

.b-float-button-group--right .b-float-button-group__list {
  flex-direction: row;
  margin: 0 0 0 0.75rem;
}

/* ── Horizontal layout for left/right placements ── */
.b-float-button-group--left,
.b-float-button-group--right {
  flex-direction: row;
  align-items: center;
}

/* ── Trigger button ── */
.b-float-button-group__trigger {
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-float-button-group__list {
    transition-duration: 0ms;
  }
}
</style>
