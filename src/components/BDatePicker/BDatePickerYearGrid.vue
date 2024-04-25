<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { computed } from 'vue';

//#region Props
interface BDatePickerDateGridProps {
  modelValue: Date | string;
  years: BDatePickerDateItem[];
}

const props = withDefaults(defineProps<BDatePickerDateGridProps>(), {});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();
//#endregion

//#region Data
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
//#endregion

//#region Methods
const isSelected = ({ year, month }: BDatePickerDateItem) => {
  if (!value.value) {
    return false;
  }

  return year === (value.value as Date).getFullYear();
};
const handleSelectYear = ({
  year,
  month,
  date,
  disabled,
}: BDatePickerDateItem) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  if (year < 1970 || disabled) {
    return;
  }
  value.value = new Date(year, month, date, 0, 0, 0, 0);
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
