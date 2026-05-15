<script lang="ts" setup>
import { computed, provide, reactive, toRefs } from 'vue';
import BCheckbox from './BCheckbox.vue';
import { B_CHECKBOX_GROUP_KEY, type BCheckboxOption } from './types';

//#region Props
const {
  disabled = false,
  name = '',
  options = undefined,
} = defineProps<{
  /** Disable all checkboxes in the group. */
  disabled?: boolean;
  /** The name property of all child input elements. */
  name?: string;
  /** Shorthand options to render checkboxes from an array. */
  options?: BCheckboxOption[] | string[] | number[];
}>();

/**
 * Array of currently selected values.
 */
const model = defineModel<Array<string | number>>({ default: () => [] });

const emit = defineEmits<{
  change: [checkedValues: Array<string | number>];
}>();
//#endregion

//#region Normalize options
const normalizedOptions = computed<BCheckboxOption[]>(() => {
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
function toggleValue(val: string | number) {
  const current = [...model.value];
  const index = current.indexOf(val);
  if (index === -1) {
    current.push(val);
  } else {
    current.splice(index, 1);
  }
  model.value = current;
  emit('change', current);
}

const props = reactive({ disabled, name });
const { disabled: disabledRef, name: nameRef } = toRefs(props);

provide(B_CHECKBOX_GROUP_KEY, {
  modelValue: computed(() => model.value),
  disabled: disabledRef,
  name: nameRef,
  toggleValue,
});
//#endregion
</script>

<template>
  <div class="b-checkbox-group b:inline-flex b:flex-wrap b:gap-2" role="group">
    <template v-if="normalizedOptions.length > 0">
      <BCheckbox
        v-for="opt in normalizedOptions"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </BCheckbox>
    </template>
    <slot v-else />
  </div>
</template>
