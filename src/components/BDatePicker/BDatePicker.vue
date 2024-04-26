<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import BButton from '@/components/BButton.vue';
import BLabel from '@/components/BLabel.vue';
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
import type { BDatePickerDateItem, BDatePickerViewData } from '@/types';
import BDatePickerPreviousButton from '@/components/BDatePicker/BDatePickerPreviousButton.vue';
import BDatePickerNextButton from '@/components/BDatePicker/BDatePickerNextButton.vue';
import BDatePickerHeading from '@/components/BDatePicker/BDatePickerHeading.vue';
import BDatePickerIcon from '@/components/BDatePicker/BDatePickerIcon.vue';
import { useDate } from '@/composables/Date';
import BDatePickerYearGrid from '@/components/BDatePicker/BDatePickerYearGrid.vue';
import { isNil } from 'lodash-es';

enum BDatePickerView {
  Dates = 'dates',
  Months = 'months',
  Years = 'years',
}

//#region Props
export interface BDatePickerProps {
  /**
   * ID of input field.
   */
  inputId?: string;
  /**
   * Value v-model: <code>Date | string</code>
   */
  modelValue?: Date;
  /**
   * Label of the field.
   */
  label?: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  /**
   * Placeholder of input field.
   */
  placeholder?: string;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  /**
   * Error message when the field is empty.
   */
  requiredErrorMessage?: string;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Custom CSS of input field.
   */
  inputCssClass?: string;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
}

const props = withDefaults(defineProps<BDatePickerProps>(), {
  inputId: '',
  modelValue: undefined,
  label: '',
  validationRules: undefined,
  placeholder: '',
  required: false,
  requiredErrorMessage: '',
  disabled: false,
  inputCssClass: '',
  minDate: undefined,
  maxDate: undefined,
  hideDetails: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param <code>value: any</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value?: Date): void;
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
const viewDate = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
});
const viewDateDisplay = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
});
const valueDisplay = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
});
const isVisibleMenu = ref(false);
const view = ref<BDatePickerView>(BDatePickerView.Dates);
const inputMaskRef = ref<HTMLInputElement | null>(null);
const datePickerRef = ref<HTMLDivElement | null>(null);
const datePickerMenuRef = ref<HTMLDivElement | null>(null);
const dates = ref<BDatePickerDateItem[]>([]);
const months = ref<BDatePickerDateItem[]>([]);
const years = ref<BDatePickerDateItem[]>([]);
const viewHeading = ref('');
const viewLeftNavDisabled = ref(false);
const viewRightNavDisabled = ref(false);
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
  value,
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
const viewData = computed<Record<BDatePickerView, BDatePickerViewData>>(() => ({
  [BDatePickerView.Years]: {
    handleClickPreview: handleSwitchToPreviousDecade,
    handleClickNext: handleSwitchToNextDecade,
  },
  [BDatePickerView.Months]: {
    handleClickPreview: handleSwitchToPreviousYear,
    handleClickNext: handleSwitchToNextYear,
    handleClickHeading: handleSwitchToYearsView,
  },
  [BDatePickerView.Dates]: {
    handleClickPreview: handleSwitchToPreviousMonth,
    handleClickNext: handleSwitchToNextMonth,
    handleClickHeading: handleSwitchToMonthsView,
  },
}));
//#endregion

//#region Watchers
watch(isVisibleMenu, (val) => {
  if (val) {
    lockScrollBody();
    ensureVisiblePosition(datePickerRef.value!, datePickerMenuRef.value!);
    valueDisplay.value = value.value ? cloneItemFromDate(value.value) : {};
    viewDateDisplay.value = cloneItem(viewDate.value);
  } else {
    unlockScrollBody();
    resetPosition(datePickerRef.value!, datePickerMenuRef.value!);
  }
});
watch(
  () => props.modelValue,
  (val) => {
    if (isNotSyncedModelValue(val)) {
      valueDisplay.value = val ? cloneItemFromDate(val) : {};
      viewDate.value = val ? cloneItemFromDate(val, true) : {};
      viewDateDisplay.value = val ? cloneItemFromDate(val, true) : {};
    }
    if (isNotSyncedModelValue(getInputMaskDate())) {
      mask.value = formatDateMoment(props.modelValue || '');
    }
  },
);
//#endregion

