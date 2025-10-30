<script lang="ts" setup>
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed } from 'vue';

//#region Props
const {
  id = '',
  label = '',
  labelOrphan = false,
  disabled = false,
} = defineProps<{
  /**
   * The id attribute for the switch input.
   */
  id?: string;
  /**
   * The label text displayed next to the switch.
   */
  label?: string;
  /**
   * Clicking on label will not turn on/off the switch.
   */
  labelOrphan?: boolean;
  /**
   * Disables the switch if set to true.
   */
  disabled?: boolean;
}>();

/**
 * The value of the switch. Can be a boolean or an array of strings/numbers for multiple switches.
 */
const model = defineModel<boolean | Array<string | number>>({ default: false });
//#endregion

const { componentUID } = useComponentId();
const inputId = computed(() => id || `b-switch-input-${componentUID.value}`);
</script>
<template>
  <div class="b-switch b:flex b:items-center">
    <input
      :id="inputId"
      v-model="model"
      :disabled="disabled"
      :value="$attrs.value"
      class="b-switch__input"
      type="checkbox"
    />
    <label :for="inputId" class="b-switch__input-label b:drop-shadow-light" />
    <label
      v-if="label || $slots.default"
      :for="labelOrphan ? undefined : inputId"
      class="b:ml-2 b:text-sm b:font-medium b:text-gray-900"
    >
      <slot>
        {{ label }}
      </slot>
    </label>
  </div>
</template>

<style scoped>
.b-switch__input {
  display: none;

  &:checked + .b-switch__input-label {
    background-color: var(--b-color-primary);
  }

  &:checked + .b-switch__input-label::before {
    transform: translateX(22px);
    background-color: var(--b-color-white);
  }

  &:disabled + .b-switch__input-label::before {
    background-color: var(--b-color-gray-100);
  }
}

.b-switch__input-label {
  position: relative;
  display: flex;
  background-color: var(--b-color-gray-200);
  border-radius: var(--b-radius-2xl);
  padding: calc(var(--b-spacing) * 0.5);
  width: calc(var(--b-spacing) * 11);
  height: calc(var(--b-spacing) * 5.5);

  &::before {
    content: '';
    position: absolute;
    width: calc(var(--b-spacing) * 4.5);
    height: calc(var(--b-spacing) * 4.5);
    background-color: var(--b-color-white);
    border-radius: calc(infinity * 1px);
    left: calc(var(--b-spacing) * 0.5);
    top: calc(var(--b-spacing) * 0.5);
    transition: all var(--b-default-transition-duration) var(--b-default-transition-timing-function);
  }
}
</style>
