<script lang="ts" setup>
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, inject } from 'vue';
import { B_RADIO_GROUP_KEY, type BRadioGroupContext } from './types';

//#region Props
const {
  id = '',
  disabled = false,
  value = '',
  name = '',
} = defineProps<{
  /** Custom id attribute for the radio input. */
  id?: string;
  /** Whether the radio is disabled. */
  disabled?: boolean;
  /** Value when used inside BRadioGroup. */
  value?: string | number;
  /** The name attribute for the input element. */
  name?: string;
}>();

/**
 * The checked state of the radio.
 */
const model = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  change: [checked: boolean, event: Event];
}>();
//#endregion

//#region Group integration
const group = inject<BRadioGroupContext | null>(B_RADIO_GROUP_KEY, null);

const isDisabled = computed(() => disabled || group?.disabled.value || false);
const inputName = computed(() => name || group?.name.value || '');

const isChecked = computed(() => {
  if (group) {
    return group.modelValue.value === value;
  }
  return model.value;
});
//#endregion

//#region ID generation
const { componentUID } = useComponentId();
const inputId = computed(() => id || `b-radio-${componentUID.value}`);
//#endregion

//#region Handlers
function handleChange(event: Event) {
  if (isDisabled.value) return;

  if (group) {
    group.setValue(value);
  } else {
    model.value = true;
  }
  emit('change', true, event);
}
//#endregion
</script>

<template>
  <label
    class="b-radio b:inline-flex b:items-center b:cursor-pointer b:select-none b:gap-2 b:leading-none"
    :class="{ 'b-radio--disabled b:cursor-not-allowed b:opacity-50': isDisabled }"
    :for="inputId"
  >
    <span
      class="b-radio__indicator b:relative b:inline-flex b:items-center b:justify-center b:shrink-0"
      :class="{
        'b-radio__indicator--checked': isChecked,
        'b-radio__indicator--disabled': isDisabled,
      }"
    >
      <input
        :id="inputId"
        type="radio"
        class="b-radio__input"
        :checked="isChecked"
        :disabled="isDisabled"
        :name="inputName"
        :value="value"
        @change="handleChange"
      />
      <span class="b-radio__inner" aria-hidden="true" />
    </span>
    <span v-if="$slots.default" class="b-radio__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.b-radio {
  --b-radio-size: 16px;
  --b-radio-dot-size: 8px;
  --b-radio-color-primary: #1677ff;
  --b-radio-color-primary-hover: #4096ff;
  --b-radio-color-border: #d9d9d9;
  --b-radio-color-bg-container: #ffffff;
  --b-radio-color-bg-container-disabled: rgba(0, 0, 0, 0.04);
  --b-radio-color-text-disabled: rgba(0, 0, 0, 0.25);
  --b-radio-color-border-disabled: #d9d9d9;
  --b-radio-dot-color-disabled: rgba(0, 0, 0, 0.25);
  --b-radio-border-width: 1px;
  --b-radio-font-size: 14px;
  --b-radio-line-height: 1.5714;
  --b-radio-wrapper-margin-inline-end: 8px;
  --b-radio-transition-duration: 0.2s;
}

[data-prefers-color='dark'] .b-radio {
  --b-radio-color-primary: #3c89e8;
  --b-radio-color-primary-hover: #65a9f3;
  --b-radio-color-border: #424242;
  --b-radio-color-bg-container: #141414;
  --b-radio-color-bg-container-disabled: rgba(255, 255, 255, 0.08);
  --b-radio-color-text-disabled: rgba(255, 255, 255, 0.25);
  --b-radio-color-border-disabled: #424242;
  --b-radio-dot-color-disabled: rgba(255, 255, 255, 0.25);
}

.b-radio__label {
  font-size: var(--b-radio-font-size);
  line-height: var(--b-radio-line-height);
  color: inherit;
}

.b-radio--disabled .b-radio__label {
  color: var(--b-radio-color-text-disabled);
}

.b-radio__indicator {
  width: var(--b-radio-size);
  height: var(--b-radio-size);
}

.b-radio__inner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: var(--b-radio-border-width) solid var(--b-radio-color-border);
  background-color: var(--b-radio-color-bg-container);
  transition:
    background-color var(--b-radio-transition-duration) ease-in-out,
    border-color var(--b-radio-transition-duration) ease-in-out;
}

/* Hover state */
.b-radio:not(.b-radio--disabled):hover .b-radio__inner {
  border-color: var(--b-radio-color-primary-hover);
}

/* Checked state */
.b-radio__indicator--checked .b-radio__inner {
  border-color: var(--b-radio-color-primary);
}

.b-radio__indicator--checked .b-radio__inner::after {
  content: '';
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  width: var(--b-radio-dot-size);
  height: var(--b-radio-dot-size);
  background-color: var(--b-radio-color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  transition:
    transform var(--b-radio-transition-duration) ease-in-out,
    opacity var(--b-radio-transition-duration) ease-in-out;
}

/* Disabled state */
.b-radio__indicator--disabled .b-radio__inner {
  background-color: var(--b-radio-color-bg-container-disabled);
  border-color: var(--b-radio-color-border-disabled);
}

.b-radio__indicator--disabled.b-radio__indicator--checked .b-radio__inner {
  border-color: var(--b-radio-color-border-disabled);
}

.b-radio__indicator--disabled.b-radio__indicator--checked .b-radio__inner::after {
  background-color: var(--b-radio-dot-color-disabled);
}

.b-radio__input {
  appearance: none;
  -webkit-appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  margin: 0;
  padding: 0;
  cursor: pointer;
  z-index: 1;
}

.b-radio--disabled .b-radio__input {
  cursor: not-allowed;
}

/* Focus-visible ring */
.b-radio__input:focus-visible + .b-radio__inner {
  outline: 2px solid var(--b-radio-color-primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .b-radio__inner,
  .b-radio__inner::after {
    transition: none;
  }
}
</style>
