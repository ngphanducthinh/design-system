<script setup lang="ts">
import type { BDatePickerDateItem } from '@/types';
import { computed } from 'vue';

//#region Props
interface BDatePickerDateGridProps {
  modelValue: Date;
  dates: BDatePickerDateItem[];
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
const isSelectedDate = ({ year, month, date }: BDatePickerDateItem) => {
  if (!value.value) {
    return false;
  }

  return (
    year === (value.value as Date).getFullYear() &&
    month === (value.value as Date).getMonth() &&
    date === (value.value as Date).getDate()
  );
};
const handleSelectDate = ({ year, month, date }: BDatePickerDateItem) => {
  value.value = new Date(year, month, date, 0, 0, 0, 0);
};
//#endregion
</script>

<template>
  <div class="ds-grid ds-w-full ds-grid-cols-7 ds-gap-1">
    <div
      v-for="i in dates"
      :key="`${i.date}${i.month}`"
      :class="[
        i.cssClass,
        isSelectedDate(i)
          ? 'ds-bg-primary-t ds-text-white'
          : 'hover:ds-bg-gray-150',
      ]"
      class="ds-flex ds-h-9 ds-w-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
      @click="handleSelectDate(i)"
    >
      {{ i.date }}
    </div>
  </div>
</template>
