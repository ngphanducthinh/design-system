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
  date: -1, // -1 stands for empty value
});
const viewDateDisplay = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
  date: -1, // -1 stands for empty value
});
const valueDisplay = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
  date: -1, // -1 stands for empty value
});
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
const viewData = computed<Record<BDatePickerView, any>>(() => ({
  [BDatePickerView.Years]: {
    heading: yearsViewHeading.value,
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

    valueDisplay.value = cloneItemFromDate(value.value as Date);
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
      // value.value = val;
      valueDisplay.value = cloneItemFromDate(val);
      viewDate.value = cloneItemFromDate(val);
      viewDateDisplay.value = cloneItemFromDate(val);
    }
    if (isNotSyncedModelValue(getInputMaskDate())) {
      mask.value = formatDateMoment(props.modelValue || '');
    }
  },
);
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
    props.modelValue &&
      date &&
      (props.modelValue as Date).getTime() !== date.getTime(),
  ];

  return ruleEngine.some((r) => r);
};
const handleCancel = () => {
  isVisibleMenu.value = false;
};
const handleConfirm = () => {
  isVisibleMenu.value = false;
  if (
    valueDisplay.value.year === -1 &&
    valueDisplay.value.month === -1 &&
    valueDisplay.value.date === -1
  ) {
    value.value = undefined;
  } else {
    value.value = new Date(
      valueDisplay.value.year,
      valueDisplay.value.month,
      valueDisplay.value.date,
    );
  }
  viewDate.value = cloneItem(viewDateDisplay.value);
};
const cloneItem = (item?: BDatePickerDateItem): BDatePickerDateItem =>
  item
    ? {
        year: item.year,
        month: item.month,
        date: item.date,
      }
    : {
        year: -1,
        month: -1,
        date: -1,
      };
const cloneItemFromDate = (date?: Date): BDatePickerDateItem =>
  date
    ? {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
      }
    : {
        year: -1,
        month: -1,
        date: -1,
      };
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
    valueDisplay.value = cloneItem();
  } else {
    valueDisplay.value = cloneItem(item);
    viewDateDisplay.value = cloneItem(item);
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
const isOutOfRange = (date: Date) =>
  (props.minDate ? props.minDate > date : false) ||
  (props.maxDate ? date > props.maxDate : false);
const getStartOfMonth = ({ year, month }: BDatePickerDateItem) =>
  new Date(year, month, 1);
const getEndOfMonth = ({ year, month }: BDatePickerDateItem) =>
  new Date(year, month + 1, 0);
const generateYears = () => {
  years.value = [];

  const decade = viewDateDisplay.value.year.toString().slice(0, -1);
  const startYear = +`${decade}0`;
  const endYear = +`${decade}9`;

  years.value.push({
    year: startYear - 1,
    month: 0,
    date: 1,
    secondary: true,
    disabled: isOutOfRangeYear(startYear - 1),
  });
  for (let i = startYear; i <= endYear; i++) {
    years.value.push({
      year: i,
      month: 0,
      date: 1,
      disabled: isOutOfRangeYear(i),
    });
  }
  years.value.push({
    year: endYear + 1,
    month: 0,
    date: 1,
    secondary: true,
    disabled: isOutOfRangeYear(endYear + 1),
  });

  yearsViewHeading.value = `${decade}0 - ${decade}9`;
};
const generateMonths = () => {
  months.value = [];

  for (let i = 0; i < 12; i++) {
    months.value.push({
      year: viewDateDisplay.value.year,
      month: i,
      date: 1,
      disabled: isOutOfRangeMonth(viewDateDisplay.value.year, i),
    });
  }

  monthsViewHeading.value = viewDateDisplay.value.year.toString();
};
const generateDates = () => {
  dates.value = [];

  const d = getStartOfMonth(viewDateDisplay.value);
  const endOfMonth = getEndOfMonth(viewDateDisplay.value);

  let preDateCount = d.getDay() === 0 ? 6 : d.getDay() - 1; // Sunday -> d.getDay() === 0
  while (preDateCount > 0) {
    const preD = structuredClone(d);
    preD.setDate(-(preDateCount - 1));
    dates.value.push({
      date: preD.getDate(),
      month: preD.getMonth(),
      year: preD.getFullYear(),
      secondary: true,
      disabled: isOutOfRange(preD),
    });
    preDateCount--;
  }

  while (d <= endOfMonth) {
    dates.value.push({
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      disabled: isOutOfRange(d),
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
        disabled: isOutOfRange(postD),
      });
      i++;
    }
  }

  datesViewHeading.value = formatMonthYear(
    new Date(
      viewDateDisplay.value.year,
      viewDateDisplay.value.month,
      viewDateDisplay.value.date,
    ),
  ).toString();
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
      date: -1,
    };
  }
};
const onComplete = () => {
  const date = getInputMaskDate();
  if (date) {
    value.value = date;
    viewDate.value = cloneItemFromDate(date);
    valueDisplay.value = cloneItemFromDate(date);
    viewDateDisplay.value = cloneItemFromDate(date);
    generateDates();
  } else {
    value.value = undefined;
    valueDisplay.value = {
      year: CURRENT_DATE.getFullYear(),
      month: CURRENT_DATE.getMonth(),
      date: -1,
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
    viewDate.value = cloneItemFromDate(date);
    valueDisplay.value = cloneItemFromDate(date);
    viewDateDisplay.value = cloneItemFromDate(date);
    generateDates();
  } else {
    value.value = undefined;
    valueDisplay.value = {
      year: CURRENT_DATE.getFullYear(),
      month: CURRENT_DATE.getMonth(),
      date: -1,
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
              {{ viewData[view].heading }}
            </BDatePickerHeading>
            <BDatePickerNextButton @click="viewData[view].handleClickNext()" />
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
