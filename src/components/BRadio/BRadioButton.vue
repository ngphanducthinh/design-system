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
  /** Custom id attribute for the radio button input. */
  id?: string;
  /** Whether the radio button is disabled. */
  disabled?: boolean;
  /** Value when used inside BRadioGroup. */
  value?: string | number;
  /** The name attribute for the input element. */
  name?: string;
}>();

/**
 * The checked state of the radio button.
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
const groupSize = computed(() => group?.size.value || 'middle');
const groupButtonStyle = computed(() => group?.buttonStyle.value || 'outline');

const isChecked = computed(() => {
  if (group) {
    return group.modelValue.value === value;
  }
  return model.value;
});
//#endregion

//#region ID generation
const { componentUID } = useComponentId();
const inputId = computed(() => id || `b-radio-button-${componentUID.value}`);
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
    class="b-radio-button b:relative b:inline-flex b:cursor-pointer b:items-center b:justify-center b:leading-none b:select-none"
    :class="[
      `b-radio-button--${groupSize}`,
      `b-radio-button--${groupButtonStyle}`,
      {
        'b-radio-button--checked': isChecked,
        'b-radio-button--disabled b:cursor-not-allowed': isDisabled,
      },
    ]"
    :for="inputId"
  >
    <input
      :id="inputId"
      type="radio"
      class="b-radio-button__input"
      :checked="isChecked"
      :disabled="isDisabled"
      :name="inputName"
      :value="value"
      @change="handleChange"
    />
    <span class="b-radio-button__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.b-radio-button {
  --b-radio-button-bg: #ffffff;
  --b-radio-button-checked-bg: #ffffff;
  --b-radio-button-color: rgba(0, 0, 0, 0.88);
  --b-radio-button-color-primary: #0958d9;
  --b-radio-button-color-primary-hover: #0958d9;
  --b-radio-button-color-primary-active: #003eb3;
  --b-radio-button-color-border: #d9d9d9;
  --b-radio-button-color-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-radio-button-color-disabled: rgba(0, 0, 0, 0.25);
  --b-radio-button-solid-checked-bg: #0958d9;
  --b-radio-button-solid-checked-color: #fff;
  --b-radio-button-solid-checked-hover-bg: #003eb3;
  --b-radio-button-solid-checked-active-bg: #002b80;
  --b-radio-button-padding-inline: 15px;
  --b-radio-button-border-width: 1px;
  --b-radio-button-transition-duration: 0.2s;

  border: var(--b-radio-button-border-width) solid var(--b-radio-button-color-border);
  background-color: var(--b-radio-button-bg);
  color: var(--b-radio-button-color);
  padding-inline: var(--b-radio-button-padding-inline);
  transition:
    color var(--b-radio-button-transition-duration) ease-in-out,
    background-color var(--b-radio-button-transition-duration) ease-in-out,
    border-color var(--b-radio-button-transition-duration) ease-in-out;
  margin-inline-start: calc(-1 * var(--b-radio-button-border-width));
}

.b-radio-button:first-child {
  margin-inline-start: 0;
  border-start-start-radius: 6px;
  border-end-start-radius: 6px;
}

.b-radio-button:last-child {
  border-start-end-radius: 6px;
  border-end-end-radius: 6px;
}

/* Sizes */
.b-radio-button--large {
  padding-block: 8px;
  font-size: 16px;
  line-height: 1.5;
}

.b-radio-button--middle {
  padding-block: 5px;
  font-size: 14px;
  line-height: 1.5714;
}

.b-radio-button--small {
  padding-block: 1px;
  font-size: 14px;
  line-height: 1.5714;
}

/* Outline style — checked */
.b-radio-button--outline.b-radio-button--checked {
  color: var(--b-radio-button-color-primary);
  border-color: var(--b-radio-button-color-primary);
  background-color: var(--b-radio-button-checked-bg);
  z-index: 1;
}

.b-radio-button--outline:not(.b-radio-button--disabled):hover {
  color: var(--b-radio-button-color-primary-hover);
  border-color: var(--b-radio-button-color-primary-hover);
  z-index: 1;
}

/* Solid style — checked */
.b-radio-button--solid.b-radio-button--checked {
  color: var(--b-radio-button-solid-checked-color);
  background-color: var(--b-radio-button-solid-checked-bg);
  border-color: var(--b-radio-button-solid-checked-bg);
  z-index: 1;
}

.b-radio-button--solid.b-radio-button--checked:hover {
  background-color: var(--b-radio-button-solid-checked-hover-bg);
  border-color: var(--b-radio-button-solid-checked-hover-bg);
}

.b-radio-button--solid:not(.b-radio-button--checked):not(.b-radio-button--disabled):hover {
  color: var(--b-radio-button-color-primary-hover);
  border-color: var(--b-radio-button-color-primary-hover);
  z-index: 1;
}

/* Disabled */
.b-radio-button--disabled {
  background-color: var(--b-radio-button-color-disabled-bg);
  color: var(--b-radio-button-color-disabled);
  border-color: var(--b-radio-button-color-border);
  opacity: 1;
}

.b-radio-button--disabled.b-radio-button--checked {
  background-color: var(--b-radio-button-color-disabled-bg);
  color: var(--b-radio-button-color-disabled);
  border-color: var(--b-radio-button-color-border);
}

/* Hidden input */
.b-radio-button__input {
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

.b-radio-button--disabled .b-radio-button__input {
  cursor: not-allowed;
}

/* Focus-visible ring */
.b-radio-button__input:focus-visible ~ .b-radio-button__label {
  outline: 2px solid var(--b-radio-button-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Dark mode */
[data-prefers-color='dark'] .b-radio-button {
  --b-radio-button-bg: #141414;
  --b-radio-button-checked-bg: #141414;
  --b-radio-button-color: rgba(255, 255, 255, 0.85);
  --b-radio-button-color-primary: #4d94e8;
  --b-radio-button-color-primary-hover: #4d94e8;
  --b-radio-button-color-primary-active: #3c89e8;
  --b-radio-button-color-border: #424242;
  --b-radio-button-color-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-radio-button-color-disabled: rgba(255, 255, 255, 0.25);
  --b-radio-button-solid-checked-bg: #1668dc;
  --b-radio-button-solid-checked-color: #fff;
  --b-radio-button-solid-checked-hover-bg: #0958d9;
  --b-radio-button-solid-checked-active-bg: #003eb3;
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-radio-button {
    --b-radio-button-bg: #141414;
    --b-radio-button-checked-bg: #141414;
    --b-radio-button-color: rgba(255, 255, 255, 0.85);
    --b-radio-button-color-primary: #4d94e8;
    --b-radio-button-color-primary-hover: #4d94e8;
    --b-radio-button-color-primary-active: #3c89e8;
    --b-radio-button-color-border: #424242;
    --b-radio-button-color-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-radio-button-color-disabled: rgba(255, 255, 255, 0.25);
    --b-radio-button-solid-checked-bg: #1668dc;
    --b-radio-button-solid-checked-color: #fff;
    --b-radio-button-solid-checked-hover-bg: #0958d9;
    --b-radio-button-solid-checked-active-bg: #003eb3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-radio-button {
    transition: none;
  }
}
</style>
