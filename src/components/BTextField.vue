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

//#region Props
export interface BTextFieldProps {
  /**
   * ID of input element
   */
  inputId?: string;
  inputCssClass?: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  modelValue: string | number;
  label?: string;
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
  /**
   * Value of input element's inputmode
   */
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
//#endregion

//#region Events
// https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
// new "defineEmits" way of Vue 3.3+ doesn't work with Storybook's autodocs yet
const emit = defineEmits<{
  /**
   * Text field is focused
   * @param e
   */
  (e: 'focus'): void;
  /**
   * Text field lost focus
   * @param e
   */
  (e: 'blur'): void;
  /**
   * User presses "enter" key
   * @param e
   */
  (e: 'press:enter'): void;
  /**
   * Update value, param: <code>value: string | number</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: string | number): void;
}>();
//#endregion

//#region Data
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
//#endregion

//#region Methods
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
//#endregion

defineExpose({ validate, focus, blur });
</script>

<template>
  <div class="b-text-field">
    <BLabel :id="id" :label="label" :required="required" />
    <div class="ds-relative">
      <div
        v-if="$slots.prependIcon"
        class="b-text-field__prepend-icon ds-absolute ds-left-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
      >
        <slot name="prependIcon" />
      </div>
      <input
        :id="id"
        ref="inputRef"
        v-model="value"
        :autocomplete="props.autocomplete ? 'on' : 'off'"
        :disabled="props.disabled"
        :inputmode="props.inputmode"
        :placeholder="props.placeholder"
        :readonly="props.readonly"
        :type="props.type"
        :class="[inputCssClassValue]"
        class="ds-block ds-h-[40px] ds-w-full ds-rounded-lg ds-border ds-px-3 ds-text-sm ds-drop-shadow-light"
        @blur="onBlur"
        @focus="onFocus"
        @input="inputHandler"
        @keyup="onKeyUp"
        @keyup.enter="onKeyUpEnter"
      />
      <div
        v-if="$slots.appendIcon"
        class="b-text-field__append-icon ds-absolute ds-right-3 ds-top-0 ds-z-[1] ds-flex ds-h-full ds-cursor-pointer ds-items-center hover:ds-text-primary-t"
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
.b-text-field {
  &:has(.b-text-field__prepend-icon) {
    input {
      padding-left: theme('padding.9');
    }
  }

  &:has(.b-text-field__append-icon) {
    input {
      padding-right: theme('padding.9');
    }
  }
}
</style>
