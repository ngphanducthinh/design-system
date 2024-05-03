<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { isNil } from 'lodash-es';

//#region Props
interface BDatePickerDateGridProps {
  year: BDatePickerDateItem;
  years: BDatePickerDateItem[];
}

const props = withDefaults(defineProps<BDatePickerDateGridProps>(), {});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'select:year', value: BDatePickerDateItem): void;
}>();
//#endregion

//#region Methods
const isSelected = ({ year }: BDatePickerDateItem) => {
  if (isNil(props.year.year)) {
    return false;
  }
  return year === props.year.year;
};
const handleSelectYear = ({ year, month, date }: BDatePickerDateItem) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  emit('select:year', { year, month, date });
};
//#endregion
</script>

<template>
  <div
    class="b-date-picker__grid-year ds-grid ds-w-full ds-grid-cols-3 ds-grid-rows-4 ds-gap-x-1 ds-gap-y-3"
  >
    <button
      v-for="i in years"
      :key="i.year"
      :class="{
        'hover:ds-bg-gray-150': !i.disabled && !isSelected(i),
        'ds-text-gray-400': !i.disabled && i.secondary,
        'ds-text-gray-200': i.disabled,
        'ds-bg-primary-t ds-text-white': isSelected(i),
      }"
      :disabled="i.disabled"
      class="ds-flex ds-h-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectYear(i)"
    >
      {{ i.year }}
    </button>
  </div>
</template>
