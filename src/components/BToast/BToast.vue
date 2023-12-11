<script lang="ts" setup>
import type { BToastItemModel } from '@/types';
import { computed } from 'vue';
import BToastItem from './BToastItem.vue';

/**
 * Props
 */
export interface Props {
  modelValue: BToastItemModel[];
}
const props = withDefaults(defineProps<Props>(), {});

/**
 * Data
 */
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: BToastItemModel[]];
}>();

/**
 * Methods
 */
const onCloseToastItem = (i: number) => {
  value.value.splice(i, 1);
};
</script>

<template>
  <div
    v-show="value.length > 0"
    class="ds-fixed ds-right-4 ds-top-4 ds-z-[110]"
  >
    <TransitionGroup
      enter-active-class="ds-transition-all ds-duration-300 ds-ease-in-out"
      enter-from-class="ds-opacity-0"
      enter-to-class="ds-opacity-1"
      leave-active-class="ds-transition-all ds-duration-300 ds-ease-in-out"
      leave-from-class="ds-opacity-1"
      leave-to-class="ds-opacity-0"
    >
      <BToastItem
        v-for="(toastItem, index) in value"
        :key="`toastItem${index}`"
        :icon="toastItem.icon"
        :text="toastItem.text"
        :type="toastItem.type"
        class="ds-my-2"
        @close="onCloseToastItem(index)"
      />
    </TransitionGroup>
  </div>
</template>
