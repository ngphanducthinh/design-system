<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import BButton from '../BButton.vue';
import BLabel from '../BLabel.vue';
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { v4 as uuid } from 'uuid';
import BErrorMessage from '../BErrorMessage.vue';
import { useI18n } from 'vue-i18n';
import {
  ensureVisiblePosition,
  lockScrollBody,
  resetPosition,
  unlockScrollBody,
} from '@/helpers/ComponentHelper';
import IMask from '@/vendor/imask-7.1.3.js'; // https://imask.js.org/guide.html#getting-started
import moment from 'moment-mini';
import { DateDelimiter } from '@/constants/Common';
import { checkIfISOFormat } from '@/helpers/DateHelper';
import BDatePickerDateGrid from '@/components/BDatePicker/BDatePickerDateGrid.vue';
import BDatePickerMonthGrid from '@/components/BDatePicker/BDatePickerMonthGrid.vue';
import type { BDatePickerDateItem } from '@/types';
import BDatePickerPreviousButton from '@/components/BDatePicker/BDatePickerPreviousButton.vue';
import BDatePickerNextButton from '@/components/BDatePicker/BDatePickerNextButton.vue';
import BDatePickerHeading from '@/components/BDatePicker/BDatePickerHeading.vue';
import BDatePickerIcon from '@/components/BDatePicker/BDatePickerIcon.vue';

interface BDate {
  date: number;
  month: number;
  year: number;
  cssClass?: string;
}

enum BDatePickerView {
  Dates = 'dates',
  Months = 'months',
  Years = 'years',
}

export interface BDatePickerProps {
  inputId?: string;
  modelValue: any;
  label?: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  placeholder?: string;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  disabled?: boolean;
  inputCssClass?: string;
  /**
   * Minimum selectable date
   */
  minDate?: any;
  /**
   * Maximum selectable date
   */
  maxDate?: any;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Position of picker dropdown when it's showed up
   */
  position?: string;
}

const props = withDefaults(defineProps<BDatePickerProps>(), {
  inputId: '',
  label: '',
  validationRules: undefined,
  placeholder: '',
  required: false,
  requiredErrorMessage: '',
  disabled: false,
  inputCssClass: '',
  minDate: '',
  maxDate: '',
  hideDetails: false,
  position: 'bottom left',
});

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

//#region Data
let mask: any;
const DATE_FORMAT = `DD${DateDelimiter}MM${DateDelimiter}YYYY`; // moment's date format
const { t } = useI18n();
const dates = ref<BDate[]>([]);
const viewMonth = ref(new Date());
const viewMonthPreview = ref(new Date());
const valuePreview = ref<Date | string>(new Date());
const viewYear = ref(new Date());
const viewYearPreview = ref(new Date());
const isVisibleMenu = ref(false);
const view = ref<BDatePickerView>(BDatePickerView.Dates);
const inputMaskRef = ref<HTMLInputElement | null>(null);
const datePickerRef = ref<HTMLDivElement | null>(null);
const datePickerMenuRef = ref<HTMLDivElement | null>(null);
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
const months = ref<BDatePickerDateItem[]>([]);
const validateRequired: ValidationRule = {
  validateRule: (val) => !!val,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};

// The "Failed to execute 'querySelector' on Document" error occurs when using querySelector method with an identifier that starts with a digit
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
const vRules = computed(() => {
  let result: ValidationRule[] = [];

  if (props.required) {
    result.push(validateRequired);
  }
  if (props.validationRules) {
    result = result.concat(props.validationRules);
  }

  return result.length ? result : undefined;
});
const { validate, validationResult } = useValidationField(
  id.value,
  valuePreview,
  vRules.value,
);
const inputCssClassValue = computed(() => [
  'ds-border ds-rounded-lg ds-block ds-w-full ds-text-sm ds-px-3 ds-h-[40px]',
  {
    'ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/[0.4]': props.disabled,
    'ds-text-black/[0.85]': !props.disabled,
    'ds-border-error focus:ds-ring-1 focus:ds-ring-error':
      !validationResult.value.valid,
    'ds-border-black/[0.1] focus:ds-border-focus focus:ds-ring-1 focus:ds-ring-focus':
      validationResult.value.valid,
    '!ds-border-focus ds-ring-1 ds-ring-focus': isVisibleMenu.value,
  },
  props.inputCssClass,
]);
const inputMaskOptions = computed(() => {
  const result: any = {
    mask: IMask.MaskedDate,
    pattern: DATE_FORMAT,
    lazy: true,

    format: (date: any) => moment(date).format(DATE_FORMAT),
    parse: (str: string) => moment(str, DATE_FORMAT),

    blocks: {
      YYYY: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 9999,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
    },
  };

  if (props.minDate) {
    result.min = props.minDate;
  }
  if (props.maxDate) {
    result.max = props.maxDate;
  }

  return result;
});
//#endregion

