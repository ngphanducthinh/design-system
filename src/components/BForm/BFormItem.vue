<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { useValidationField } from '@/composables/useValidation.ts';
import { computed, inject, ref, watch } from 'vue';
import type { ZodType } from 'zod';
import { BFormContextKey } from './context.ts';
import {
  BFormLayout,
  BFormRequiredMark,
  BFormValidateStatus,
  BFormValidateTrigger,
} from './types.ts';

const {
  label,
  name,
  schema,
  required = false,
  validateStatus,
  help,
  extra,
  colon = null,
  labelAlign,
  labelWidth,
  hidden = false,
  noStyle = false,
  hasFeedback = false,
  tooltip,
  layout,
  validateTrigger,
} = defineProps<{
  /** Label text for the form item. */
  label?: string;
  /** Field name (used for validation and form data collection). */
  name?: string;
  /** Zod schema for field validation. */
  schema?: ZodType;
  /** Whether to display a required mark (visual only, does not add validation). */
  required?: boolean;
  /** Manual validation status override. */
  validateStatus?: `${BFormValidateStatus}`;
  /** Custom help/error message (overrides auto-generated). */
  help?: string;
  /** Extra hint text below the control. */
  extra?: string;
  /** Override parent form colon setting. Pass true/false to override, omit to inherit. */
  colon?: boolean | null;
  /** Override parent form label alignment. */
  labelAlign?: 'left' | 'right';
  /** Override parent form label width. */
  labelWidth?: string;
  /** Hide the form item visually but still validate. */
  hidden?: boolean;
  /** Render control only, no wrapper/label/margin. */
  noStyle?: boolean;
  /** Show validation feedback icon. */
  hasFeedback?: boolean;
  /** Override validation trigger. */
  validateTrigger?: `${BFormValidateTrigger}` | `${BFormValidateTrigger}`[];
  /** Tooltip text for the label. */
  tooltip?: string;
  /** Per-item layout override. */
  layout?: 'horizontal' | 'vertical';
}>();

const formContext = inject(BFormContextKey, undefined);

const { componentUID } = useComponentId();
const fieldId = computed(() => `b-form-item-${name ? name + '-' : ''}${componentUID.value}`);

const fieldValueRef = computed(() => {
  if (name && formContext?.model) {
    return formContext.model[name];
  }
  return undefined;
});

const fieldValueAsRef = ref(fieldValueRef.value);
watch(fieldValueRef, (val) => {
  fieldValueAsRef.value = val;
});

const hasValidation = !!(name && schema);

const validation = hasValidation
  ? useValidationField(name!, fieldValueAsRef, schema!)
  : undefined;

const resolvedTrigger = computed(() => {
  if (validateTrigger) return Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger];
  const parentTrigger = formContext?.validateTrigger ?? BFormValidateTrigger.Change;
  return Array.isArray(parentTrigger) ? parentTrigger : [parentTrigger];
});

const handleBlur = () => {
  if (validation && resolvedTrigger.value.includes(BFormValidateTrigger.Blur)) {
    validation.markTouched();
    validation.validate();
  }
};

const handleChange = () => {
  if (validation && resolvedTrigger.value.includes(BFormValidateTrigger.Change)) {
    validation.validate();
  }
};

watch(fieldValueRef, () => {
  handleChange();
});

const computedStatus = computed<`${BFormValidateStatus}` | undefined>(() => {
  if (validateStatus) return validateStatus;
  if (!validation) return undefined;
  if (validation.errors.value.length > 0) return BFormValidateStatus.Error;
  if (validation.touched.value && validation.isValid.value) return BFormValidateStatus.Success;
  return undefined;
});

const resolvedLayout = computed(() => {
  if (layout !== undefined) return layout;
  if (formContext?.layout !== undefined) return formContext.layout;
  return BFormLayout.Horizontal;
});
const resolvedLabelAlign = computed(() => {
  if (labelAlign !== undefined) return labelAlign;
  if (formContext?.labelAlign !== undefined) return formContext.labelAlign;
  return 'right';
});
const resolvedColon = computed(() => {
  if (colon !== null) return colon;
  if (formContext?.colon !== undefined) return formContext.colon;
  return true;
});
const resolvedLabelWidth = computed(() => labelWidth ?? formContext?.labelWidth);
const isDisabled = computed(() => formContext?.disabled ?? false);

