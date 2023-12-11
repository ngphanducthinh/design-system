<script lang="ts" setup>
import BLabel from '@/components/BLabel.vue';
import type { ValidationRule } from '@/composables/Validation';
import { useValidationField } from '@/composables/Validation';
import { computed, onMounted, ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import BErrorMessage from '@/components/BErrorMessage.vue';
import { useI18n } from 'vue-i18n';
import IMask from '@/vendor/imask-7.1.3.js';

/**
 * Props
 */
export interface BCurrencyFieldProps {
  inputId?: string;
  inputCssClass?: string;
  modelValue: number;
  label?: string;
  /**
   * FontAwesome v6.1.0 - Solid.
   */
  prependIcon?: string;
  /**
   * Hide prepended icon.
   */
  hidePrependIcon?: boolean;
  /**
   * FontAwesome v6.1.0 - Solid.
   */
  appendIcon?: string;
  /**
   * Hide appended icon.
   */
  hideAppendIcon?: boolean;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  placeholder?: string;
  autocomplete?: boolean;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  disabled?: boolean;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
}
const props = withDefaults(defineProps<BCurrencyFieldProps>(), {
  inputId: '',
  inputCssClass: '',
  label: '',
  prependIcon: '',
  hidePrependIcon: false,
  appendIcon: '',
  hideAppendIcon: false,
  validationRules: undefined,
  placeholder: '',
  autocomplete: false,
  required: false,
  requiredErrorMessage: '',
  disabled: false,
  readonly: false,
  hideDetails: false,
});

/**
 * Events
 */
const emit = defineEmits<{
  'click:prepend': [];
  'click:append': [];
  'press:enter': [];
  'update:modelValue': [value: number];
}>();

/**
 * Data
 */
let mask: any;
const { t, locale } = useI18n();
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
    'ds-pl-9': props.prependIcon,
    'ds-pr-9': props.appendIcon,
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
  locale.value === 'en-US'
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

/**
 * Watch
 */
watch(locale, () => {
  initMask();
});

/**
 * Methods
 */
const onClickPrependIcon = () => {
  emit('click:prepend');
};
const onClickAppendIcon = () => {
  emit('click:append');
};
const onKeyUp = () => {
  validate();
};
const onKeyUpEnter = () => {
  emit('press:enter');
};
const onAccept = () => {
  value.value = +mask.unmaskedValue;
};
const initMask = () => {
  if (mask) {
    mask.destroy();
  }
  mask = IMask(inputRef.value!, maskOptions.value);
  mask.on('accept', onAccept);
};

/**
 * Lifecycle hooks
 */
onMounted(() => {
  initMask();
});
</script>

<template>
  <div>
    <BLabel :id="id" :label="label" :required="required" />
    <div class="ds-relative">
      <div
        v-if="prependIcon"
        v-show="!hidePrependIcon"
        class="ds-absolute ds-left-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
      >
        <span
          :id="`${id}prependIcon`"
          :class="prependIcon"
          @click="onClickPrependIcon"
        >
        </span>
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
        v-if="appendIcon"
        v-show="!hideAppendIcon"
        class="ds-absolute ds-right-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
      >
        <span
          :id="`${id}appendIcon`"
          :class="appendIcon"
          @click="onClickAppendIcon"
        >
        </span>
      </div>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
