<script lang="ts" setup>
import { BCheckboxSize } from '@/constants/Enums';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';

//#region Props
export interface BCheckboxProps {
  inputId?: string;
  inputCssClass?: string;
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
  inputCssClass: '',
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
const SiblingCssClass = `
  peer-checked:ds-text-transparent peer-checked:ds-bg-gradient-to-r peer-checked:ds-from-primary-f-stop peer-checked:ds-from-primary-f peer-checked:ds-to-primary-t
  peer-checked:after:ds-opacity-100
`;
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
const inputCssClassValue = computed(() => [
  props.inputCssClass,
  {
    'ds-cursor-not-allowed': props.disabled,
  },
]);
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
      :class="inputCssClassValue"
      :disabled="disabled"
      :value="$attrs.value"
      class="ds-peer ds-invisible"
      type="checkbox"
    />
    <label :class="SiblingCssClass" :for="id" class="input-label" />
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
  position: relative;

  input {
    width: theme('width.6');
    height: theme('height.6');
    min-width: theme('width.6');
    min-height: theme('height.6');
  }

  .input-label {
    background-color: theme('colors.white');
    border: 1px solid theme('colors.gray.200');
    border-radius: theme('borderRadius.lg');
    cursor: pointer;
    width: theme('width.6');
    height: theme('height.6');
    left: 0;
    position: absolute;
    top: 0;

    &:after {
      border: 3px solid #fff;
      border-top: none;
      border-right: none;
      content: '';
      height: 7px;
      left: 5px;
      // opacity: 0;
      position: absolute;
      top: 7px;
      transform: rotate(-45deg);
      width: theme('width.3');
    }
  }

  &.size-sm {
    input {
      width: theme('width.5');
      height: theme('height.5');
      min-width: theme('width.5');
      min-height: theme('height.5');
    }

    .input-label {
      width: theme('width.5');
      height: theme('height.5');

      &:after {
        border: 2.5px solid white;
        border-top: none;
        border-right: none;
        left: 3px;
        top: 4.5px;
      }
    }
  }

  // input[type='checkbox'] {
  //   visibility: hidden;
  // }

  // input[type='checkbox']:checked + .input-label {
  //   background-color: #66bb6a;
  //   border-color: #66bb6a;
  // }

  // input[type='checkbox']:checked + .input-label:after {
  //   opacity: 1;
  // }
}
</style>
