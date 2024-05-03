<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
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
import BDatePickerGridDate from '@/components/BDatePicker/BDatePickerGridDate.vue';
import BDatePickerGridMonth from '@/components/BDatePicker/BDatePickerGridMonth.vue';
import type { BDatePickerDateItem, BDatePickerViewData } from '@/types';
import BDatePickerButtonPrevious from '@/components/BDatePicker/BDatePickerButtonPrevious.vue';
import BDatePickerButtonNext from '@/components/BDatePicker/BDatePickerButtonNext.vue';
import BDatePickerHeading from '@/components/BDatePicker/BDatePickerHeading.vue';
import BDatePickerIcon from '@/components/BDatePicker/BDatePickerIcon.vue';
import { useDate } from '@/composables/Date';
import BDatePickerGridYear from '@/components/BDatePicker/BDatePickerGridYear.vue';
import { isEmpty, isNil } from 'lodash-es';
import BDatePickerGridDateRange from '@/components/BDatePicker/BDatePickerGridDateRange.vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

enum BDatePickerView {
  Years = 'years',
  Months = 'months',
  Dates = 'dates',
}

//#region Props
export interface BDatePickerProps {
  /**
   * ID of input field.
   */
  inputId?: string;
  /**
   * Value v-model: <code>Date</code> when range is false, v-model: <code>Array<Date></code> when range is true.
   */
  modelValue?: Date | Date[];
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
   * Minimum selectable date <code>Date | number | string</code> (date object | number representing the timestamp | string in ISO 8601 format).
   */
  minDate?: Date | number | string;
  /**
   * Maximum selectable date <code>Date | number | string</code> (date object | number representing the timestamp | string in ISO 8601 format).
   */
  maxDate?: Date | number | string;
  /**
   * Allow to select a date range.
   */
  range?: boolean;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Default view mode when opening menu
   */
  view?: `${BDatePickerView}`;
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
  range: false,
  hideDetails: false,
  view: BDatePickerView.Dates,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param <code>Date</code> when range is false, unless param <code>Array<Date></code>.
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value?: Date | Date[]): void;
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

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');
const { t } = useI18n();
const { formatMonthYear } = useDate();
const valueDisplay = ref<BDatePickerDateItem>({});
const valueRangeDisplay = ref<BDatePickerDateItem[]>([]);
const viewDate = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
});
const viewDateDisplay = ref<BDatePickerDateItem>({
  year: CURRENT_DATE.getFullYear(),
  month: CURRENT_DATE.getMonth(),
});
const isVisibleMenu = ref(false);
const viewValue = ref<BDatePickerView>(props.view as BDatePickerView);
const datePickerRef = ref<HTMLDivElement | null>(null);
const datePickerMenuRef = ref<HTMLDivElement | null>(null);
const datePickerInputRef = ref<HTMLInputElement | null>(null);
const datePickerInputMaskRef = ref<HTMLInputElement | null>(null);
const dates = ref<BDatePickerDateItem[]>([]);
const months = ref<BDatePickerDateItem[]>([]);
const years = ref<BDatePickerDateItem[]>([]);
const viewHeading = ref('');
const viewLeftNavDisabled = ref(false);
const viewRightNavDisabled = ref(false);
const minValue = computed<Date | undefined>(() => {
  if (props.minDate) {
    switch (typeof props.minDate) {
      case 'object':
        return props.minDate;
      case 'number':
        return new Date(props.minDate);
      case 'string':
        return checkIfISOFormat(props.minDate)
          ? new Date(props.minDate)
          : undefined;
    }
  }
  return undefined;
});

