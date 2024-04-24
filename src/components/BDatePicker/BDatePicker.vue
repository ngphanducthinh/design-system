<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
import { useDate } from '@/composables/Date';
import BDatePickerYearGrid from '@/components/BDatePicker/BDatePickerYearGrid.vue';

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
const CURRENT_DATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate(),
);

const { t } = useI18n();
const { formatMonthYear } = useDate();
const viewDate = ref(CURRENT_DATE);
const viewDatePreview = ref(CURRENT_DATE);
const valuePreview = ref<Date | string>(CURRENT_DATE);
const isVisibleMenu = ref(false);
const view = ref<BDatePickerView>(BDatePickerView.Dates);
const inputMaskRef = ref<HTMLInputElement | null>(null);
const datePickerRef = ref<HTMLDivElement | null>(null);
const datePickerMenuRef = ref<HTMLDivElement | null>(null);
const dates = ref<BDatePickerDateItem[]>([]);
const months = ref<BDatePickerDateItem[]>([]);
const years = ref<BDatePickerDateItem[]>([]);
const yearsViewHeading = ref('');
const monthsViewHeading = ref('');
const datesViewHeading = ref('');
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
const viewData = computed<Record<BDatePickerView, any>>(() => ({
  [BDatePickerView.Years]: {
    heading: yearsViewHeading.value,
    handleClickHeading: () => {},
    handleClickPreview: handleSwitchToPreviousDecade,
    handleClickNext: handleSwitchToNextDecade,
  },
  [BDatePickerView.Months]: {
    heading: monthsViewHeading.value,
    handleClickHeading: handleSwitchToYearsView,
    handleClickPreview: handleSwitchToPreviousYear,
    handleClickNext: handleSwitchToNextYear,
  },
  [BDatePickerView.Dates]: {
    heading: datesViewHeading.value,
    handleClickHeading: handleSwitchToMonthsView,
    handleClickPreview: handleSwitchToPreviousMonth,
    handleClickNext: handleSwitchToNextMonth,
  },
}));
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
    if (isNotSyncedModelValue(val)) {
      value.value = val;
      viewDate.value = val;
      valuePreview.value = val;
      viewDatePreview.value = val;
    }
    if (isNotSyncedModelValue(getInputMaskDate())) {
      mask.value = formatDateMoment(props.modelValue);
    }
  },
);
watch(isVisibleMenu, (val) => {
  if (val) {
    valuePreview.value = structuredClone(value.value);
    viewDatePreview.value = structuredClone(viewDate.value);
  }
});
//#endregion

