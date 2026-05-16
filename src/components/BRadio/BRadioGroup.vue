<script lang="ts" setup>
import { computed, provide, reactive, toRefs } from 'vue';
import BRadio from './BRadio.vue';
import BRadioButton from './BRadioButton.vue';
import { B_RADIO_GROUP_KEY, type BRadioOption } from './types';

//#region Props
const {
  disabled = false,
  name = '',
  options = undefined,
  optionType = 'default',
  size = 'middle',
  buttonStyle = 'outline',
  block = false,
} = defineProps<{
  /** Disable all radios in the group. */
  disabled?: boolean;
  /** The name property of all child input elements. */
  name?: string;
  /** Shorthand options to render radios from an array. */
  options?: BRadioOption[] | string[] | number[];
  /** Style type of radio: default or button. */
  optionType?: 'default' | 'button';
  /** Size of radio button (only works with button style). */
  size?: 'large' | 'middle' | 'small';
  /** Style of radio button appearance. */
  buttonStyle?: 'outline' | 'solid';
  /** Whether to fit the width of the parent container. */
  block?: boolean;
}>();

/**
 * Currently selected value.
 */
const model = defineModel<string | number>();

const emit = defineEmits<{
  change: [value: string | number | undefined, event?: Event];
}>();
//#endregion

//#region Normalize options
const normalizedOptions = computed<BRadioOption[]>(() => {
  if (!options) return [];
  return options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt };
    }
    return opt;
  });
});
//#endregion

//#region Group context
function setValue(val: string | number) {
  model.value = val;
  emit('change', val);
}

const props = reactive({ disabled, name, size, optionType, buttonStyle });
const { disabled: disabledRef, name: nameRef, size: sizeRef, optionType: optionTypeRef, buttonStyle: buttonStyleRef } = toRefs(props);

provide(B_RADIO_GROUP_KEY, {
  modelValue: computed(() => model.value),
  disabled: disabledRef,
  name: nameRef,
  size: sizeRef,
  optionType: optionTypeRef,
  buttonStyle: buttonStyleRef,
  setValue,
});
//#endregion

//#region Computed component
const radioComponent = computed(() => (optionType === 'button' ? BRadioButton : BRadio));
//#endregion
</script>

<template>
  <div
    class="b-radio-group b:inline-flex b:flex-wrap b:items-center"
    :class="{
      'b-radio-group--block b:flex b:w-full': block,
      'b:gap-2': optionType !== 'button',
      'b:gap-0': optionType === 'button',
    }"
    role="radiogroup"
  >
    <template v-if="normalizedOptions.length > 0">
      <component
        :is="radioComponent"
        v-for="opt in normalizedOptions"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </component>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.b-radio-group--block > * {
  flex: 1;
}
</style>
