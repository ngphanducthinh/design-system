<script lang="ts" setup>
// https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/
import { PIKey } from '@/constants.ts';
import { computed, getCurrentInstance, inject } from 'vue';

//#region Props
export interface BCollapseProps {
  modelValue: boolean;
}
const props = defineProps<BCollapseProps>();
//#endregion

const collapseList = inject(PIKey.BCollapseGroup)!;
const instance = getCurrentInstance();

//#region Events
const emit = defineEmits<{
  /**
   * Emitted when the model value changes. Collapse is either open (true) or closed (false).
   */
  'update:modelValue': [value: boolean];
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

collapseList[instance!.uid] = value.value;

console.log(collapseList);
</script>

<template>
  <div
    class="b:grid b:grid-rows-[0fr] b:transition-[grid-template-rows] b:duration-300"
    :class="{ 'b:grid-rows-[1fr]': value }"
  >
    <div class="b:overflow-y-hidden">
      <slot></slot>
    </div>
  </div>
</template>