//#region Methods
const handleSwitchToMonthsView = () => {
  generateMonths();
  view.value = BDatePickerView.Months;
};
const handleSwitchToYearsView = () => {
  generateYears();
  view.value = BDatePickerView.Years;
};
const isNotSyncedModelValue = (date: any) => {
  const ruleEngine = [
    !props.modelValue && date,
    !date && props.modelValue,
    props.modelValue && date && props.modelValue?.getTime() !== date.getTime(),
  ];
  return ruleEngine.some((r) => r);
};
const handleCancel = () => {
  isVisibleMenu.value = false;
};
const handleConfirm = () => {
  isVisibleMenu.value = false;
  if (
    valueDisplay.value.year &&
    valueDisplay.value.month &&
    valueDisplay.value.date
  ) {
    value.value = new Date(
      valueDisplay.value.year,
      valueDisplay.value.month,
      valueDisplay.value.date,
    );
  } else {
    value.value = undefined;
  }
  viewDate.value = cloneItem(viewDateDisplay.value);
};
const cloneItem = (
  item: BDatePickerDateItem,
  ignoreDate?: boolean,
): BDatePickerDateItem => ({
  year: item.year,
  month: item.month,
  date: ignoreDate ? undefined : item.date,
});
const cloneItemFromDate = (
  date: Date,
  ignoreDate?: boolean,
): BDatePickerDateItem => ({
  year: date.getFullYear(),
  month: date.getMonth(),
  date: ignoreDate ? undefined : date.getDate(),
});
const handleSelectYear = (item: BDatePickerDateItem) => {
  viewDateDisplay.value = cloneItem(item);
  generateMonths();
  view.value = BDatePickerView.Months;
};
const handleSelectMonth = (item: BDatePickerDateItem) => {
  viewDateDisplay.value = cloneItem(item);
  generateDates();
  view.value = BDatePickerView.Dates;
};
const handleSelectDate = (item: BDatePickerDateItem) => {
  if (
    item.year === valueDisplay.value.year &&
    item.month === valueDisplay.value.month &&
    item.date === valueDisplay.value.date
  ) {
    // Item will be unselected when clicking again on it
    valueDisplay.value = cloneItem({});
  } else {
    valueDisplay.value = cloneItem(item);
    viewDateDisplay.value = cloneItem(item, true);
    generateDates();
  }
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
  if (isNil(viewDateDisplay.value.year)) {
    return;
  }
  viewDateDisplay.value.year += decadeCount * 10;
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
  if (isNil(viewDateDisplay.value.year)) {
    return;
  }
  viewDateDisplay.value.year += yearCount;
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
  if (isNil(viewDateDisplay.value.month)) {
    return;
  }
  viewDateDisplay.value.month += monthCount;
};
const handleToggleMenu = () => {
  if (props.disabled) {
    return;
  }
  isVisibleMenu.value = !isVisibleMenu.value;
};
const isOutOfRangeYear = (year: number) =>
  (props.minDate ? props.minDate.getFullYear() > year : false) ||
  (props.maxDate ? year > props.maxDate.getFullYear() : false);
const isOutOfRangeMonth = (year: number, month: number) =>
  (props.minDate
    ? (props.minDate.getFullYear() === year &&
        props.minDate.getMonth() > month) ||
      props.minDate.getFullYear() > year
    : false) ||
  (props.maxDate
    ? (props.maxDate.getFullYear() === year &&
        props.maxDate.getMonth() < month) ||
      props.maxDate.getFullYear() < year
    : false);
const isOutOfRangeDate = (date: Date) =>
  (props.minDate ? props.minDate > date : false) ||
  (props.maxDate ? date > props.maxDate : false);
const getStartOfMonth = (year: number, month: number) =>
  new Date(year, month, 1);
const getEndOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0);
const generateYears = () => {
  years.value = [];

  if (isNil(viewDateDisplay.value.year)) {
    return;
  }

  const decade = viewDateDisplay.value.year.toString().slice(0, -1);
  const startYear = +`${decade}0`;
  const endYear = +`${decade}9`;

  years.value.push({
    year: startYear - 1,
    secondary: true,
    disabled: isOutOfRangeYear(startYear - 1),
  });
  for (let i = startYear; i <= endYear; i++) {
    years.value.push({
      year: i,
      disabled: isOutOfRangeYear(i),
    });
  }
  years.value.push({
    year: endYear + 1,
    secondary: true,
    disabled: isOutOfRangeYear(endYear + 1),
  });

  viewHeading.value = `${decade}0 - ${decade}9`;

  const startDate = getStartOfMonth(startYear, 0);
  const endDate = getEndOfMonth(endYear, 11);
  updateNavDisabledState(startDate, endDate);
};
const generateMonths = () => {
  months.value = [];

  if (isNil(viewDateDisplay.value.year)) {
    return;
  }

  for (let i = 0; i < 12; i++) {
    months.value.push({
      year: viewDateDisplay.value.year,
      month: i,
      disabled: isOutOfRangeMonth(viewDateDisplay.value.year, i),
    });
  }

  viewHeading.value = viewDateDisplay.value.year.toString();

  const startDate = getStartOfMonth(viewDateDisplay.value.year, 0);
  const endDate = getEndOfMonth(viewDateDisplay.value.year, 11);
  updateNavDisabledState(startDate, endDate);
};
const generateDates = () => {
  dates.value = [];

  if (isNil(viewDateDisplay.value.year) || isNil(viewDateDisplay.value.month)) {
    return;
  }

  const startOfMonth = getStartOfMonth(
    viewDateDisplay.value.year,
    viewDateDisplay.value.month,
  );
  const endOfMonth = getEndOfMonth(
    viewDateDisplay.value.year,
    viewDateDisplay.value.month,
  );
  const d = structuredClone(startOfMonth);

  let preDateCount = d.getDay() === 0 ? 6 : d.getDay() - 1; // Sunday -> d.getDay() === 0
  while (preDateCount > 0) {
    const preD = structuredClone(d);
    preD.setDate(-(preDateCount - 1));
    dates.value.push({
      date: preD.getDate(),
      month: preD.getMonth(),
      year: preD.getFullYear(),
      secondary: true,
      disabled: isOutOfRangeDate(preD),
    });
    preDateCount--;
  }

  while (d <= endOfMonth) {
    dates.value.push({
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      disabled: isOutOfRangeDate(d),
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
        disabled: isOutOfRangeDate(postD),
      });
      i++;
    }
  }

  // NOTE: Basically 'date' is not unnecessary, just put a random value 1
  viewHeading.value = formatMonthYear(
    new Date(viewDateDisplay.value.year, viewDateDisplay.value.month, 1),
  ).toString();
  updateNavDisabledState(startOfMonth, endOfMonth);
};
const updateNavDisabledState = (startDate: Date, endDate: Date) => {
  viewLeftNavDisabled.value = props.minDate
    ? props.minDate >= startDate
    : false;
  viewRightNavDisabled.value = props.maxDate ? props.maxDate <= endDate : false;
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
    value.value = undefined;
    valueDisplay.value = {
      year: CURRENT_DATE.getFullYear(),
      month: CURRENT_DATE.getMonth(),
    };
  }
};
const onComplete = () => {
  const date = getInputMaskDate();
  if (date) {
    value.value = date;
    viewDate.value = cloneItemFromDate(date, true);
    valueDisplay.value = cloneItemFromDate(date);
    viewDateDisplay.value = cloneItemFromDate(date, true);
    generateDates();
  } else {
    value.value = undefined;
    valueDisplay.value = {
      year: CURRENT_DATE.getFullYear(),
      month: CURRENT_DATE.getMonth(),
    };
  }
};
const onBlur = () => {
  const date = getInputMaskDate();
  validate();
  if (!isNotSyncedModelValue(date)) {
    return;
  }
  if (date) {
    value.value = date;
    viewDate.value = cloneItemFromDate(date, true);
    valueDisplay.value = cloneItemFromDate(date);
    viewDateDisplay.value = cloneItemFromDate(date, true);
    generateDates();
  } else {
    value.value = undefined;
    valueDisplay.value = {
      year: CURRENT_DATE.getFullYear(),
      month: CURRENT_DATE.getMonth(),
    };
  }
};
const formatDateMoment = (date: string | Date) =>
  checkIfISOFormat(date) ? moment(date).format(DATE_FORMAT) : date;
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
  mask.value = formatDateMoment(props.modelValue || '');
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
              :disabled="viewLeftNavDisabled"
              @click="viewData[view].handleClickPreview()"
            />
            <BDatePickerHeading
              :class="{
                'ds-cursor-pointer hover:ds-bg-gray-150':
                  viewData[view].handleClickHeading,
              }"
              @click="
                viewData[view].handleClickHeading &&
                  viewData[view].handleClickHeading()
              "
            >
              {{ viewHeading }}
            </BDatePickerHeading>
            <BDatePickerNextButton
              :disabled="viewRightNavDisabled"
              @click="viewData[view].handleClickNext()"
            />
          </div>

          <BDatePickerYearGrid
            v-if="view === BDatePickerView.Years"
            :year="valueDisplay"
            :years
            @select:year="handleSelectYear"
          />
          <BDatePickerMonthGrid
            v-if="view === BDatePickerView.Months"
            :month="valueDisplay"
            :months
            @select:month="handleSelectMonth"
          />
          <BDatePickerDateGrid
            v-if="view === BDatePickerView.Dates"
            :date="valueDisplay"
            :dates
            @select:date="handleSelectDate"
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
