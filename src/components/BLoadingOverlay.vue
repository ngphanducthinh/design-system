<script lang="ts" setup>
import { BLoadingOverlaySpinnerSize } from '@/constants/Enums';
import { computed } from 'vue';
import BOverlay from './BOverlay.vue';

//#region Props
export interface BLoadingOverlayProps {
  loading: boolean;
  absolute?: boolean;
  spinnerSize?: `${BLoadingOverlaySpinnerSize}`;
}

const props = withDefaults(defineProps<BLoadingOverlayProps>(), {
  absolute: false,
  spinnerSize: BLoadingOverlaySpinnerSize.Medium,
});
//#endregion

//#region Data
const overlayCssClass = computed(() => {
  let result = props.absolute ? `ds-absolute ` : `ds-fixed `;
  return result;
});
const spinnerCssClass = computed(() => {
  let result = `spinner `;

  switch (props.spinnerSize) {
    case BLoadingOverlaySpinnerSize.Small:
      result += `ds-w-4 ds-h-4 `;
      break;
    case BLoadingOverlaySpinnerSize.Large:
      result += `ds-w-12 ds-h-12 `;
      break;
    case BLoadingOverlaySpinnerSize.Medium:
    default:
      result += `ds-w-8 ds-h-8 `;
  }

  return result;
});
//#endregion
</script>
<template>
  <Teleport v-if="!props.absolute" to="body">
    <BOverlay v-show="loading" :class="overlayCssClass">
      <div :class="spinnerCssClass"></div>
    </BOverlay>
  </Teleport>
  <template v-else>
    <BOverlay v-show="loading" :class="overlayCssClass">
      <div :class="spinnerCssClass"></div>
    </BOverlay>
  </template>
</template>

<style lang="scss" scoped>
.spinner {
  border: 0.25rem solid theme('colors.gray.200');
  border-radius: 50%;
  border-top: 0.25rem solid theme('colors.primary-t');
  border-right: 0.25rem solid theme('colors.primary-t');
  border-bottom: 0.25rem solid theme('colors.primary-t');
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