const isRequired = computed(() => {
  if (required) return true;
  if (schema) {
    const result = schema.safeParse(undefined);
    if (!result.success) return true;
    const emptyResult = schema.safeParse('');
    if (!emptyResult.success) return true;
  }
  return false;
});

const showColon = computed(() => resolvedColon.value && resolvedLayout.value === 'horizontal');

const showRequiredMark = computed(() => {
  const mark = formContext?.requiredMark ?? true;
  if (mark === false) return false;
  if (mark === BFormRequiredMark.Optional) return false;
  return isRequired.value;
});

const showOptionalMark = computed(() => {
  const mark = formContext?.requiredMark ?? true;
  return mark === BFormRequiredMark.Optional && !isRequired.value;
});

const helpMessage = computed(() => {
  if (help !== undefined) return help;
  if (validation && validation.errors.value.length > 0) return validation.errors.value[0];
  return undefined;
});

const itemClasses = computed(() => [
  'b-form-item',
  `b-form-item--${resolvedLayout.value}`,
  {
    'b-form-item--has-error': computedStatus.value === BFormValidateStatus.Error,
    'b-form-item--has-warning': computedStatus.value === BFormValidateStatus.Warning,
    'b-form-item--has-success': computedStatus.value === BFormValidateStatus.Success,
    'b-form-item--validating': computedStatus.value === BFormValidateStatus.Validating,
    'b-form-item--has-feedback': hasFeedback,
    'b-form-item--hidden': hidden,
    'b-form-item--no-style': noStyle,
    'b-form-item--required': showRequiredMark.value,
  },
]);

const labelStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (resolvedLabelWidth.value) {
    styles.width = resolvedLabelWidth.value;
    styles.flexShrink = '0';
  }
  return styles;
});

defineExpose({
  validate: validation?.validate ?? (() => true),
  reset: validation?.reset ?? (() => {}),
  errors: validation?.errors ?? computed(() => []),
  isValid: validation?.isValid ?? computed(() => true),
  dirty: validation?.dirty ?? computed(() => false),
  touched: validation?.touched ?? computed(() => false),
  handleBlur,
});
</script>

<template>
  <div
    v-if="!noStyle"
    :class="itemClasses"
    :data-form-field="name"
    role="group"
    :aria-labelledby="label ? `${fieldId}-label` : undefined"
  >
    <div
      v-if="label || $slots.label"
      class="b-form-item__label"
      :class="[`b-form-item__label--${resolvedLabelAlign}`]"
      :style="labelStyle"
    >
      <label :id="`${fieldId}-label`" :for="fieldId">
        <span v-if="showRequiredMark" class="b-form-item__required-mark" aria-hidden="true">*</span>
        <slot name="label">{{ label }}</slot>
        <span v-if="showOptionalMark" class="b-form-item__optional-mark">(optional)</span>
        <span
          v-if="showColon"
          class="b-form-item__colon"
          aria-hidden="true"
        >:</span>
      </label>
      <span v-if="tooltip" class="b-form-item__tooltip" :title="tooltip" role="img" aria-label="Help">
        <svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path
            d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
          />
          <path
            d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.4-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7c0-19.7 12.4-37.7 30.9-44.8 59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3z"
          />
          <path d="M512 732a40 40 0 100-80 40 40 0 000 80z" />
        </svg>
      </span>
    </div>

    <div class="b-form-item__control">
      <div class="b-form-item__control-input">
        <slot :id="fieldId" :status="computedStatus" :disabled="isDisabled" :on-blur="handleBlur" />
        <span v-if="hasFeedback && computedStatus" class="b-form-item__feedback-icon">
          <svg
            v-if="computedStatus === 'success'"
            viewBox="64 64 896 896"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"
            />
          </svg>
          <svg
            v-else-if="computedStatus === 'error'"
            viewBox="64 64 896 896"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L512 449.8 295.9 191.7c-3-3.6-7.5-5.7-12.3-5.7H204c-6.8 0-10.5 7.9-6.1 13.1L460.2 512 197.8 824.9A7.95 7.95 0 00204 838h79.8c4.7 0 9.2-2.1 12.3-5.7L512 574.1l216.2 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
            />
          </svg>
          <svg
            v-else-if="computedStatus === 'warning'"
            viewBox="64 64 896 896"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8z"
            />
            <path
              d="M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48z"
            />
          </svg>
          <span v-else-if="computedStatus === 'validating'" class="b-form-item__loading-icon">
            <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path
                d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.3 199.3 0 19.9-16.1 36-36 36z"
              />
            </svg>
          </span>
        </span>
      </div>

      <div
        v-if="helpMessage || $slots.help"
        class="b-form-item__help"
        :class="{
          'b-form-item__help--error': computedStatus === 'error',
          'b-form-item__help--warning': computedStatus === 'warning',
        }"
        :id="`${fieldId}-help`"
        role="alert"
        aria-live="polite"
      >
        <slot name="help">{{ helpMessage }}</slot>
      </div>

      <div v-if="extra || $slots.extra" class="b-form-item__extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>
  </div>

  <template v-else>
    <slot :id="fieldId" :status="computedStatus" :disabled="isDisabled" :on-blur="handleBlur" />
  </template>
