<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { useDate } from '@/composables/Date';
import { isNil } from 'lodash-es';

//#region Props
interface BDatePickerDateGridProps {
  date: BDatePickerDateItem;
  dates: BDatePickerDateItem[];
}

const props = withDefaults(defineProps<BDatePickerDateGridProps>(), {});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'select:date', value: BDatePickerDateItem): void;
}>();
//#endregion

//#region Data
const { dayShortNames } = useDate();
//#endregion

//#region Methods
const isSelected = ({ year, month, date }: BDatePickerDateItem) => {
  if (
    isNil(props.date.year) ||
    isNil(props.date.month) ||
    isNil(props.date.date)
  ) {
    return false;
  }
  return (
    year === props.date.year &&
    month === props.date.month &&
    date === props.date.date
  );
};
const handleSelectDate = ({
  year,
  month,
  date,
  disabled,
}: BDatePickerDateItem) => {
  if (disabled) {
    return;
  }
  emit('select:date', { year, month, date });
};
//#endregion
</script>

<template>
  <div class="ds-space-y-3">
    <div
      class="ds-grid ds-w-full ds-grid-cols-7 ds-gap-1 ds-text-xs ds-text-gray-400"
    >
      <div
        v-for="i in Object.keys(dayShortNames).length"
        :key="i"
        class="ds-flex ds-justify-center"
      >
        {{ i - 1 === 6 ? dayShortNames[0] : dayShortNames[i] }}
      </div>
    </div>

    <div class="ds-grid ds-w-full ds-grid-cols-7 ds-gap-1">
      <div
        v-for="i in dates"
        :key="`${i.date}${i.month}${i.year}`"
        :class="{
          'hover:ds-bg-gray-150': !i.disabled && !isSelected(i),
          'ds-text-gray-400': !i.disabled && i.secondary,
          'ds-text-gray-200': i.disabled,
          'ds-bg-primary-t ds-text-white': isSelected(i),
        }"
        class="ds-flex ds-h-10 ds-w-10 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg"
        @click="handleSelectDate(i)"
      >
        {{ i.date }}
      </div>
    </div>
  </div>
</template>