const maxValue = computed<Date | undefined>(() => {
  switch (typeof props.maxDate) {
    case 'object':
      return props.maxDate;
    case 'number':
      return new Date(props.maxDate);
    case 'string':
      return checkIfISOFormat(props.maxDate)
        ? new Date(props.maxDate)
        : undefined;
  }
  return undefined;
});
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
const formattedValue = computed(() =>
  (props.modelValue as Date[])?.map((val) => formatDateMoment(val)).join(' - '),
);
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
  'ds-border ds-rounded-lg ds-block ds-w-full ds-text-sm ds-px-3 ds-h-[40px] ds-transition-all ds-ease-in-out',
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

  if (minValue.value) {
    result.min = minValue.value;
  }
  if (maxValue.value) {
    result.max = maxValue.value;
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
watch(
  () => props.minDate,
  () => {
    if (minValue.value && value.value && minValue.value > value.value) {
      value.value = undefined;
    }
    generateDates();
  },
);
watch(
  () => props.maxDate,
  () => {
    if (maxValue.value && value.value && maxValue.value < value.value) {
      value.value = undefined;
    }
    generateDates();
  },
);
watch(
  () => props.range,
  (val) => {
    if (!val) {
      nextTick(() => {
        initIMask();
      });
    }
    valueDisplay.value = {};
    valueRangeDisplay.value = [];
  },
);
watch(
  () => props.view,
  (val) => {
    viewValue.value = val as BDatePickerView;
  },
);
watch(smAndLarger, () => {
  isVisibleMenu.value = false;
});
watch(isVisibleMenu, (val) => {
  if (val) {
    lockScrollBody();
    if (props.range) {
      valueRangeDisplay.value = value.value
        ? cloneItemFromDateRange(value.value as Date[])
        : [];
    } else {
      valueDisplay.value = value.value
        ? cloneItemFromDate(value.value as Date)
        : {};
    }
    viewDateDisplay.value = cloneItem(viewDate.value);
    nextTick(() => {
      // https://tailwindcss.com/docs/responsive-design
      if (smAndLarger.value) {
        ensureVisiblePosition(datePickerRef.value!, datePickerMenuRef.value!);
      } else {
        // Move menu element into body tag
        document.body.append(datePickerMenuRef.value!);
      }
    });
  } else {
    unlockScrollBody();
    resetPosition(datePickerRef.value!, datePickerMenuRef.value!);
  }
});
watch(
  () => props.modelValue,
  (val) => {
    if (isNotSyncedModelValue(val)) {
      if (props.range) {
        const v = val as Date[];
        valueRangeDisplay.value = val ? cloneItemFromDateRange(v) : [];
        viewDate.value = val ? cloneItemFromDate(v[1], true) : {};
        viewDateDisplay.value = val ? cloneItemFromDate(v[1], true) : {};
      } else {
        const v = val as Date;
        valueDisplay.value = val ? cloneItemFromDate(v) : {};
        viewDate.value = val ? cloneItemFromDate(v, true) : {};
        viewDateDisplay.value = val ? cloneItemFromDate(v, true) : {};
      }
    }
    if (!props.range && isNotSyncedModelValue(getInputMaskDate())) {
      mask.value = formatDateMoment((val as Date) || '');
    }
  },
);
//#endregion

//#region Methods
const handleSwitchToMonthsView = () => {
  generateMonths();
  viewValue.value = BDatePickerView.Months;
};
const handleSwitchToYearsView = () => {
  generateYears();
  viewValue.value = BDatePickerView.Years;
};
const isNotSyncedModelValue = (val?: Date | Date[]) => {
  const ruleEngine = props.range
    ? [
        !isEmpty(props.modelValue) && isEmpty(val),
        !isEmpty(val) && isEmpty(props.modelValue),
        !isEmpty(props.modelValue) &&
          !isEmpty(val) &&
          (props.modelValue as Date[]).some(
            (v, i) => v?.getTime() !== (val as Date[])[i]?.getTime(),
          ),
      ]
    : [
        !props.modelValue && val,
        !val && props.modelValue,
        props.modelValue &&
          val &&
          (props.modelValue as Date)?.getTime() !== (val as Date).getTime(),
      ];
  return ruleEngine.some((r) => r);
};
const handleCancel = () => {
  isVisibleMenu.value = false;
};
const handleConfirm = () => {
  isVisibleMenu.value = false;
  if (props.range) {
    if (valueRangeDisplay.value.length === 2) {
      value.value = [
        new Date(
          valueRangeDisplay.value[0].year!,
          valueRangeDisplay.value[0].month!,
          valueRangeDisplay.value[0].date,
        ),
        new Date(
          valueRangeDisplay.value[1].year!,
          valueRangeDisplay.value[1].month!,
          valueRangeDisplay.value[1].date,
        ),
      ];
    } else {
      value.value = undefined;
    }
  } else {
    if (
      !isNil(valueDisplay.value.year) &&
      !isNil(valueDisplay.value.month) &&
      !isNil(valueDisplay.value.date)
    ) {
      value.value = new Date(
        valueDisplay.value.year,
        valueDisplay.value.month,
        valueDisplay.value.date,
      );
    } else {
      value.value = undefined;
    }
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
const cloneItemFromDateRange = (
  dateRange: Date[],
  ignoreDate?: boolean,
): BDatePickerDateItem[] => [
  {
    year: dateRange[0].getFullYear(),
    month: dateRange[0].getMonth(),
    date: ignoreDate ? undefined : dateRange[0].getDate(),
  },
  {
    year: dateRange[1].getFullYear(),
    month: dateRange[1].getMonth(),
    date: ignoreDate ? undefined : dateRange[1].getDate(),
  },
];
const handleSelectYear = (item: BDatePickerDateItem) => {
  viewDateDisplay.value = cloneItem(item);
  generateMonths();
  viewValue.value = BDatePickerView.Months;
};
const handleSelectMonth = (item: BDatePickerDateItem) => {
  viewDateDisplay.value = cloneItem(item);
  generateDates();
  viewValue.value = BDatePickerView.Dates;
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
const handleSelectDateRange = ({ year, month, date }: BDatePickerDateItem) => {
  const valueRangeDisplayLength = valueRangeDisplay.value.length;
  if (valueRangeDisplayLength === 0) {
    valueRangeDisplay.value.push({ year, month, date });
  } else if (valueRangeDisplayLength === 1) {
    const foundIndex = valueRangeDisplay.value.findIndex(
      (i) => i.year === year && i.month === month && i.date === date,
    );
    if (foundIndex !== -1) {
      valueRangeDisplay.value.splice(foundIndex, 1);
    } else {
      if (
        new Date(year!, month!, date) >
        new Date(
          valueRangeDisplay.value[0].year!,
          valueRangeDisplay.value[0].month!,
          valueRangeDisplay.value[0].date,
        )
      ) {
        valueRangeDisplay.value.push({ year, month, date });
      } else {
        valueRangeDisplay.value.unshift({ year, month, date });
      }
    }
  } else if (valueRangeDisplayLength === 2) {
    const foundIndex = valueRangeDisplay.value.findIndex(
      (i) => i.year === year && i.month === month && i.date === date,
    );
    if (foundIndex !== -1) {
      valueRangeDisplay.value.splice(foundIndex, 1);
    } else {
      valueRangeDisplay.value = [];
      valueRangeDisplay.value.push({ year, month, date });
    }
  }

  viewDateDisplay.value = {
    year,
    month,
  };
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
const openMenu = () => {
  isVisibleMenu.value = true;
};
const handleToggleMenu = () => {
  if (props.disabled) {
    return;
  }
  isVisibleMenu.value = !isVisibleMenu.value;
};
const isOutOfRangeYear = (year: number) =>
  (minValue.value ? minValue.value.getFullYear() > year : false) ||
  (maxValue.value ? year > maxValue.value.getFullYear() : false);
const isOutOfRangeMonth = (year: number, month: number) =>
  (minValue.value
    ? (minValue.value.getFullYear() === year &&
        minValue.value.getMonth() > month) ||
      minValue.value.getFullYear() > year
    : false) ||
  (maxValue.value
    ? (maxValue.value.getFullYear() === year &&
        maxValue.value.getMonth() < month) ||
      maxValue.value.getFullYear() < year
    : false);
const isOutOfRangeDate = (date: Date) =>
  (minValue.value ? minValue.value > date : false) ||
  (maxValue.value ? date > maxValue.value : false);
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
  viewLeftNavDisabled.value = minValue.value
    ? minValue.value >= startDate
    : false;
  viewRightNavDisabled.value = maxValue.value
    ? maxValue.value <= endDate
    : false;
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
    valueDisplay.value = cloneItemFromDate(date);
    viewDate.value = cloneItemFromDate(date, true);
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
const closeOnClickOutside = (event: any) => {
  const refs = [datePickerRef.value, datePickerMenuRef.value];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    closeDatePickerMenu();
  }
};
const closeOnEscapePressed = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDatePickerMenu();
  }
};
const closeDatePickerMenu = () => {
  isVisibleMenu.value = false;
  datePickerInputRef.value?.blur();
  datePickerInputMaskRef.value?.blur();
};
const initIMask = () => {
  mask = IMask(datePickerInputMaskRef.value!, inputMaskOptions.value);
  mask.value = formatDateMoment((props.modelValue as Date) || '');
  mask.on('accept', onAccept);
  mask.on('complete', onComplete);
};
const destroyIMask = () => {
  mask && mask.destroy();
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
  if (!props.range) {
    initIMask();
  }
  document.addEventListener('click', closeOnClickOutside);
  document.addEventListener('keydown', closeOnEscapePressed);
});
onBeforeUnmount(() => {
  destroyIMask();
  unlockScrollBody();
  resetPosition(datePickerRef.value!, datePickerMenuRef.value!); // Make sure dropdown menu unmounted with itself
  document.removeEventListener('keydown', closeOnEscapePressed);
  document.removeEventListener('click', closeOnClickOutside);
});
//#endregion
</script>

<template>
  <div class="b-date-picker">
    <div ref="datePickerRef">
      <BLabel :id="id" :label="label" :required="required" />

      <div class="ds-relative">
        <input
          v-if="props.range"
          :id="id"
          ref="datePickerInputRef"
          :class="inputCssClassValue"
          :disabled="disabled"
          :placeholder="placeholder"
          :value="formattedValue"
          class="ds-drop-shadow-light"
          readonly
          @focus="openMenu"
        />
        <input
          v-else
          :id="id"
          ref="datePickerInputMaskRef"
          :class="inputCssClassValue"
          :disabled="disabled"
          :placeholder="placeholder"
          class="ds-drop-shadow-light"
          @blur="onBlur"
        />
        <!--NOTE: Remove ds.components.base.date_picker.today-->
        <BDatePickerIcon
          :disabled="props.disabled"
          @click="handleToggleMenu"
          @keyup.enter="handleToggleMenu"
        />
      </div>

      <div
        v-show="isVisibleMenu"
        ref="datePickerMenuRef"
        class="b-date-picker__menu sm:ds-items-[unset] sm:ds-justify-[unset] ds-fixed ds-left-0 ds-top-0 ds-z-100 ds-flex ds-h-full ds-w-full ds-items-center ds-justify-center ds-bg-black/65 ds-backdrop-blur-sm sm:ds-absolute sm:ds-left-[unset] sm:ds-top-[unset] sm:ds-z-50 sm:ds-block sm:ds-h-auto sm:ds-w-auto sm:ds-bg-transparent sm:ds-backdrop-blur-none"
      >
        <div
          class="ds-mt-1 ds-grid ds-w-80 ds-gap-5 ds-rounded-lg ds-bg-white ds-p-3 ds-shadow-2xl"
        >
          <div class="ds-flex ds-w-full ds-items-center ds-justify-between">
            <BDatePickerButtonPrevious
              :disabled="viewLeftNavDisabled"
              @click="viewData[viewValue].handleClickPreview()"
            />
            <BDatePickerHeading
              :class="{
                'ds-cursor-pointer hover:ds-bg-gray-150':
                  viewData[viewValue].handleClickHeading,
              }"
              @click="viewData[viewValue].handleClickHeading"
            >
              {{ viewHeading }}
            </BDatePickerHeading>
            <BDatePickerButtonNext
              :disabled="viewRightNavDisabled"
              @click="viewData[viewValue].handleClickNext()"
            />
          </div>

          <BDatePickerGridYear
            v-if="viewValue === BDatePickerView.Years"
            :year="valueDisplay"
            :years
            @select:year="handleSelectYear"
          />
          <BDatePickerGridMonth
            v-if="viewValue === BDatePickerView.Months"
            :month="valueDisplay"
            :months
            @select:month="handleSelectMonth"
          />
          <template v-if="viewValue === BDatePickerView.Dates">
            <BDatePickerGridDateRange
              v-if="props.range"
              :date-range="valueRangeDisplay"
              :dates
              @select:date="handleSelectDateRange"
            />
            <BDatePickerGridDate
              v-else
              :date="valueDisplay"
              :dates
              @select:date="handleSelectDate"
            />
          </template>

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
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
