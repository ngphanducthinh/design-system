<script lang="ts" setup>
import BErrorMessage from '@/components/BErrorMessage.vue';
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Props
 */
export interface BRadioProps {
  inputId?: string;
  modelValue?: string | number | boolean;
  inputName?: string;
  label?: string;
  disabled?: boolean;
  labelCssClass?: string;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
}
const props = withDefaults(defineProps<BRadioProps>(), {
  inputId: '',
  modelValue: '',
  inputName: '',
  label: '',
  disabled: false,
  labelCssClass: '',
  hideDetails: false,
  validationRules: undefined,
  required: false,
  requiredErrorMessage: '',
});

/**
 * Events
 */
const emit = defineEmits<{
  change: [];
  'update:modelValue': [value: string | number | boolean];
}>();

/**
 * Data
 */
const { t } = useI18n();
const validateRequired: ValidationRule = {
  validateRule: (val: string) => !!(val && val.trim()),
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
const onChange = () => {
  emit('change');
  validate();
};
</script>

<template>
  <div class="ds-flex ds-items-center">
    <input
      :id="id"
      v-model="value"
      :class="{ 'ds-cursor-not-allowed': disabled }"
      :disabled="disabled"
      :name="inputName"
      :value="$attrs.value"
      class="ds-h-6 ds-min-h-[1.5rem] ds-w-6 ds-min-w-[1.5rem] ds-border-gray-300 ds-bg-gray-100 ds-text-primary-t focus:ds-ring-primary-t"
      type="radio"
      @change="onChange"
    />
    <label
      v-if="label"
      :class="labelCssClass"
      :for="id"
      class="ds-ml-2 ds-text-sm ds-font-medium ds-text-gray-900"
    >
      {{ label }}
    </label>
  </div>
  <b-error-message
    v-if="!hideDetails"
    :error-message="validationResult.errorMessage()"
    class="ds-mt-1"
  />
</template>
