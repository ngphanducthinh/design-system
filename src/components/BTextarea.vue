<script lang="ts" setup>
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';

//#region Props
export interface BTextareaProps {
  inputId?: string;
  inputCssClass?: string;
  modelValue: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  label?: string;
  placeholder?: string;
  autocomplete?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  /**
   * Number of rows.
   */
  rows?: number;
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
}

const props = withDefaults(defineProps<BTextareaProps>(), {
  inputId: '',
  inputCssClass: '',
  validationRules: undefined,
  label: '',
  placeholder: '',
  autocomplete: false,
  disabled: false,
  readonly: false,
  rows: 3,
  required: false,
  requiredErrorMessage: '',
  hideDetails: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param: <code>value: string</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: string): void;
}>();
//#endregion

//#region Data
const { t } = useI18n();
const validateRequired: ValidationRule = {
  validateRule: (val: string | number) => {
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
    'ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/40': props.disabled,
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

defineExpose({ validate });
</script>

<template>
  <div>
    <BLabel :id="id" :label="label" :required="required" />
    <textarea
      :id="id"
      v-model="value"
      :autocomplete="props.autocomplete ? 'on' : 'off'"
      :class="inputCssClassValue"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :readonly="props.readonly"
      :rows="props.rows"
      class="ds-block ds-w-full ds-rounded-lg ds-border ds-px-3 ds-py-1 ds-text-sm ds-drop-shadow-light"
    />
    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
