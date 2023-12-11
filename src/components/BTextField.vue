<script lang="ts" setup>
// https://github.com/tailwindlabs/tailwindcss/discussions/7554
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';

/**
 * Props
 */
export interface BTextFieldProps {
  inputId?: string;
  inputCssClass?: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  modelValue: string | number;
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
  placeholder?: string;
  autocomplete?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: string;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Function is executed on input event.
   */
  inputHandler?: any;
  inputmode?:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search'; // This allows a browser to display an appropriate virtual keyboard
}
const props = withDefaults(defineProps<BTextFieldProps>(), {
  inputId: '',
  inputCssClass: '',
  validationRules: undefined,
  label: '',
  prependIcon: '',
  hidePrependIcon: false,
  appendIcon: '',
  hideAppendIcon: false,
  placeholder: '',
  autocomplete: false,
  disabled: false,
  readonly: false,
  type: 'text',
  required: false,
  requiredErrorMessage: '',
  hideDetails: false,
  inputHandler: undefined,
  inputmode: 'text',
});

/**
 * Events
 */
const emit = defineEmits<{
  focus: [];
  blur: [];
  'click:prepend': [];
  'click:append': [];
  'press:enter': [];
  'update:modelValue': [value: string | number];
}>();

/**
 * Data
 */
const { t } = useI18n();
const inputRef = ref<HTMLInputElement | null>(null);
const validateRequired: ValidationRule = {
  validateRule: (val: string) => {
    if (typeof val === 'number') {
      return !!val;
    }
    return !!(val && val?.trim());
  },
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

const { validate, validationResult } = useValidationField(
  id.value,
  value,
  vRules.value,
);

/**
 * Methods
 */
const onClickPrependIcon = () => {
  emit('click:prepend');
};
const onClickAppendIcon = () => {
  emit('click:append');
};
const onKeyUpEnter = () => {
  emit('press:enter');
};
const onFocus = () => {
  emit('focus');
};
const onBlur = () => {
  emit('blur');
};
const onKeyUp = () => {
  validate();
};
const focus = () => {
  inputRef.value?.focus();
};
const blur = () => {
  inputRef.value?.blur();
};

defineExpose({ validate, focus, blur });
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
        v-model="value"
        :autocomplete="props.autocomplete ? 'on' : 'off'"
        :class="inputCssClassValue"
        :disabled="props.disabled"
        :inputmode="props.inputmode"
        :placeholder="props.placeholder"
        :readonly="props.readonly"
        :type="props.type"
        class="ds-block ds-h-[40px] ds-w-full ds-rounded-lg ds-border ds-px-3 ds-text-sm ds-drop-shadow-light"
        @blur="onBlur"
        @focus="onFocus"
        @input="inputHandler"
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
