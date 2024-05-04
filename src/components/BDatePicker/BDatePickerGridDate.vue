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
const handleSelectDate = ({ year, month, date }: BDatePickerDateItem) => {
  emit('select:date', { year, month, date });
};
//#endregion
</script>

<template>
  <div class="b-date-picker__grid-date ds-space-y-3">
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
      <button
        v-for="i in dates"
        :key="`${i.date}${i.month}${i.year}`"
        :class="{
          'enabled:hover:ds-bg-gray-150': !isSelected(i),
          'enabled:ds-text-gray-400': i.secondary,
          '--selected ds-bg-primary-t ds-text-white': isSelected(i),
        }"
        :disabled="i.disabled"
        class="ds-flex ds-aspect-square ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-lg ds-transition-all focus-visible:ds-bg-gray-150 disabled:ds-text-gray-200"
        @click="handleSelectDate(i)"
      >
        {{ i.date }}
      </button>
    </div>
  </div>
</template>
