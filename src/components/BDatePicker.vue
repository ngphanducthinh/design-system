<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
// https://imask.js.org/guide.html#getting-started
import IMask from '@/vendor/imask-7.1.3.js';
/**
 * https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
 * Due to this issue with moment (it loads a bunch of unnecessary ./locale)
 * https://github.com/ksloan/moment-mini
 */
import moment from 'moment-mini';
import { useI18n } from 'vue-i18n';
// https://air-datepicker.com/docs
// DO NOT upgrade to the higher version than 3.3.0
import AirDatepicker, {
  type AirDatepickerButton,
  type AirDatepickerLocale,
} from 'air-datepicker';

import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { DateDelimiter } from '@/constants/Common';
import { BDatePickerView } from '@/constants/Enums';
import { lockScrollBody, unlockScrollBody } from '@/helpers/ComponentHelper';
import { checkIfISOFormat } from '@/helpers/DateHelper';
import { v4 as uuid } from 'uuid';
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';

/**
 * Props
 */
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
   * Show "Today" text if selected date is the current date
   */
  showHintToday?: boolean;
  /**
   * Default view mode when open picker dropdown
   */
  view?: BDatePickerView;
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
  showHintToday: false,
  view: BDatePickerView.Days,
  hideDetails: false,
  position: 'bottom left',
});

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

/**
 * Data
 */
