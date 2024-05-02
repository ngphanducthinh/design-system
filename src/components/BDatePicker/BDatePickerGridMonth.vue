<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { useDate } from '@/composables/Date';
import { isNil } from 'lodash-es';

//#region Props
interface BDatePickerDateGridProps {
  month: BDatePickerDateItem;
  months: BDatePickerDateItem[];
}

const props = withDefaults(defineProps<BDatePickerDateGridProps>(), {});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'select:month', value: BDatePickerDateItem): void;
}>();
//#endregion

//#region Data
const { monthShortNames } = useDate();
//#endregion

//#region Methods
const isSelected = ({ year, month }: BDatePickerDateItem) => {
  if (isNil(props.month.year) || isNil(props.month.month)) {
    return false;
  }
  return year === props.month.year && month === props.month.month;
};
const handleSelectMonth = ({ year, month, date }: BDatePickerDateItem) => {
  emit('select:month', { year, month, date });
};
//#endregion
</script>

<template>
  <div
    class="ds-grid ds-w-full ds-grid-cols-3 ds-grid-rows-4 ds-gap-x-1 ds-gap-y-3"
  >
    <button
      v-for="i in months"
      :key="i.month"
      :class="{
        'hover:ds-bg-gray-150': !i.disabled && !isSelected(i),
        'ds-text-gray-200': i.disabled,
        'ds-bg-primary-t ds-text-white': isSelected(i),
      }"
      :disabled="i.disabled"
      class="ds-flex ds-h-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectMonth(i)"
    >
      {{ monthShortNames[i.month!] }}
    </button>
  </div>
</template>
