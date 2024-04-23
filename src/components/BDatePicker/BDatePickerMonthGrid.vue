<script setup lang="ts">
import type { BDatePickerDateItem } from '@/types';
import { computed } from 'vue';
import { useDate } from '@/composables/Date';

//#region Props
interface BDatePickerDateGridProps {
  modelValue: Date;
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
const { monthNames } = useDate();
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
const isSelectedMonth = ({ year, month }: BDatePickerDateItem) => {
  if (!value.value) {
    return false;
  }

  return (
    year === (value.value as Date).getFullYear() &&
    month === (value.value as Date).getMonth()
  );
};
const handleSelectMonth = ({ year, month, date }: BDatePickerDateItem) => {
  value.value = new Date(year, month, date, 0, 0, 0, 0);
};
//#endregion
</script>

<template>
  <div class="ds-grid ds-w-full ds-grid-cols-3 ds-grid-rows-4 ds-gap-1">
    <div
      v-for="i in months"
      :key="i.month"
      :class="[
        isSelectedMonth(i)
          ? 'ds-bg-primary-t ds-text-white'
          : 'hover:ds-bg-gray-150',
      ]"
      class="ds-flex ds-h-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectMonth(i)"
    >
      {{ monthNames[i.month] }}
    </div>
  </div>
</template>
