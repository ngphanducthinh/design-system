<script lang="ts" setup>
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';

//#region Props
export interface BCheckboxProps {
  inputId?: string;
  modelValue: boolean | Array<string | number>;
  label?: string;
  /**
   * Clicking on label will not turn on/off the switch.
   */
  labelOrphan?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<BCheckboxProps>(), {
  inputId: '',
  modelValue: false,
  label: '',
  labelOrphan: false,
  disabled: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param: <code>value: boolean | Array<string | number></code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: boolean | Array<string | number>): void;
}>();
//#endregion

//#region Data
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
//#endregion
</script>
<template>
  <div class="b-switch ds-flex ds-items-center">
    <input
      v-model="value"
      :id="id"
      :disabled="props.disabled"
      :value="$attrs.value"
      type="checkbox"
      class="b-switch__input"
    />
    <label
      :for="id"
      class="b-switch__input-label ds-border ds-border-black/[0.1] ds-drop-shadow-light"
    />
    <label
      v-if="props.label || $slots.default"
      :for="props.labelOrphan ? undefined : id"
      class="ds-ml-2 ds-text-sm ds-font-medium ds-text-gray-900"
    >
      <slot>
        {{ props.label }}
      </slot>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.b-switch__input {
  display: none;

  &:checked + .b-switch__input-label {
    background-color: theme('colors.primary-t');
  }

  &:checked + .b-switch__input-label::before {
    transform: translateX(100%);
    background-color: theme('colors.white');
  }

  &:disabled + .b-switch__input-label::before {
    background-color: theme('colors.gray.100');
  }
}

.b-switch__input-label {
  position: relative;
  display: flex;
  background-color: theme('colors.gray.200');
  border-radius: theme('borderRadius.2xl');
  padding: theme('padding[0.5]');
  width: theme('width.11');
  height: theme('height.6');

  &::before {
    content: '';
    position: absolute;
    width: theme('width.5');
    height: theme('height.5');
    background-color: theme('colors.white');
    border-radius: theme('borderRadius.full');
    left: calc(theme('padding[0.5]') - 1px);
    top: calc(theme('padding[0.5]') - 1px);
    transition: theme('transitionProperty.all') theme('transitionDuration.150')
      theme('transitionTimingFunction.linear');
  }
}
</style>
