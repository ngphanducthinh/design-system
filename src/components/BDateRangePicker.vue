<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
/**
 * https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
 * Due to this issue with moment (it loads a bunch of unnecessary ./locale)
 * https://github.com/ksloan/moment-mini
 */
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
import { BDatePickerView } from '@/constants/Enums';
import { lockScrollBody, unlockScrollBody } from '@/helpers/ComponentHelper';
import { v4 as uuid } from 'uuid';
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';
import { isEmpty } from 'lodash-es';
import { checkIfISOFormat } from '@/helpers/DateHelper';
import moment from 'moment-mini';
import { DateDelimiter } from '@/constants/Common';

/**
 * Props
 */
export interface BDateRangePickerProps {
  inputId?: string;
  modelValue: Date[];
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
const props = withDefaults(defineProps<BDateRangePickerProps>(), {
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
  view: BDatePickerView.Days,
  hideDetails: false,
  position: 'bottom left',
});

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: Date[]];
}>();

/**
 * Data
 */
const { t, locale } = useI18n();
const dateFormat = `DD${DateDelimiter}MM${DateDelimiter}YYYY`; // moment's date format
let datePicker: AirDatepicker<HTMLInputElement>;
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
      value.value = checkIfValidDateValue(selectedDate.value)
        ? selectedDate.value
        : [];
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
    date: Date[];
    formattedDate: string | string[];
    datepicker: AirDatepicker;
  }) => {
    const isValidDate = checkIfValidDateValue(date);
    selectedDate.value = isValidDate ? date : [];
    if (props.required) {
      toggleButtonConfirm(isValidDate);
    }
  };

  return {
    locale: datePickerLocale,
    selectedDates: props.modelValue,
    onSelect: onSelectDatePicker,
    buttons: datePickerButtons.value,
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
    range: true,
    multipleDatesSeparator: ' - ',
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
const datePickerVisible = ref(false);
const displayValue = computed(() =>
  props.modelValue.map((val) => formatDate(val)).join(' - '),
);

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
    if (checkIfModelNeedToSync(datePicker.selectedDates)) {
      if (checkIfValidDateValue(props.modelValue)) {
        datePicker.selectDate(props.modelValue);
      } else {
        datePicker.clear();
      }
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
const checkIfValidDateValue = (d: Date[]) => d?.length === 2;
const formatDate = (date: string | Date) =>
  checkIfISOFormat(date) ? moment(date).format(dateFormat) : date;
const onHidePicker = () => {
  datePickerVisible.value = false;
  unlockScrollBody();
};
const onShowPicker = () => {
  datePickerVisible.value = true;
  if (checkIfValidDateValue(props.modelValue)) {
    datePicker.selectDate(props.modelValue);
  } else {
    datePicker.clear();
  }
  lockScrollBody();
};
const checkIfModelNeedToSync = (date: Date[]) => {
  const rules = [
    !isEmpty(props.modelValue) && isEmpty(date),
    !isEmpty(date) && isEmpty(props.modelValue),
    !isEmpty(props.modelValue) &&
      !isEmpty(date) &&
      props.modelValue.some((v, i) => v?.getTime() !== date[i]?.getTime()),
  ];

  return rules.some((r) => r);
};
const toggleButtonConfirm = (enabled: boolean) => {
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
  datePicker = new AirDatepicker<HTMLInputElement>(
    `#${id.value}Picker`,
    datePickerOptions.value,
  );
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
        :class="inputCssClassValue"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="displayValue"
        class="ds-relative ds-z-[2] ds-drop-shadow-light"
        readonly
      />

      <input
        :id="`${id}Picker`"
        :class="inputCssClassValue"
        :disabled="disabled"
        :placeholder="placeholder"
        class="ds-absolute ds-top-0 ds-z-[1]"
        readonly
      />

      <label
        :for="`${id}Picker`"
        class="ds-absolute ds-right-3 ds-top-2 ds-z-[3]"
      >
        <i
          :class="[
            props.disabled ? 'ds-text-black/[0.4]' : 'ds-text-black/[0.85]',
          ]"
          class="fa-solid fa-calendar-lines"
        ></i>
      </label>
    </div>

    <b-error-message
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
      prepend-icon="fa-solid fa-circle-exclamation"
    />
  </div>
</template>
