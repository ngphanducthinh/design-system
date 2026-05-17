<script setup lang="ts">
// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const { dashed = false } = defineProps<{
  /** Whether divider line is dashed. @default false */
  dashed?: boolean;
}>();
</script>

<template>
  <li :class="['b-menu-divider', { 'b-menu-divider--dashed': dashed }]" role="separator" />
</template>

<style>
/* ─────────────────────────────────────────────
   BMenuDivider
   ───────────────────────────────────────────── */
.b-menu-divider {
  height: 1px;
  margin: 4px 12px;
  background: rgba(5, 5, 5, 0.06);
  list-style: none;
}

.b-menu-divider--dashed {
  background: none;
  border-top: 1px dashed rgba(5, 5, 5, 0.06);
}

[data-prefers-color='dark'] .b-menu-divider,
.b-menu--dark .b-menu-divider {
  background: rgba(253, 253, 253, 0.12);
}

[data-prefers-color='dark'] .b-menu-divider--dashed,
.b-menu--dark .b-menu-divider--dashed {
  background: none;
  border-top-color: rgba(253, 253, 253, 0.12);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-menu-divider {
    background: rgba(253, 253, 253, 0.12);
  }

  [data-prefers-color='system'] .b-menu-divider--dashed {
    background: none;
    border-top-color: rgba(253, 253, 253, 0.12);
  }
}
</style>
