<script setup lang="ts">
import { useValidationForm } from '@/composables/useValidation.ts';
import { computed, provide, ref } from 'vue';
import { BFormContextKey } from './context.ts';
import {
  BFormLayout,
  BFormLabelAlign,
  BFormRequiredMark,
  BFormValidateTrigger,
  type BFormFieldError,
  type BFormItemContext,
  type BFormValidateResult,
} from './types.ts';

const {
  layout = BFormLayout.Horizontal,
  labelAlign = BFormLabelAlign.Left,
  labelWidth,
  colon = true,
  disabled = false,
  requiredMark = true,
  name,
  model,
  scrollToFirstError = false,
  validateTrigger = BFormValidateTrigger.Change,
  noHtml5Validate = false,
} = defineProps<{
  /** Form layout mode. */
  layout?: `${BFormLayout}`;
  /** Label text alignment. */
  labelAlign?: `${BFormLabelAlign}`;
  /** Fixed width for all labels. */
  labelWidth?: string;
  /** Display colon after label (horizontal layout only). */
  colon?: boolean;
  /** Whether all form controls are disabled. */
  disabled?: boolean;
  /** How required/optional marks are displayed. */
  requiredMark?: boolean | `${BFormRequiredMark}`;
  /** Form name, used as field id prefix. */
  name?: string;
  /** Form data model object. Fields read their value from model[fieldName]. */
  model?: Record<string, unknown>;
  /** Auto-scroll to first validation error on submit failure. */
  scrollToFirstError?: boolean | ScrollIntoViewOptions;
  /** Default field validation trigger. */
  validateTrigger?: `${BFormValidateTrigger}` | `${BFormValidateTrigger}`[];
  /** Disable native HTML5 validation. */
  noHtml5Validate?: boolean;
}>();

const emit = defineEmits<{
  /** Called after successful validation on submit. */
  finish: [values: Record<string, unknown>];
  /** Called when validation fails on submit. */
  finishFailed: [result: BFormValidateResult];
}>();

const formEl = ref<HTMLFormElement | null>(null);

const { fields, validateAll, resetAll, isValid } = useValidationForm();

const formContext = computed<BFormItemContext>(() => ({
  layout,
  labelAlign,
  labelWidth,
  colon,
  disabled,
  requiredMark,
  validateTrigger,
  model,
}));

provide(BFormContextKey, formContext.value);

const validate = (): boolean => {
  return validateAll();
};

const buildResult = (): BFormValidateResult => {
  const errorFields: BFormFieldError[] = [];
  const values: Record<string, unknown> = {};

  for (const [key, fieldState] of Object.entries(fields)) {
    values[key] = model?.[key];
    if (!fieldState.value.isValid) {
      errorFields.push({ name: key, errors: fieldState.value.errors });
    }
  }

  return { values, errorFields };
};

const resetFields = (names?: string[]) => {
  if (!names) {
    resetAll();
    return;
  }
  for (const fieldName of names) {
    if (fields[fieldName]) {
      fields[fieldName].value.reset();
    }
  }
};

const scrollToField = (fieldName: string, options?: ScrollIntoViewOptions) => {
  const el = formEl.value?.querySelector(`[data-form-field="${fieldName}"]`);
  if (el) {
    el.scrollIntoView(options ?? { behavior: 'smooth', block: 'center' });
  }
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  const allValid = validate();
  const result = buildResult();

  if (allValid) {
    emit('finish', result.values);
  } else {
    emit('finishFailed', result);
    if (scrollToFirstError && result.errorFields.length > 0) {
      const opts =
        typeof scrollToFirstError === 'object' ? scrollToFirstError : { behavior: 'smooth' as const, block: 'center' as const };
      scrollToField(result.errorFields[0].name, opts);
    }
  }
};

const formClasses = computed(() => [
  'b-form',
  `b-form--${layout}`,
  `b-form--label-${labelAlign}`,
  {
    'b-form--disabled': disabled,
  },
]);

defineExpose({
  validate,
  resetFields,
  scrollToField,
  isValid,
});
</script>

<template>
  <form
    ref="formEl"
    :class="formClasses"
    :name="name"
    :novalidate="noHtml5Validate"
    role="form"
    :aria-label="name"
    @submit="handleSubmit"
  >
    <slot />
  </form>
</template>

<style scoped>
.b-form {
  --b-form-item-margin-bottom: 24px;
  --b-form-inline-item-margin-bottom: 0;
  --b-form-label-color: rgba(0, 0, 0, 0.88);
  --b-form-label-font-size: 14px;
  --b-form-label-height: 32px;
  --b-form-label-colon-margin-inline-start: 2px;
  --b-form-label-colon-margin-inline-end: 8px;
  --b-form-label-required-mark-color: #cf1322;
  --b-form-vertical-label-margin: 0;
  --b-form-vertical-label-padding: 0 0 8px;
  --b-form-help-color: rgba(0, 0, 0, 0.65);
  --b-form-error-color: #cf1322;
  --b-form-warning-color: #874d00;
  --b-form-success-color: #52c41a;

  margin: 0;
  padding: 0;
  font-size: var(--b-form-label-font-size);
  color: var(--b-form-label-color);
}

.b-form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

[data-prefers-color='dark'] .b-form {
  --b-form-label-color: rgba(255, 255, 255, 0.88);
  --b-form-label-required-mark-color: #dc3838;
  --b-form-help-color: rgba(255, 255, 255, 0.65);
  --b-form-error-color: #dc3838;
  --b-form-warning-color: #d1a300;
  --b-form-success-color: #49aa19;
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-form {
    --b-form-label-color: rgba(255, 255, 255, 0.88);
    --b-form-label-required-mark-color: #dc3838;
    --b-form-help-color: rgba(255, 255, 255, 0.65);
    --b-form-error-color: #dc3838;
    --b-form-warning-color: #d1a300;
    --b-form-success-color: #49aa19;
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-form :deep(.b-form-item__help) {
    transition: none;
  }
}
</style>
