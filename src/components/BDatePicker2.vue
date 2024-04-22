<script lang="ts" setup>
import { computed, ref } from 'vue';
import BButton from './BButton.vue';

interface BDate {
  date: number;
  month: number;
  year: number;
  cssClass?: string;
}

export interface BDatePickerProps {
  modelValue: any;
}
const props = withDefaults(defineProps<BDatePickerProps>(), {});

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param <code>value: any</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: any): void;
}>();
//#endregion

const dates = ref<BDate[]>([]);
const viewMonth = ref(new Date());
const viewYear = ref(new Date());
const days = ref(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

//#region Methods
const selectDate = ({ year, month, date }: BDate) => {
  value.value = new Date(year, month, date, 0, 0, 0, 0);
  if (month < viewMonth.value.getMonth()) {
    goToPreviousMonth();
  } else {
    goToNextMonth();
  }
};
const goToPreviousMonth = () => {
  viewMonth.value.setMonth(viewMonth.value.getMonth() - 1);
  generateDates();
};
const goToNextMonth = () => {
  viewMonth.value.setMonth(viewMonth.value.getMonth() + 1);
  generateDates();
};
const isSelectedDate = (date: BDate) => {
  return (
    date.date === value.value.getDate() &&
    date.month === value.value.getMonth() &&
    date.year === value.value.getFullYear()
  );
};
const formatDateToMonthYear = (date: Date) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};
const generateDates = () => {
  dates.value = [];

  let d = structuredClone(viewMonth.value);
  d = structuredClone(new Date(d.setDate(1)));
  let endOfMonth = structuredClone(viewMonth.value);
  endOfMonth = new Date(
    new Date(endOfMonth.setMonth(endOfMonth.getMonth() + 1)).setDate(0),
  );

  let preDateCount = d.getDay() === 0 ? 6 : d.getDay() - 1; // Sunday -> d.getDay() === 0
  while (preDateCount > 0) {
    const preD = structuredClone(d);
    preD.setDate(-(preDateCount - 1));
    dates.value.push({
      date: preD.getDate(),
      month: preD.getMonth(),
      year: preD.getFullYear(),
      cssClass: 'ds-text-gray-300',
    });
    preDateCount--;
  }

  while (d <= endOfMonth) {
    dates.value.push({
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
    });
    d.setDate(d.getDate() + 1);
  }

  const postDateCount = d.getDay() === 0 ? 1 : 7 - d.getDay() + 1;
  let i = 1;
  const postD = structuredClone(d);
  console.log(postDateCount);
  while (i <= postDateCount) {
    postD.setDate(i);
    dates.value.push({
      date: postD.getDate(),
      month: postD.getMonth(),
      year: postD.getFullYear(),
      cssClass: 'ds-text-gray-300',
    });
    i++;
  }
};
const init = () => {
  generateDates();
};

init();
//#endregion
</script>

<template>
  <div class="ds-grid ds-w-80 ds-gap-4 ds-rounded-lg ds-p-4 ds-shadow-2xl">
    <div class="ds-flex ds-w-full ds-items-center ds-justify-between">
      <button
        class="ds-cursor-pointer ds-rounded-lg ds-fill-primary-t ds-p-3 hover:ds-bg-gray-150"
        @click="goToPreviousMonth"
      >
        <svg
          class="ds-h-4 ds-w-4"
          viewBox="0 0 320 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
          ></path>
        </svg>
      </button>
      <div>{{ formatDateToMonthYear(viewMonth) }}</div>
      <button
        class="ds-cursor-pointer ds-rounded-lg ds-fill-primary-t ds-p-3 hover:ds-bg-gray-150"
        @click="goToNextMonth"
      >
        <svg
          class="ds-h-4 ds-w-4"
          viewBox="0 0 320 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
          ></path>
        </svg>
      </button>
    </div>

    <div
      class="ds-grid ds-w-full ds-grid-cols-7 ds-gap-1 ds-text-xs ds-text-gray-400"
    >
      <div v-for="(_, i) in days" :key="i" class="ds-flex ds-justify-center">
        {{ i < 6 ? days[i + 1] : days[0] }}
      </div>
    </div>

    <div class="ds-grid ds-w-full ds-grid-cols-7 ds-gap-1">
      <div
        v-for="i in dates"
        :key="`${i.date}${i.month}`"
        :class="[
          i.cssClass,
          isSelectedDate(i)
            ? 'ds-bg-primary-t  ds-text-white'
            : 'hover:ds-bg-gray-150',
        ]"
        class="focus ds-flex ds-h-9 ds-w-9 ds-cursor-pointer ds-items-center ds-justify-center ds-rounded-full"
        @click="selectDate(i)"
      >
        {{ i.date }}
      </div>
    </div>

    <div class="ds-grid ds-w-full ds-grid-cols-2 ds-gap-2">
      <BButton>Cancel</BButton>
      <BButton type="primary">Confirm</BButton>
    </div>
  </div>
</template>
