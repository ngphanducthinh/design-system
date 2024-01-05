<script lang="ts" setup>
import { inject } from 'vue';
import { PIKey } from '@/constants/Common';

//#region Props
export interface Props {
  closeOnClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnClick: false,
});
//#endregion

//#region Data
const closeDropdown = inject(PIKey.CloseDropdown);
//#endregion

//#region Methods
const onClick = () => {
  if (props.closeOnClick && closeDropdown) {
    closeDropdown();
  }
};
//#endregion
</script>

<template>
  <li
    class="ds-cursor-pointer ds-px-3 ds-py-2 ds-text-sm ds-text-gray-700 hover:ds-bg-slate-100"
    @click="onClick"
  >
    <slot></slot>
  </li>
</template>
