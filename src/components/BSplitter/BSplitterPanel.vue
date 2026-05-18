<script lang="ts" setup>
/**
 * BSplitterPanel
 * --------------
 * A pure data/marker component used inside <BSplitter>.
 *
 * It does not render any wrapper element of its own — <BSplitter> reads the
 * VNode's props and default-slot content and renders the panel <div>
 * itself, so that draggers can be interspersed correctly between panels.
 *
 * Props mirror AntD's `Splitter.Panel` API.
 */
import type { BSplitterPanelCollapsible } from './types';

defineOptions({ name: 'BSplitterPanel' });

defineProps<{
  /** Controlled size (px number or any CSS unit string e.g. '50%'). */
  size?: number | string;
  /** Initial size for uncontrolled mode (px number or CSS string). */
  defaultSize?: number | string;
  /** Minimum size (px or CSS string). */
  min?: number | string;
  /** Maximum size (px or CSS string). */
  max?: number | string;
  /** Whether the dragger adjacent to this panel can resize it. @default true */
  resizable?: boolean;
  /** Collapsible config — `true` enables both directions, or pass an object. */
  collapsible?: boolean | BSplitterPanelCollapsible;
  /** Destroy panel content from the DOM when its size collapses to 0. @default false */
  destroyOnHidden?: boolean;
}>();

defineSlots<{
  default?(): unknown;
}>();
</script>

<template>
  <!-- Render only the slot content. BSplitter wraps it in a panel div. -->
  <slot />
</template>
