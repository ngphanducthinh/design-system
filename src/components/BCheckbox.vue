<script lang="ts" setup>
import { BCheckboxSize } from '@/constants/Enums';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';

//#region Props
export interface BCheckboxProps {
  inputId?: string;
  modelValue: boolean | Array<string | number>;
  label?: string;
  /**
   * Clicking on label will not check on checkbox.
   */
  labelOrphan?: boolean;
  disabled?: boolean;
  size?: `${BCheckboxSize}`;
}

const props = withDefaults(defineProps<BCheckboxProps>(), {
  inputId: '',
  modelValue: false,
  label: '',
  labelOrphan: false,
  disabled: false,
  size: BCheckboxSize.Medium,
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
const cssClassValue = computed(() => {
  let result = ``;

  switch (props.size) {
    case BCheckboxSize.Small:
      result += `size-sm `;
      break;
    case BCheckboxSize.Medium:
    default:
      result += ` `;
      break;
  }

  return result;
});
//#endregion

/**
 * Customize checkbox styles, need to hide input tag and style a label which stands for that input
 * Example: https://codepen.io/AllThingsSmitty/pen/WjZVjo
 * Support input type=checkbox in Vue
 * https://vuejs.org/guide/essentials/forms#checkbox-1
 */
</script>
<template>
  <div :class="cssClassValue" class="b-checkbox ds-flex ds-items-center">
    <input
      :id="id"
      v-model="value"
      :disabled="disabled"
      :value="$attrs.value"
      type="checkbox"
      class="b-checkbox__input"
    />
    <label
      :for="id"
      class="b-checkbox__input-label ds-border ds-border-black/[0.1] ds-drop-shadow-light"
    />
    <label
      v-if="label || $slots.default"
      :for="labelOrphan ? undefined : id"
      class="ds-ml-2 ds-text-sm ds-font-medium ds-text-gray-900"
    >
      <slot>
        {{ props.label }}
      </slot>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.b-checkbox {
  .b-checkbox__input {
    display: none;
    width: theme('width.6');
    height: theme('height.6');
    min-width: theme('width.6');
    min-height: theme('height.6');

    &:checked + .b-checkbox__input-label {
      background-color: theme('colors.primary-t');
    }

    &:checked + .b-checkbox__input-label::after {
      border-color: theme('colors.white');
    }

    &:disabled + .b-checkbox__input-label {
      background-color: theme('colors.gray.100');
    }

    &:disabled + .b-checkbox__input-label::after {
      border-color: theme('colors.gray.100');
    }
  }

  .b-checkbox__input-label {
    position: relative;
    background-color: theme('colors.white');
    border-radius: theme('borderRadius.lg');
    cursor: pointer;
    width: theme('width.6');
    height: theme('height.6');
    transition: theme('transitionProperty.all') theme('transitionDuration.150')
      theme('transitionTimingFunction.linear');

    &:after {
      border: 3px solid theme('colors.transparent');
      border-top: none;
      border-right: none;
      content: '';
      height: 7px;
      left: 5.5px;
      position: absolute;
      top: 7px;
      transform: rotate(-45deg);
      width: theme('width.3');
      transition: theme('transitionProperty.all')
        theme('transitionDuration.150') theme('transitionTimingFunction.linear');
    }
  }

  &.size-sm {
    .b-checkbox__input {
      width: theme('width.5');
      height: theme('height.5');
      min-width: theme('width.5');
      min-height: theme('height.5');
    }

    .b-checkbox__input-label {
      width: theme('width.5');
      height: theme('height.5');

      &:after {
        border: 2.5px solid theme('colors.transparent');
        border-top: none;
        border-right: none;
        left: 3.5px;
        top: 4.5px;
      }
    }
  }
}
</style>