</template>

<style scoped>
.b-form-item {
  margin-bottom: var(--b-form-item-margin-bottom, 24px);
}

.b-form-item--horizontal {
  display: flex;
  align-items: flex-start;
}

.b-form-item--vertical {
  display: flex;
  flex-direction: column;
}

.b-form-item--hidden {
  display: none;
}

:deep(.b-form--inline) .b-form-item {
  margin-bottom: var(--b-form-inline-item-margin-bottom, 0);
}

/* Label */
.b-form-item__label {
  display: inline-flex;
  align-items: center;
  height: var(--b-form-label-height, 32px);
  color: var(--b-form-label-color, rgba(0, 0, 0, 0.88));
  font-size: var(--b-form-label-font-size, 14px);
  line-height: 1.5714;
  white-space: nowrap;
}

.b-form-item--horizontal .b-form-item__label {
  margin-right: 8px;
  flex-shrink: 0;
}

.b-form-item--vertical .b-form-item__label {
  margin: var(--b-form-vertical-label-margin, 0);
  padding: var(--b-form-vertical-label-padding, 0 0 8px);
  height: auto;
}

.b-form-item__label--left {
  text-align: left;
  justify-content: flex-start;
}

.b-form-item__label--right {
  text-align: right;
  justify-content: flex-end;
}

.b-form-item__label label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: default;
}

.b-form-item__required-mark {
  color: var(--b-form-label-required-mark-color, #ff4d4f);
  margin-right: 4px;
  font-family: SimSun, sans-serif;
  line-height: 1;
}

.b-form-item__optional-mark {
  color: var(--b-form-help-color, rgba(0, 0, 0, 0.65));
  margin-left: 4px;
  font-size: 12px;
  font-style: italic;
}

.b-form-item__colon {
  margin-inline-start: var(--b-form-label-colon-margin-inline-start, 2px);
  margin-inline-end: var(--b-form-label-colon-margin-inline-end, 8px);
}

.b-form-item__tooltip {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: var(--b-form-help-color, rgba(0, 0, 0, 0.65));
  cursor: help;
}

/* Control */
.b-form-item__control {
  flex: 1;
  min-width: 0;
}

.b-form-item__control-input {
  display: flex;
  align-items: center;
  position: relative;
}

/* Feedback icon */
.b-form-item__feedback-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.b-form-item--has-success .b-form-item__feedback-icon {
  color: var(--b-form-success-color, #52c41a);
}

.b-form-item--has-error .b-form-item__feedback-icon {
  color: var(--b-form-error-color, #ff4d4f);
}

.b-form-item--has-warning .b-form-item__feedback-icon {
  color: var(--b-form-warning-color, #faad14);
}

.b-form-item__loading-icon {
  display: inline-flex;
  animation: b-form-spin 1s linear infinite;
}

@keyframes b-form-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Help & Extra */
.b-form-item__help {
  min-height: 22px;
  padding-top: 2px;
  font-size: 14px;
  line-height: 1.5714;
  color: var(--b-form-help-color, rgba(0, 0, 0, 0.65));
  transition: color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.b-form-item__help--error {
  color: var(--b-form-error-color, #ff4d4f);
}

.b-form-item__help--warning {
  color: var(--b-form-warning-color, #faad14);
}

.b-form-item__extra {
  padding-top: 2px;
  font-size: 14px;
  line-height: 1.5714;
  color: var(--b-form-help-color, rgba(0, 0, 0, 0.65));
}

@media (prefers-reduced-motion: reduce) {
  .b-form-item__help {
    transition: none;
  }

  .b-form-item__loading-icon {
    animation: none;
  }
}
</style>
