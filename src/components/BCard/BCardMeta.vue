<script setup lang="ts">
import { useSlots } from 'vue';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const { title, description } = defineProps<{
  /** Title of the meta section */
  title?: string;
  /** Description text below the title */
  description?: string;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Avatar or icon to the left of the meta content */
  avatar?: (props: Record<string, never>) => unknown;
  /** Custom title content. Overrides the `title` prop */
  title?: (props: Record<string, never>) => unknown;
  /** Custom description content. Overrides the `description` prop */
  description?: (props: Record<string, never>) => unknown;
}>();

const slots = useSlots();
</script>

<template>
  <div class="b-card-meta">
    <div v-if="slots.avatar" class="b-card-meta__avatar">
      <slot name="avatar" />
    </div>
    <div
      v-if="title || slots.title || description || slots.description"
      class="b-card-meta__detail"
    >
      <div v-if="title || slots.title" class="b-card-meta__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="description || slots.description" class="b-card-meta__description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<style>
.b-card-meta {
  --b-card-meta-title-font-size: 16px;
  --b-card-meta-title-font-weight: 500;
  --b-card-meta-title-color: oklch(20% 0.02 260);
  --b-card-meta-description-font-size: 14px;
  --b-card-meta-description-color: oklch(45% 0.02 260);
  --b-card-meta-avatar-margin-right: 16px;

  display: flex;
  align-items: flex-start;
}

.b-card-meta__avatar {
  flex: none;
  margin-right: var(--b-card-meta-avatar-margin-right);
}

.b-card-meta__detail {
  flex: 1;
  overflow: hidden;
}

.b-card-meta__title {
  font-size: var(--b-card-meta-title-font-size);
  font-weight: var(--b-card-meta-title-font-weight);
  color: var(--b-card-meta-title-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.b-card-meta__description {
  font-size: var(--b-card-meta-description-font-size);
  color: var(--b-card-meta-description-color);
  margin-top: 4px;
  line-height: 1.5;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-card-meta {
  --b-card-meta-title-color: oklch(92% 0.01 260);
  --b-card-meta-description-color: oklch(65% 0.01 260);
}
</style>
