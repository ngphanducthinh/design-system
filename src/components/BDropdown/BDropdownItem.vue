<script lang="ts" setup>
import { inject } from 'vue';
import { PIKey } from '@/constants/Common';

/**
 * Props
 */
export interface Props {
  closeOnClick?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  closeOnClick: false,
});
const closeDropdown = inject(PIKey.CloseDropdown);

const onClick = () => {
  if (props.closeOnClick && closeDropdown) {
    closeDropdown();
  }
};
</script>

<template>
  <li
    class="ds-cursor-pointer ds-px-3 ds-py-2 ds-text-sm ds-text-gray-700 hover:ds-bg-slate-100"
    @click="onClick"
  >
    <slot></slot>
  </li>
</template>
