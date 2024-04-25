<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';

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
const isSelected = ({ year, month }: BDatePickerDateItem) => {
  if (props.year.year === -1) {
    return false;
  }
  return year === props.year.year;
};
const handleSelectYear = ({
  year,
  month,
  date,
  disabled,
}: BDatePickerDateItem) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  if (disabled) {
    return;
  }
  emit('select:year', { year, month, date });
};
//#endregion
</script>

<template>
  <div
    class="ds-grid ds-w-full ds-grid-cols-3 ds-grid-rows-4 ds-gap-x-1 ds-gap-y-3"
  >
    <div
      v-for="i in years"
      :key="i.year"
      :class="{
        'hover:ds-bg-gray-150': !i.disabled && !isSelected(i),
        'ds-text-gray-400': !i.disabled && i.secondary,
        'ds-text-gray-200': i.disabled,
        'ds-bg-primary-t ds-text-white': isSelected(i),
      }"
      class="ds-flex ds-h-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectYear(i)"
    >
      {{ i.year }}
    </div>
  </div>
</template>
