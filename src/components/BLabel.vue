<script lang="ts" setup>
import { RequiredSymbol } from '@/constants/Common';

//#region Props
export interface BLabelProps {
  id?: string;
  label?: string;
  /**
   * Show "*" beside the label
   */
  required?: boolean;
}

const props = withDefaults(defineProps<BLabelProps>(), {
  id: '',
  label: '',
  required: false,
});
//#endregion
</script>

<template>
  <label
    v-if="props.label || $slots.default"
    :for="id"
    class="ds-block ds-pb-2 ds-text-xs ds-font-bold ds-text-gray-500"
  >
    <span>
      <slot>
        {{ props.label }}
      </slot>
    </span>
    <span v-if="props.required" class="ds-ml-1 ds-text-red-500">
      {{ RequiredSymbol }}
    </span>
  </label>
</template>
