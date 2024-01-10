<script lang="ts" setup>
// Sourcecode: https://github.com/ejirocodes/vue3-otp-input
import BErrorMessage from '@/components/BErrorMessage.vue';
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BOtpFieldBox from './BOtpFieldBox.vue';

//#region Props
export interface BOtpFieldProps {
  inputId?: string;
  modelValue: string;
  /**
   * Number of input boxes.
   */
  numInputs?: number;
  /**
   * Index of input box to be focused.
   */
  focusIndex?: number;
  disabled?: boolean;
  inputCssClass?: string | {};
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
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

const props = withDefaults(defineProps<BOtpFieldProps>(), {
  inputId: '',
  modelValue: '',
  numInputs: 6,
  focusIndex: undefined,
  disabled: false,
  inputCssClass: '',
  validationRules: undefined,
  required: false,
  requiredErrorMessage: '',
  hideDetails: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * OTP is completed, param: <code>value: string</code>
   * @param e
   * @param value
   */
  (e: 'complete', value: string): void;
  /**
   * OTP is changed, param: <code>value: string</code>
   * @param e
   * @param value
   */
  (e: 'change', value: string): void;
  /**
   * Update focus index, param: <code>index: number</code>
   * @param e
   * @param index
   */
  (e: 'update:focusIndex', index: number): void;
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
  validateRule: (val: string) => !!val,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const fIndex = ref(0);
const oldOtp = ref<any[]>([]);
const boxRefs = ref<Array<InstanceType<typeof BOtpFieldBox>> | null>(null);
const handleOnFocus = (index: number) => {
  focusIndexValue.value = index;
};
const handleOnBlur = () => {
  focusIndexValue.value = -1;
};
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed<any[]>({
  get() {
    return props.modelValue.split('');
  },
  set(val: any) {
    emit('update:modelValue', val.join(''));
  },
});
const originalValue = computed(() => props.modelValue);
const focusIndexValue = computed({
  get() {
    return props.focusIndex !== undefined ? props.focusIndex : fIndex.value;
  },
  set(val: number) {
    if (props.focusIndex !== undefined) {
      emit('update:focusIndex', val);
    } else {
      fIndex.value = val;
    }
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
const inputCssClassValue = computed(() => [
  ...[
    props.disabled
      ? 'ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/[0.4]'
      : 'ds-text-black/[0.85]',
    validationResult.value.valid
      ? 'ds-border-black/[0.1] focus:ds-border-focus focus:ds-ring-1 focus:ds-ring-focus'
      : 'ds-border-error focus:ds-ring-1 focus:ds-ring-error',
  ],
  props.inputCssClass,
]);

const { validate, validationResult } = useValidationField(
  id.value,
  originalValue,
  vRules.value,
);
//#endregion

//#region Methods
const focus = () => {
  boxRefs.value![focusIndexValue.value].focus();
};
const checkFilledAllInputs = () => {
  if (value.value.join('').length === props.numInputs) {
    return emit('complete', value.value.join(''));
  }
  return 'Wait until the user enters the required number of characters';
};
// Focus on input by index
const focusInput = (input: number) => {
  focusIndexValue.value = Math.max(Math.min(props.numInputs - 1, input), 0);
};
// Focus on next input
const focusNextInput = () => {
  focusInput(focusIndexValue.value + 1);
};
// Focus on previous input
const focusPrevInput = () => {
  focusInput(focusIndexValue.value - 1);
};
// Change OTP value at focused input
const changeCodeAtFocus = (val: number | string) => {
  oldOtp.value = [...value.value];

  value.value[focusIndexValue.value] = val;
  value.value = cloneDeep(value.value);

  const oldOtpStr = oldOtp.value.join('');
  const otpStr = value.value.join('');
  if (oldOtpStr !== otpStr) {
    emit('change', otpStr);
    checkFilledAllInputs();
  }
};
// Handle pasted OTP
const handleOnPaste = (event: any) => {
  event.preventDefault();
  const pastedData = event.clipboardData
    .getData('text/plain')
    .slice(0, props.numInputs - focusIndexValue.value)
    .split('');
  if (!pastedData.join('').match(/^\d+$/)) {
    return 'Invalid pasted data';
  }

  // Paste data from focused input onwards
  const currentCharsInOtp = value.value.slice(0, focusIndexValue.value);
  const combinedWithPastedData = currentCharsInOtp.concat(pastedData);

  combinedWithPastedData.slice(0, props.numInputs).forEach((val, i) => {
    value.value[i] = val;
  });

  focusInput(combinedWithPastedData.slice(0, props.numInputs).length);

  // Update modelValue when data is pasted from keyboard
  emit('update:modelValue', value.value.join(''));
  // Check if `complete`
  return checkFilledAllInputs();
};
const handleOnChange = (val: string) => {
  changeCodeAtFocus(val);
  focusNextInput();
};
// Handle cases of backspace, delete, left arrow, right arrow
const handleOnKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Backspace':
      event.preventDefault();
      changeCodeAtFocus('');
      focusPrevInput();
      break;
    case 'Delete':
      event.preventDefault();
      changeCodeAtFocus('');
      break;
    case 'ArrowLeft':
      event.preventDefault();
      focusPrevInput();
      break;
    case 'ArrowRight':
      event.preventDefault();
      focusNextInput();
      break;
    default:
      break;
  }
};
const handleOnKeyUp = () => {
  validate();
};
//#endregion

defineExpose({ validate, focus });
</script>

<template>
  <div>
    <div class="ds-flex ds-items-center ds-justify-center ds-space-x-2">
      <BOtpFieldBox
        v-for="(_, i) in numInputs"
        :key="i"
        ref="boxRefs"
        :class="inputCssClassValue"
        :focus="focusIndexValue === i"
        :is-disabled="disabled"
        :value="value[i]"
        @on-change="handleOnChange"
        @on-keydown="handleOnKeyDown"
        @on-keyup="handleOnKeyUp"
        @on-paste="handleOnPaste"
        @on-focus="handleOnFocus(i)"
        @on-blur="handleOnBlur"
      />
    </div>
    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
    />
  </div>
</template>