//#region Methods
const handleSwitchToMonthsView = () => {
  view.value = BDatePickerView.Months;
};
const handleSwitchToYearsView = () => {
  view.value = BDatePickerView.Years;
};
const isNotSyncedModelValue = (date: any) => {
  const ruleEngine = [
    !props.modelValue && date,
    !date && props.modelValue,
    props.modelValue && date && props.modelValue.getTime() !== date.getTime(),
  ];

  return ruleEngine.some((r) => r);
};
const handleCancel = () => {
  isVisibleMenu.value = false;
};
const handleConfirm = () => {
  isVisibleMenu.value = false;
  value.value = structuredClone(valuePreview.value);
  viewDate.value = structuredClone(viewDatePreview.value);
};
const handleSelectYear = (selectedDate: Date) => {
  viewDatePreview.value = structuredClone(selectedDate);
  generateMonths();
  view.value = BDatePickerView.Months;
};
const handleSelectMonth = (selectedDate: Date) => {
  viewDatePreview.value = structuredClone(selectedDate);
  generateDates();
  view.value = BDatePickerView.Dates;
};
const handleSelectDate = (selectedDate: Date) => {
  viewDatePreview.value = structuredClone(selectedDate);
  generateDates();
};
const handleSwitchToPreviousDecade = () => {
  switchToDecade(-1);
  generateYears();
};
const handleSwitchToNextDecade = () => {
  switchToDecade(1);
  generateYears();
};
const switchToDecade = (decadeCount: number) => {
  viewDatePreview.value = new Date(
    viewDatePreview.value.getFullYear() + decadeCount * 10,
    viewDatePreview.value.getMonth(),
    viewDatePreview.value.getDate(),
  );
};
const handleSwitchToPreviousYear = () => {
  switchToYear(-1);
  generateMonths();
};
const handleSwitchToNextYear = () => {
  switchToYear(1);
  generateMonths();
};
const switchToYear = (yearCount: number) => {
  viewDatePreview.value = new Date(
    viewDatePreview.value.getFullYear() + yearCount,
    viewDatePreview.value.getMonth(),
    viewDatePreview.value.getDate(),
  );
};
const handleSwitchToPreviousMonth = () => {
  switchToMonth(-1);
  generateDates();
};
const handleSwitchToNextMonth = () => {
  switchToMonth(1);
  generateDates();
};
const switchToMonth = (monthCount: number) => {
  // Vue: updating the existing Date object directly won’t trigger reactivity, so creating a new Date object to ensure reactivity
  viewDatePreview.value = new Date(
    viewDatePreview.value.getFullYear(),
    viewDatePreview.value.getMonth() + monthCount,
    viewDatePreview.value.getDate(),
  );
};
const handleToggleMenu = () => {
  if (props.disabled) {
    return;
  }
  isVisibleMenu.value = !isVisibleMenu.value;
};
const isOutOfValidRange = (d: Date) => {
  return (
    (props.minDate ? props.minDate > d : true) ||
    (props.maxDate ? d > props.maxDate : true)
  );
};
const getStartOfMonth = (date: Date) => {
  const d = structuredClone(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const getEndOfMonth = (date: Date) => {
  const d = structuredClone(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};
const generateDates = () => {
  dates.value = [];

  const d = getStartOfMonth(viewDatePreview.value);
  const endOfMonth = getEndOfMonth(viewDatePreview.value);

  let preDateCount = d.getDay() === 0 ? 6 : d.getDay() - 1; // Sunday -> d.getDay() === 0
  while (preDateCount > 0) {
    const preD = structuredClone(d);
    preD.setDate(-(preDateCount - 1));
    dates.value.push({
      date: preD.getDate(),
      month: preD.getMonth(),
      year: preD.getFullYear(),
      secondary: true,
      disabled: isOutOfValidRange(preD),
    });
    preDateCount--;
  }

  while (d <= endOfMonth) {
    dates.value.push({
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      disabled: isOutOfValidRange(d),
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
        secondary: true,
        disabled: isOutOfValidRange(postD),
      });
      i++;
    }
  }

  datesViewHeading.value = formatMonthYear(viewDatePreview.value).toString();
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
  if (date) {
    value.value = structuredClone(date);
    viewDate.value = structuredClone(date);
    valuePreview.value = structuredClone(date);
    viewDatePreview.value = structuredClone(date);
    generateDates();
  } else {
    value.value = '';
    valuePreview.value = '';
  }
};
const onBlur = () => {
  const date = getInputMaskDate();
  validate();
  if (!isNotSyncedModelValue(date)) {
    return;
  }
  if (date) {
    value.value = structuredClone(date);
    viewDate.value = structuredClone(date);
    valuePreview.value = structuredClone(date);
    viewDatePreview.value = structuredClone(date);
    generateDates();
  } else {
    value.value = '';
    valuePreview.value = '';
  }
};
const formatDateMoment = (date: string | Date) =>
  checkIfISOFormat(date) ? moment(date).format(DATE_FORMAT) : date;
const generateYears = () => {
  years.value = [];

  const decade = viewDatePreview.value.getFullYear().toString().slice(0, -1);
  const startYear = +`${decade}0`;
  const endYear = +`${decade}9`;

  years.value.push({
    year: startYear - 1,
    month: 1,
    date: 1,
    secondary: true,
  });
  for (let i = startYear; i <= endYear; i++) {
    years.value.push({
      year: i,
      month: 1,
      date: 1,
    });
  }
  years.value.push({
    year: endYear + 1,
    month: 1,
    date: 1,
    secondary: true,
  });

  yearsViewHeading.value = `${decade}0 - ${decade}9`;
};
const generateMonths = () => {
  months.value = [];

  for (let i = 0; i < 12; i++) {
    months.value.push({
      year: viewDatePreview.value.getFullYear(),
      month: i,
      date: 1,
    });
  }

  monthsViewHeading.value = viewDatePreview.value.getFullYear().toString();
};
const init = () => {
  generateYears();
  generateMonths();
  generateDates();
};

init();
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  mask = IMask(inputMaskRef.value!, inputMaskOptions.value);
  mask.value = formatDateMoment(props.modelValue);
  mask.on('accept', onAccept);
  mask.on('complete', onComplete);
});
onBeforeUnmount(() => {
  unlockScrollBody();
});
//#endregion
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

      <Transition
        enter-active-class="ds-transition-all ds-ease-in-out"
        enter-from-class="ds-opacity-0"
        enter-to-class="ds-opacity-1"
        leave-active-class="ds-transition-all ds-ease-in-out"
        leave-from-class="ds-opacity-1"
        leave-to-class="ds-opacity-0"
      >
        <div
          v-show="isVisibleMenu"
          ref="datePickerMenuRef"
          class="ds-absolute ds-z-50 ds-mt-1 ds-grid ds-w-80 ds-gap-5 ds-rounded-lg ds-bg-white ds-p-3 ds-shadow-2xl"
        >
          <div class="ds-flex ds-w-full ds-items-center ds-justify-between">
            <BDatePickerPreviousButton
              @click="viewData[view].handleClickPreview()"
            />
            <BDatePickerHeading @click="viewData[view].handleClickHeading()">
              {{ viewData[view].heading }}
            </BDatePickerHeading>
            <BDatePickerNextButton @click="viewData[view].handleClickNext()" />
          </div>

          <BDatePickerYearGrid
            v-if="view === BDatePickerView.Years"
            v-model="valuePreview"
            :years
            @update:model-value="handleSelectYear"
          />
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
      </Transition>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