//#region Watchers
watch(isVisibleMenu, (val) => {
  if (val) {
    lockScrollBody();
    ensureVisiblePosition(datePickerRef.value!, datePickerMenuRef.value!);
  } else {
    unlockScrollBody();
    resetPosition(datePickerRef.value!, datePickerMenuRef.value!);
  }
});
watch(
  () => props.modelValue,
  (val) => {
    if (isUnsyncedModelValue(val)) {
      value.value = val;
      viewMonth.value = val;
      valuePreview.value = val;
      viewMonthPreview.value = val;
    }
    if (isUnsyncedModelValue(getInputMaskDate())) {
      mask.value = formatDate(props.modelValue);
    }
  },
);
//#endregion

//#region Methods
const handleSwitchToView = (v: BDatePickerView) => {
  view.value = v;
};
const isUnsyncedModelValue = (date: any) => {
  const ruleEngine = [
    !props.modelValue && date,
    !date && props.modelValue,
    props.modelValue && date && props.modelValue.getTime() !== date.getTime(),
  ];

  return ruleEngine.some((r) => r);
};
const handleCancel = () => {
  valuePreview.value = structuredClone(value.value);
  viewMonthPreview.value = structuredClone(viewMonth.value);
  isVisibleMenu.value = false;
  generateDates();
};
const handleConfirm = () => {
  value.value = structuredClone(valuePreview.value);
  viewMonth.value = structuredClone(viewMonthPreview.value);
  isVisibleMenu.value = false;
};
const handleSelectYear = () => {};
const handleSelectMonth = (selectedDate: Date) => {
  console.log(selectedDate);
  console.log(viewMonthPreview.value);
  const selectedDateYear = selectedDate.getFullYear();
  const selectedDateMonth = selectedDate.getMonth();
  const viewMonthPreviewYear = viewMonthPreview.value.getFullYear();
  const viewMonthPreviewMonth = viewMonthPreview.value.getMonth();
  const yearCount = Math.abs(selectedDateYear - viewMonthPreviewYear);
  let monthCount = 0;

  console.log('yearCount', yearCount);
  if (selectedDateYear < viewMonthPreviewYear) {
    monthCount -= yearCount * 12;
  }
  if (selectedDateYear > viewMonthPreviewYear) {
    monthCount += yearCount * 12;
  }
  if (selectedDateMonth < viewMonthPreviewMonth) {
    monthCount -= viewMonthPreviewMonth - selectedDateMonth;
  }
  if (selectedDateMonth > viewMonthPreviewMonth) {
    monthCount += selectedDateMonth - viewMonthPreviewMonth;
  }

  console.log('monthCount', monthCount);
  if (monthCount !== 0) {
    switchToMonth(monthCount);
  }

  view.value = BDatePickerView.Dates;
};
const handleSelectDate = (selectedDate: Date) => {
  console.log(selectedDate);
  console.log(viewMonthPreview.value);
  const selectedDateYear = selectedDate.getFullYear();
  const selectedDateMonth = selectedDate.getMonth();
  const viewMonthPreviewYear = viewMonthPreview.value.getFullYear();
  const viewMonthPreviewMonth = viewMonthPreview.value.getMonth();
  const yearCount = Math.abs(selectedDateYear - viewMonthPreviewYear);
  let monthCount = 0;

  console.log('yearCount', yearCount);
  if (selectedDateYear < viewMonthPreviewYear) {
    monthCount -= yearCount * 12;
  }
  if (selectedDateYear > viewMonthPreviewYear) {
    monthCount += yearCount * 12;
  }
  if (selectedDateMonth < viewMonthPreviewMonth) {
    monthCount -= viewMonthPreviewMonth - selectedDateMonth;
  }
  if (selectedDateMonth > viewMonthPreviewMonth) {
    monthCount += selectedDateMonth - viewMonthPreviewMonth;
  }

  console.log('monthCount', monthCount);
  if (monthCount !== 0) {
    switchToMonth(monthCount);
  }
};
const handleSwitchToPreviousMonth = () => {
  switchToMonth(-1);
};
const handleSwitchToNextMonth = () => {
  switchToMonth(1);
};
const switchToMonth = (monthCount: number) => {
  viewMonthPreview.value.setMonth(
    viewMonthPreview.value.getMonth() + monthCount,
  );
  generateDates();
};
const handleToggleMenu = () => {
  isVisibleMenu.value = !isVisibleMenu.value;
};
const formatDateToMonthYear = (date: Date) => {
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};
const generateDates = () => {
  dates.value = [];

  let d = structuredClone(viewMonthPreview.value);
  d = structuredClone(new Date(d.setDate(1)));
  let endOfMonth = structuredClone(viewMonthPreview.value);
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
  if (postDateCount < 6) {
    let i = 1;
    const postD = structuredClone(d);
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
  }
};
const getInputMaskDate = () => {
  const arr = mask.value.split('/');
  const dateStr = `${arr[2]}-${arr[1]}-${arr[0]}`;
  // Check if string is in ISO format
  if (moment(dateStr, moment.ISO_8601, true).isValid()) {
    return new Date(dateStr);
  }

  return undefined;
};
const onAccept = () => {
  if (!mask.unmaskedValue) {
    // emit('update:modelValue', '');
    value.value = '';
    valuePreview.value = '';
  }
};
const onComplete = () => {
  const date = getInputMaskDate();
  // return date ? emit('update:modelValue', date) : emit('update:modelValue', '');
  if (date) {
    value.value = date;
    viewMonth.value = date;
    valuePreview.value = date;
    viewMonthPreview.value = date;
  } else {
    value.value = '';
    valuePreview.value = '';
  }
};
const onBlur = () => {
  const date = getInputMaskDate();
  validate();
  if (!isUnsyncedModelValue(date)) {
    return;
  }
  // emit('update:modelValue', date === undefined ? '' : date);
  if (date) {
    value.value = date;
    viewMonth.value = date;
    valuePreview.value = date;
    viewMonthPreview.value = date;
  } else {
    value.value = '';
    valuePreview.value = '';
  }
};
const formatDate = (date: string | Date) =>
  checkIfISOFormat(date) ? moment(date).format(DATE_FORMAT) : date;
