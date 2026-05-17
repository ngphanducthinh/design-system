<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { useSlots } from 'vue';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  label,
  span = 1,
  labelStyle,
  contentStyle,
} = defineProps<{
  /** Label text displayed for this item. Can be overridden by the `label` slot. */
  label?: string;
  /** Number of columns this item spans. @default 1 */
  span?: number;
  /** Inline style applied to the label cell. */
  labelStyle?: CSSProperties;
  /** Inline style applied to the content cell. */
  contentStyle?: CSSProperties;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Main content of the description item */
  default?: (props: Record<string, never>) => unknown;
  /** Custom label content. Overrides the `label` prop */
  label?: (props: Record<string, never>) => unknown;
}>();

const slots = useSlots();

// Expose props for parent to read
defineExpose({ label, span, labelStyle, contentStyle, slots });
</script>

<template>
  <!--
    BDescriptionsItem is a data-only component.
    It does not render its own markup; BDescriptions reads its props/slots
    and renders them in a table/list structure.
    This template is used as a fallback if the item is rendered standalone.
  -->
  <div class="b-descriptions-item">
    <span v-if="label || $slots.label" class="b-descriptions-item__label" :style="labelStyle">
      <slot name="label">{{ label }}</slot>
    </span>
    <span class="b-descriptions-item__content" :style="contentStyle">
      <slot />
    </span>
  </div>
</template>
