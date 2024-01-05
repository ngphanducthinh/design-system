<script lang="ts" setup>
// https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/
import { computed } from 'vue';

//#region Props
export interface BCollapseProps {
  modelValue: boolean;
}

const props = defineProps<BCollapseProps>();
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: boolean): void;
}>();
//#endregion

//#region Data
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    emit('update:modelValue', val);
  },
});
//#endregion
</script>

<template>
  <div
    :class="{ 'ds-grid-rows-[1fr]': value }"
    class="ds-grid ds-grid-rows-[0fr] ds-transition-[grid-template-rows] ds-duration-300"
  >
    <div class="ds-overflow-hidden">
      <slot></slot>
    </div>
  </div>
</template>
