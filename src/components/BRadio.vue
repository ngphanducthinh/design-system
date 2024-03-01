<script lang="ts" setup>
import BErrorMessage from '@/components/BErrorMessage.vue';
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

//#region Props
export interface BRadioProps {
  inputId?: string;
  modelValue: string | number | boolean;
  inputName?: string;
  label?: string;
  /**
   * Clicking on label will not select the radio.
   */
  labelOrphan?: boolean;
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
  labelOrphan: false,
  disabled: false,
  labelCssClass: '',
  hideDetails: false,
  validationRules: undefined,
  required: false,
  requiredErrorMessage: '',
});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'change'): void;
  /**
   * Update value, param: <code>value: string | number | boolean</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: string | number | boolean): void;
}>();
//#endregion

//#region Data
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
//#endregion

//#region Methods
const onChange = () => {
  emit('change');
  validate();
};
//#endregion
</script>

<template>
  <div class="b-radio ds-flex ds-items-center">
    <input
      :id="id"
      v-model="value"
      :disabled="disabled"
      :name="inputName"
      :value="$attrs.value"
      class="b-radio__input"
      type="radio"
      @change="onChange"
    />
    <label
      :for="id"
      class="b-radio__input-label ds-border ds-border-black/[0.1] ds-drop-shadow-light"
    />
    <label
      v-if="props.label || $slots.default"
      :for="props.labelOrphan ? undefined : id"
      :class="labelCssClass"
      class="ds-ml-2 ds-text-sm ds-font-medium ds-text-gray-900"
    >
      <slot>
        {{ props.label }}
      </slot>
    </label>
  </div>
  <b-error-message
    v-if="!hideDetails"
    :error-message="validationResult.errorMessage()"
    class="ds-mt-1"
  />
</template>
<style scoped lang="scss">
.b-radio__input {
  display: none;

  &:checked + .b-radio__input-label::before {
    background-color: theme('colors.primary-t');
  }

  &:disabled + .b-radio__input-label {
    background-color: theme('colors.gray.100');
  }

  &:disabled + .b-radio__input-label::before {
    background-color: theme('colors.gray.100');
  }
}

.b-radio__input-label {
  position: relative;
  width: theme('width.6');
  height: theme('height.6');
  background-color: theme('colors.white');
  border-radius: theme('borderRadius.full');

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: theme('colors.transparent');
    height: theme('height.4');
    width: theme('width.4');
    border-radius: theme('borderRadius.full');
    transition: theme('transitionProperty.all') theme('transitionDuration.150')
      theme('transitionTimingFunction.linear');
  }
}
</style>
