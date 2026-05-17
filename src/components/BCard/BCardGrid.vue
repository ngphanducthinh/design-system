<script setup lang="ts">
// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const { hoverable = false } = defineProps<{
  /** Whether to apply hover styling to the grid item. @default false */
  hoverable?: boolean;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Content inside the grid item */
  default?: (props: Record<string, never>) => unknown;
}>();
</script>

<template>
  <div
    class="b-card-grid"
    :class="{ 'b-card-grid--hoverable': hoverable }"
    :role="$attrs['aria-label'] ? 'region' : undefined"
  >
    <slot />
  </div>
</template>

<style>
.b-card-grid {
  --b-card-grid-width: 33.33%;
  --b-card-grid-padding: 24px;
  --b-card-grid-border-color: oklch(90% 0.01 260);
  --b-card-grid-shadow-hover: 0 4px 12px oklch(0% 0 0 / 12%);
  --b-card-grid-transition-duration: 200ms;

  float: left;
  width: var(--b-card-grid-width);
  padding: var(--b-card-grid-padding);
  border: 0;
  border-radius: 0;
  box-shadow:
    1px 0 0 0 var(--b-card-grid-border-color),
    0 1px 0 0 var(--b-card-grid-border-color),
    1px 1px 0 0 var(--b-card-grid-border-color),
    1px 0 0 0 var(--b-card-grid-border-color) inset,
    0 1px 0 0 var(--b-card-grid-border-color) inset;
  box-sizing: border-box;
  transition: box-shadow var(--b-card-grid-transition-duration) ease;
}

.b-card-grid--hoverable {
  cursor: pointer;
}

.b-card-grid--hoverable:hover {
  position: relative;
  z-index: 1;
  box-shadow: var(--b-card-grid-shadow-hover);
}

.b-card-grid--hoverable:focus-visible {
  outline: 2px solid oklch(46% 0.24 264);
  outline-offset: -2px;
  position: relative;
  z-index: 1;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-card-grid {
  --b-card-grid-border-color: oklch(35% 0.02 260);
  --b-card-grid-shadow-hover: 0 4px 12px oklch(0% 0 0 / 30%);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-card-grid {
    --b-card-grid-transition-duration: 0ms;
  }
}
</style>