const { t, locale } = useI18n();
const dateFormat = `DD${DateDelimiter}MM${DateDelimiter}YYYY`; // moment's date format
const currentDate = new Date();
let datePicker: AirDatepicker<HTMLInputElement>;
let mask: any;
const inputMaskRef = ref<HTMLElement | null>(null);
const validateRequired: ValidationRule = {
  validateRule: (val) => !!val,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const selectedDate = ref();

/**
 * Computed
 */
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
const datePickerButtons = computed<AirDatepickerButton[]>(() => [
  {
    content: t('ds.components.base.date_picker.buttons.cancel'),
    className:
      'ds-bg-transparent focus:ds-ring-1 focus:ds-ring-gray-300 ds-border-inner-primary-f !ds-text-primary-t hover:ds-bg-[#e6f0fe] ds-text-sm ds-leading-4 ds-px-4 ds-mx-1',
    onClick: (dp) => {
      dp.clear();
      nextTick(() => {
        validate();
      });
      dp.hide();
    },
  },
  {
    content: t('ds.components.base.date_picker.buttons.confirm'),
    className: `${id.value}-btn-confirm focus:ds-ring-1 focus:ds-ring-1 focus:ds-ring-blue-300 ds-bg-gradient-to-r ds-from-primary-f-stop ds-from-primary-f ds-to-primary-t !ds-text-white enabled:hover:ds-bg-[#0e4bbd] ds-text-sm ds-leading-4 ds-px-4 disabled:ds-from-[#e2e4e8] disabled:ds-to-[#e2e4e8] disabled:ds-text-black/[0.4] ds-mx-1`,
    onClick: (dp) => {
      value.value = selectedDate.value !== undefined ? selectedDate.value : '';
      nextTick(() => {
        validate();
      });
      dp.hide();
    },
    attrs: props.required
      ? {
          disabled: '',
        }
      : undefined,
  },
]);
const datePickerOptions = computed(() => {
  const datePickerLocale: AirDatepickerLocale = {
    days: [
      t('ds.components.base.date_picker.days.sunday'),
      t('ds.components.base.date_picker.days.monday'),
      t('ds.components.base.date_picker.days.tuesday'),
      t('ds.components.base.date_picker.days.wednesday'),
      t('ds.components.base.date_picker.days.thursday'),
      t('ds.components.base.date_picker.days.friday'),
      t('ds.components.base.date_picker.days.saturday'),
    ],
    daysShort: [
      t('ds.components.base.date_picker.days_short.sunday'),
      t('ds.components.base.date_picker.days_short.monday'),
      t('ds.components.base.date_picker.days_short.tuesday'),
      t('ds.components.base.date_picker.days_short.wednesday'),
      t('ds.components.base.date_picker.days_short.thursday'),
      t('ds.components.base.date_picker.days_short.friday'),
      t('ds.components.base.date_picker.days_short.saturday'),
    ],
    daysMin: [
      t('ds.components.base.date_picker.days_min.sunday'),
      t('ds.components.base.date_picker.days_min.monday'),
      t('ds.components.base.date_picker.days_min.tuesday'),
      t('ds.components.base.date_picker.days_min.wednesday'),
      t('ds.components.base.date_picker.days_min.thursday'),
      t('ds.components.base.date_picker.days_min.friday'),
      t('ds.components.base.date_picker.days_min.saturday'),
    ],
    months: [
      t('ds.components.base.date_picker.months.january'),
      t('ds.components.base.date_picker.months.february'),
      t('ds.components.base.date_picker.months.march'),
      t('ds.components.base.date_picker.months.april'),
      t('ds.components.base.date_picker.months.may'),
      t('ds.components.base.date_picker.months.june'),
      t('ds.components.base.date_picker.months.july'),
      t('ds.components.base.date_picker.months.august'),
      t('ds.components.base.date_picker.months.september'),
      t('ds.components.base.date_picker.months.october'),
      t('ds.components.base.date_picker.months.november'),
      t('ds.components.base.date_picker.months.december'),
    ],
    monthsShort: [
      t('ds.components.base.date_picker.months_short.january'),
      t('ds.components.base.date_picker.months_short.february'),
      t('ds.components.base.date_picker.months_short.march'),
      t('ds.components.base.date_picker.months_short.april'),
      t('ds.components.base.date_picker.months_short.may'),
      t('ds.components.base.date_picker.months_short.june'),
      t('ds.components.base.date_picker.months_short.july'),
      t('ds.components.base.date_picker.months_short.august'),
      t('ds.components.base.date_picker.months_short.september'),
      t('ds.components.base.date_picker.months_short.october'),
      t('ds.components.base.date_picker.months_short.november'),
      t('ds.components.base.date_picker.months_short.december'),
    ],
    today: t('ds.components.base.date_picker.buttons.today'),
    clear: t('ds.components.base.date_picker.buttons.clear'),
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    firstDay: 1, // Monday
  };
  const onSelectDatePicker = ({
    date,
  }: {
    date: Date | Date[];
    formattedDate: string | string[];
    datepicker: AirDatepicker;
  }) => {
    // 'date' is undefined when clicking 'Clear' button/ deselect the date
    selectedDate.value = date;
    if (props.required) {
      toggleButtonCofirm(!!date);
    }
  };

  return {
    locale: datePickerLocale,
    selectedDates: [props.modelValue],
    onSelect: onSelectDatePicker,
    buttons: [...datePickerButtons.value],
    showOtherMonths: false,
    timepicker: false,
    onlyTimepicker: false,
    minDate: props.minDate,
    maxDate: props.maxDate,
    view: props.view,
    onHide: onHidePicker,
    onShow: onShowPicker,
    navTitles: {
      days: 'MMMM yyyy',
    },
    position: props.position,
    prevHtml: `<svg xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 320 512">
                  <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
              </svg>`,
    nextHtml: `<svg xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 320 512">
                  <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
              </svg>`,
  } as any; // AirDatepickerOptions
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
const inputCssClassValue = computed(() => [
  'ds-border ds-rounded-lg ds-block ds-w-full ds-text-sm ds-px-3 ds-h-[40px]',
  {
    'ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/[0.4]': props.disabled,
    'ds-text-black/[0.85]': !props.disabled,
    'ds-border-error focus:ds-ring-1 focus:ds-ring-error':
      !validationResult.value.valid,
    'ds-border-black/[0.1] focus:ds-border-focus focus:ds-ring-1 focus:ds-ring-focus':
      validationResult.value.valid,
    '!ds-border-focus ds-ring-1 ds-ring-focus': datePickerVisible.value,
  },
  props.inputCssClass,
]);
const isToday = computed(() => {
  if (!props.modelValue) {
    return false;
  }
  return (
    currentDate.getDate() === props.modelValue.getDate() &&
    currentDate.getMonth() === props.modelValue.getMonth() &&
    currentDate.getFullYear() === props.modelValue.getFullYear()
  );
});
const inputMaskOptions = computed(() => {
  const result: any = {
    mask: IMask.MaskedDate,
    pattern: dateFormat,
    lazy: true,

    format: (date: any) => moment(date).format(dateFormat),
    parse: (str: string) => moment(str, dateFormat),

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
const datePickerVisible = ref(false);

const { validate, validationResult } = useValidationField(
  id.value,
  value,
  vRules.value,
);

/**
 * Watch
 */
watch(
  () => props.modelValue,
  () => {
    // Make sure to update value once
    if (checkIfModelNeedToSync(datePicker.selectedDates[0])) {
      if (props.modelValue) {
        datePicker.selectDate(props.modelValue);
        datePicker.setViewDate(props.modelValue);
      } else {
        datePicker.clear();
      }
    }
    if (checkIfModelNeedToSync(getInputMaskDate())) {
      mask.value = formatDate(props.modelValue);
    }
  },
  { deep: true },
);
watch(
  [
    locale,
    () => props.position,
    () => props.minDate,
    () => props.maxDate,
    () => props.view,
  ],
  () => {
    datePicker.update(datePickerOptions.value);
  },
);

/**
 * Methods
 */
const formatDate = (date: string | Date) =>
  checkIfISOFormat(date) ? moment(date).format(dateFormat) : date;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onHidePicker = () => {
  datePickerVisible.value = false;
  unlockScrollBody();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onShowPicker = () => {
  datePickerVisible.value = true;
  if (props.modelValue) {
    datePicker.selectDate(props.modelValue);
    datePicker.setViewDate(props.modelValue);
  } else {
    datePicker.clear();
  }
  lockScrollBody();
};
const onAccept = () => {
  if (!mask.unmaskedValue) {
    emit('update:modelValue', '');
  }
};
const onComplete = () => {
  const date = getInputMaskDate();
  return date ? emit('update:modelValue', date) : emit('update:modelValue', '');
};
const onBlur = () => {
  const date = getInputMaskDate();
  validate();
  if (!checkIfModelNeedToSync(date)) {
    return;
  }
  emit('update:modelValue', date === undefined ? '' : date);
};
const checkIfModelNeedToSync = (date: any) => {
  const ruleEngine = [
    !props.modelValue && date,
    !date && props.modelValue,
    props.modelValue && date && props.modelValue.getTime() !== date.getTime(),
  ];

  return ruleEngine.some((r) => r);
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
const toggleButtonCofirm = (enabled: boolean) => {
  const btnEl = document.querySelector(`.${id.value}-btn-confirm`);
  if (enabled) {
    btnEl?.removeAttribute('disabled');
  } else {
    btnEl?.setAttribute('disabled', '');
  }
};

/**
 * Lifecycle hooks
 */
onMounted(() => {
  // Picker
  datePicker = new AirDatepicker<HTMLInputElement>(
    `#${id.value}Picker`,
    datePickerOptions.value,
  );
  // Input mask
  mask = IMask(inputMaskRef.value!, inputMaskOptions.value);
  mask.value = formatDate(props.modelValue);
  mask.on('accept', onAccept);
  mask.on('complete', onComplete);
});
onBeforeUnmount(() => {
  unlockScrollBody();
});
</script>

<template>
  <div>
    <b-label :id="id" :label="label" :required="required" />
    <div class="ds-relative">
      <input
        :id="id"
        ref="inputMaskRef"
        :class="inputCssClassValue"
        :disabled="disabled"
        :placeholder="placeholder"
        class="ds-relative ds-z-[2] ds-drop-shadow-light"
        @blur="onBlur"
      />
      <input
        :id="`${id}Picker`"
        :class="inputCssClassValue"
        :disabled="disabled"
        class="ds-absolute ds-top-0 ds-z-[1]"
        readonly
      />

      <label
        v-if="showHintToday && isToday"
        :for="id"
        class="ds-absolute ds-left-[98px] ds-top-2.5 ds-z-[3] ds-text-sm"
      >
        {{ `(${$t('ds.components.base.date_picker.today')})` }}
      </label>

      <label
        :for="`${id}Picker`"
        class="ds-absolute ds-right-3 ds-top-3 ds-z-[3]"
      >
        <svg
          :class="[
            props.disabled ? 'ds-fill-black/40' : 'ds-text-black/[0.85]',
          ]"
          class="ds-h-4 ds-w-4"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192zM96 296c0-13.3 10.7-24 24-24H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24zm24 72H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
          />
        </svg>
      </label>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
