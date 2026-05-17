<script lang="ts" setup>
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { B_CHECKBOX_GROUP_KEY, type BCheckboxGroupContext } from './types';

//#region Props
const {
  id = '',
  disabled = false,
  indeterminate = false,
  value = '',
  name = '',
} = defineProps<{
  /** Custom id attribute for the checkbox input. */
  id?: string;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Indeterminate checked state (visual "minus" mark). */
  indeterminate?: boolean;
  /** Value when used inside BCheckboxGroup. */
  value?: string | number;
  /** The name attribute for the input element. */
  name?: string;
}>();

/**
 * The checked state of the checkbox.
 * Supports boolean (single) or array (group) binding.
 */
const model = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  change: [checked: boolean, event: Event];
}>();
//#endregion

//#region Group integration
const group = inject<BCheckboxGroupContext | null>(B_CHECKBOX_GROUP_KEY, null);

const isDisabled = computed(() => disabled || group?.disabled.value || false);
const inputName = computed(() => name || group?.name.value || '');

const isChecked = computed(() => {
  if (group) {
    return group.modelValue.value.includes(value);
  }
  return model.value;
});
//#endregion

//#region ID generation
const { componentUID } = useComponentId();
const inputId = computed(() => id || `b-checkbox-${componentUID.value}`);
//#endregion

//#region Indeterminate DOM property
const inputRef = ref<HTMLInputElement | null>(null);

function syncIndeterminate() {
  if (inputRef.value) {
    inputRef.value.indeterminate = indeterminate;
  }
}

onMounted(syncIndeterminate);
watch(() => indeterminate, syncIndeterminate);
//#endregion

//#region Handlers
function handleChange(event: Event) {
  if (isDisabled.value) return;

  const target = event.target as HTMLInputElement;
  const checked = target.checked;

  if (group) {
    group.toggleValue(value);
  } else {
    model.value = checked;
  }
  emit('change', checked, event);
}
//#endregion
</script>

<template>
  <label
    class="b-checkbox b:inline-flex b:cursor-pointer b:items-center b:gap-2 b:leading-none b:select-none"
    :class="{ 'b-checkbox--disabled b:cursor-not-allowed b:opacity-50': isDisabled }"
    :for="inputId"
  >
    <span
      class="b-checkbox__indicator b:relative b:inline-flex b:shrink-0 b:items-center b:justify-center"
      :class="{
        'b-checkbox__indicator--checked': isChecked,
        'b-checkbox__indicator--indeterminate': indeterminate,
        'b-checkbox__indicator--disabled': isDisabled,
      }"
    >
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="b-checkbox__input"
        :checked="isChecked"
        :disabled="isDisabled"
        :name="inputName"
        :value="value"
        @change="handleChange"
      />
      <span class="b-checkbox__inner" aria-hidden="true" />
    </span>
    <span v-if="$slots.default" class="b-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.b-checkbox {
  --b-checkbox-size: 16px;
  --b-checkbox-color-primary: #1677ff;
  --b-checkbox-color-primary-hover: #4096ff;
  --b-checkbox-color-border: #d9d9d9;
  --b-checkbox-color-bg-container: #ffffff;
  --b-checkbox-color-bg-container-disabled: rgba(0, 0, 0, 0.04);
  --b-checkbox-color-text-disabled: rgba(0, 0, 0, 0.25);
  --b-checkbox-color-border-disabled: #d9d9d9;
  --b-checkbox-border-radius: 4px;
  --b-checkbox-border-width: 1px;
  --b-checkbox-font-size: 14px;
  --b-checkbox-line-height: 1.5714;
  --b-checkbox-check-color: #fff;
  --b-checkbox-transition-duration: 0.2s;
}

[data-prefers-color='dark'] .b-checkbox {
  --b-checkbox-color-primary: #3c89e8;
  --b-checkbox-color-primary-hover: #65a9f3;
  --b-checkbox-color-border: #424242;
  --b-checkbox-color-bg-container: #141414;
  --b-checkbox-color-bg-container-disabled: rgba(255, 255, 255, 0.08);
  --b-checkbox-color-text-disabled: rgba(255, 255, 255, 0.25);
  --b-checkbox-color-border-disabled: #424242;
  --b-checkbox-check-color: #fff;
}

.b-checkbox__label {
  font-size: var(--b-checkbox-font-size);
  line-height: var(--b-checkbox-line-height);
  color: inherit;
}

.b-checkbox--disabled .b-checkbox__label {
  color: var(--b-checkbox-color-text-disabled);
}

.b-checkbox__indicator {
  width: var(--b-checkbox-size);
  height: var(--b-checkbox-size);
}

.b-checkbox__inner {
  position: absolute;
  inset: 0;
  border-radius: var(--b-checkbox-border-radius);
  border: var(--b-checkbox-border-width) solid var(--b-checkbox-color-border);
  background-color: var(--b-checkbox-color-bg-container);
  transition:
    background-color var(--b-checkbox-transition-duration) ease-in-out,
    border-color var(--b-checkbox-transition-duration) ease-in-out;
}

/* Hover state */
.b-checkbox:not(.b-checkbox--disabled):hover .b-checkbox__inner {
  border-color: var(--b-checkbox-color-primary-hover);
}

/* Checked state */
.b-checkbox__indicator--checked .b-checkbox__inner {
  background-color: var(--b-checkbox-color-primary);
  border-color: var(--b-checkbox-color-primary);
}

.b-checkbox__indicator--checked .b-checkbox__inner::after {
  content: '';
  position: absolute;
  display: block;
  left: 4.5px;
  top: 1.5px;
  width: 5px;
  height: 9px;
  border: 2px solid var(--b-checkbox-check-color);
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg);
  opacity: 1;
  transition: opacity var(--b-checkbox-transition-duration) ease-in-out;
}

/* Indeterminate state */
.b-checkbox__indicator--indeterminate .b-checkbox__inner {
  background-color: var(--b-checkbox-color-primary);
  border-color: var(--b-checkbox-color-primary);
}

.b-checkbox__indicator--indeterminate .b-checkbox__inner::after {
  content: '';
  position: absolute;
  display: block;
  left: 3px;
  top: 50%;
  width: 8px;
  height: 2px;
  background-color: var(--b-checkbox-check-color);
  transform: translateY(-50%);
  border-radius: 1px;
}

/* Disabled state */
.b-checkbox__indicator--disabled .b-checkbox__inner {
  background-color: var(--b-checkbox-color-bg-container-disabled);
  border-color: var(--b-checkbox-color-border-disabled);
}

.b-checkbox__indicator--disabled.b-checkbox__indicator--checked .b-checkbox__inner,
.b-checkbox__indicator--disabled.b-checkbox__indicator--indeterminate .b-checkbox__inner {
  background-color: var(--b-checkbox-color-bg-container-disabled);
  border-color: var(--b-checkbox-color-border-disabled);
}

.b-checkbox__indicator--disabled.b-checkbox__indicator--checked .b-checkbox__inner::after {
  border-color: var(--b-checkbox-color-text-disabled);
}

.b-checkbox__indicator--disabled.b-checkbox__indicator--indeterminate .b-checkbox__inner::after {
  background-color: var(--b-checkbox-color-text-disabled);
}

.b-checkbox__input {
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

.b-checkbox--disabled .b-checkbox__input {
  cursor: not-allowed;
}

/* Focus-visible ring */
.b-checkbox__input:focus-visible + .b-checkbox__inner {
  outline: 2px solid var(--b-checkbox-color-primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .b-checkbox__inner,
  .b-checkbox__inner::after {
    transition: none;
  }
}
</style>
