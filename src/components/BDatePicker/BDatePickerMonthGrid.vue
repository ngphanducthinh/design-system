<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { computed } from 'vue';
import { useDate } from '@/composables/Date';

//#region Props
interface BDatePickerDateGridProps {
  modelValue: Date | string;
  months: BDatePickerDateItem[];
}

const props = withDefaults(defineProps<BDatePickerDateGridProps>(), {});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();
//#endregion

//#region Data
const { monthShortNames } = useDate();
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

  return (
    year === (value.value as Date).getFullYear() &&
    month === (value.value as Date).getMonth()
  );
};
const handleSelectMonth = ({
  year,
  month,
  date,
  disabled,
}: BDatePickerDateItem) => {
  if (disabled) {
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
      v-for="i in months"
      :key="i.month"
      :class="{
        'hover:ds-bg-gray-150': !i.disabled && !isSelected(i),
        'ds-text-gray-200': i.disabled,
        'ds-bg-primary-t ds-text-white': isSelected(i),
      }"
      class="ds-flex ds-h-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectMonth(i)"
    >
      {{ monthShortNames[i.month] }}
    </div>
  </div>
</template>