const initMonths = () => {
  for (let i = 0; i < 11; i++) {
    months.value.push({ year: value.value.getFullYear(), month: i, date: 1 });
  }
};
const init = () => {
  initMonths();
  generateDates();
};

init();
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  mask = IMask(inputMaskRef.value!, inputMaskOptions.value);
  mask.value = formatDate(props.modelValue);
  mask.on('accept', onAccept);
  mask.on('complete', onComplete);
});
onBeforeUnmount(() => {
  unlockScrollBody();
});
//#endregion

const headingData = shallowRef<Record<BDatePickerView, any>>({
  [BDatePickerView.Years]: {
    text: '',
    handleClick: () => {},
  },
  [BDatePickerView.Months]: {
    text: viewMonthPreview.value.getFullYear(),
    handleClick: () => handleSwitchToView(BDatePickerView.Years),
  },
  [BDatePickerView.Dates]: {
    text: formatDateToMonthYear(viewMonthPreview.value),
    handleClick: () => handleSwitchToView(BDatePickerView.Months),
  },
});
</script>

<template>
  <div>
    <div ref="datePickerRef">
      <BLabel :id="id" :label="label" :required="required" />

      <div class="ds-relative">
        <input
          :id="id"
          ref="inputMaskRef"
          :class="inputCssClassValue"
          :disabled="disabled"
          :placeholder="placeholder"
          class="ds-drop-shadow-light"
          @blur="onBlur"
        />
        <!--NOTE: Remove ds.components.base.date_picker.today-->
        <BDatePickerIcon :disabled="props.disabled" @click="handleToggleMenu" />
      </div>

      <div
        v-show="isVisibleMenu"
        ref="datePickerMenuRef"
        class="ds-absolute ds-z-50 ds-mt-1 ds-grid ds-w-80 ds-gap-4 ds-rounded-lg ds-bg-white ds-p-4 ds-shadow-2xl"
      >
        <div class="ds-flex ds-w-full ds-items-center ds-justify-between">
          <BDatePickerPreviousButton @click="handleSwitchToPreviousMonth" />
          <BDatePickerHeading @click="headingData[view].handleClick">
            {{ headingData[view].text }}
          </BDatePickerHeading>
          <BDatePickerNextButton @click="handleSwitchToNextMonth" />
        </div>

        <BDatePickerMonthGrid
          v-if="view === BDatePickerView.Months"
          v-model="valuePreview"
          :months
          @update:model-value="handleSelectMonth"
        />
        <BDatePickerDateGrid
          v-if="view === BDatePickerView.Dates"
          v-model="valuePreview"
          :dates
          @update:model-value="handleSelectDate"
        />

        <div class="ds-grid ds-w-full ds-grid-cols-2 ds-gap-2">
          <BButton @click="handleCancel">
            {{ t('ds.components.base.date_picker.buttons.cancel') }}
          </BButton>
          <BButton type="primary" @click="handleConfirm">
            {{ t('ds.components.base.date_picker.buttons.confirm') }}
          </BButton>
        </div>
      </div>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
