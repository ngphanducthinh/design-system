<script lang="ts" setup>
import type { BDatePickerDateItem } from '@/types';
import { useDate } from '@/composables/Date';

// https://tailwindcss.com/docs/functions-and-directives#theme
// https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state

//#region Props
interface BDatePickerDateGridProps {
  dateRange: BDatePickerDateItem[];
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
const isWithin = ({ year, month, date }: BDatePickerDateItem) => {
  if (props.dateRange.length < 2) {
    return false;
  }

  const startDate = new Date(
    props.dateRange[0].year!,
    props.dateRange[0].month!,
    props.dateRange[0].date!,
  );
  const endDate = new Date(
    props.dateRange[1].year!,
    props.dateRange[1].month!,
    props.dateRange[1].date!,
  );
  const d = new Date(year!, month!, date);

  return startDate < d && d < endDate;
};
const isSelectedStart = ({ year, month, date }: BDatePickerDateItem) =>
  props.dateRange.length > 0
    ? year === props.dateRange[0].year &&
      month === props.dateRange[0].month &&
      date === props.dateRange[0].date
    : false;
const isSelectedEnd = ({ year, month, date }: BDatePickerDateItem) =>
  props.dateRange.length === 2
    ? year === props.dateRange[1].year &&
      month === props.dateRange[1].month &&
      date === props.dateRange[1].date
    : false;
const handleSelectDate = ({ year, month, date }: BDatePickerDateItem) => {
  emit('select:date', { year, month, date });
};
//#endregion
</script>

<template>
  <div class="b-date-picker__grid-date-range ds-space-y-3">
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

    <div class="date-range -ds-mx-0.5 ds-grid ds-w-full ds-grid-cols-7">
      <button
        v-for="i in dates"
        :key="`${i.date}${i.month}${i.year}`"
        :class="{
          '*:enabled:hover:ds-bg-gray-150':
            !isSelectedStart(i) && !isSelectedEnd(i),
          'enabled:ds-text-gray-400': i.secondary,
          '--selected': isSelectedStart(i) || isSelectedEnd(i),
          '--start': isSelectedStart(i),
          '--end': isSelectedEnd(i),
        }"
        :disabled="i.disabled"
        class="date-item group ds-cursor-pointer ds-p-0.5 ds-transition-all focus-visible:ds-bg-gray-150 disabled:ds-text-gray-200"
        @click="handleSelectDate(i)"
      >
        <span
          :class="{
            'ds-bg-primary-t ds-text-white':
              isSelectedStart(i) || isSelectedEnd(i),
            'ds-bg-primary-t/10': isWithin(i),
          }"
          class="date-item__inner ds-flex ds-aspect-square ds-items-center ds-justify-center ds-rounded-lg"
        >
          {{ i.date }}
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.date-range:not(:has(.--start):has(.--end)) {
  .date-item.--selected ~ .date-item:has(~ .date-item:hover) .date-item__inner {
    background-color: theme('colors.primary-t / 10%');
  }
  .date-item:hover ~ .date-item:has(~ .date-item.--selected) .date-item__inner {
    background-color: theme('colors.primary-t / 10%');
  }
}
</style>
