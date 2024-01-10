<script lang="ts" setup>
import BLabel from '@/components/BLabel.vue';
import type { ValidationRule } from '@/composables/Validation';
import { useValidationField } from '@/composables/Validation';
import { computed, onMounted, ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import BErrorMessage from '@/components/BErrorMessage.vue';
import { useI18n } from 'vue-i18n';
import IMask from '@/vendor/imask-7.1.3.js';
import { SupportedLocale } from '@/constants/Enums';

//#region Props
export interface BCurrencyFieldProps {
  inputId?: string;
  inputCssClass?: string;
  /**
   * Value can be number or string
   */
  modelValue: number | string;
  label?: string;
  validationRules?: ValidationRule[];
  placeholder?: string;
  autocomplete?: boolean;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  disabled?: boolean;
  readonly?: boolean;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Locale of the currency
   */
  locale?: `${SupportedLocale}`;
}

const props = withDefaults(defineProps<BCurrencyFieldProps>(), {
  inputId: '',
  inputCssClass: '',
  label: '',
  validationRules: undefined,
  placeholder: '',
  autocomplete: false,
  required: false,
  requiredErrorMessage: '',
  disabled: false,
  readonly: false,
  hideDetails: false,
  locale: SupportedLocale['vi-VN'],
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * User presses "enter" key
   * @param e
   */
  (e: 'press:enter'): void;
  /**
   * Update value, param <code>value: number | string</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: number | string): void;
}>();
//#endregion

//#region Data
let mask: any;
const { t } = useI18n();
const inputRef = ref<HTMLInputElement | null>(null);
const validateRequired: ValidationRule = {
  validateRule: (val: string) => !!(val && val?.trim()),
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
const inputCssClassValue = computed(() => [
  {
    'ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/[0.4]': props.disabled,
    'ds-text-black/[0.85]': !props.disabled,
    'ds-border-error focus:ds-ring-1 focus:ds-ring-error':
      !validationResult.value.valid,
    'ds-border-black/[0.1] focus:ds-border-focus focus:ds-ring-1 focus:ds-ring-focus':
      validationResult.value.valid,
  },
  props.inputCssClass,
]);
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
const maskOptions = computed(() =>
  props.locale === 'en-US'
    ? {
        mask: '$num',
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ' ',
          },
        },
      }
    : [
        { mask: '' },
        {
          mask: 'num VND',
          lazy: false,
          blocks: {
            num: {
              mask: Number,
              thousandsSeparator: ' ',
            },
          },
        },
      ],
);

const { validate, validationResult } = useValidationField(
  id.value,
  value,
  vRules.value,
);
//#endregion

//#region Watchers
watch(
  () => props.locale,
  () => {
    initMask();
  },
);
watch(
  () => props.modelValue,
  (val) => {
    if (val != mask.unmaskedValue) {
      mask.unmaskedValue = val.toString();
    }
  },
);
//#endregion

//#region Methods
const onKeyUp = () => {
  validate();
};
const onKeyUpEnter = () => {
  emit('press:enter');
};
const onAccept = () => {
  value.value =
    typeof value.value === 'number' ? +mask.unmaskedValue : mask.unmaskedValue;
};
const initMask = () => {
  if (mask) {
    mask.destroy();
  }
  mask = IMask(inputRef.value!, maskOptions.value);
  mask.on('accept', onAccept);
};
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  initMask();
  mask.unmaskedValue = value.value.toString();
});
//#endregion
</script>

<template>
  <div class="b-currency-field">
    <BLabel :id="id" :label="label" :required="required" />
    <div class="ds-relative">
      <div
        v-if="$slots.prependIcon"
        class="b-currency-field__prepend-icon ds-absolute ds-left-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
      >
        <slot name="prependIcon" />
      </div>
      <input
        :id="id"
        ref="inputRef"
        :autocomplete="props.autocomplete ? 'on' : 'off'"
        :class="inputCssClassValue"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        :readonly="props.readonly"
        class="ds-block ds-h-[40px] ds-w-full ds-rounded-lg ds-border ds-px-3 ds-text-sm ds-drop-shadow-light"
        @keyup="onKeyUp"
        @keyup.enter="onKeyUpEnter"
      />
      <div
        v-if="$slots.appendIcon"
        class="b-currency-field__append-icon ds-absolute ds-right-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
      >
        <slot name="appendIcon" />
      </div>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>

<style scoped lang="scss">
.b-currency-field {
  &:has(.b-currency-field__prepend-icon) {
    input {
      padding-left: theme('padding.9');
    }
  }

  &:has(.b-currency-field__append-icon) {
    input {
      padding-right: theme('padding.9');
    }
  }
}
</style>
