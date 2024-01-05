<script lang="ts" setup>
import type { ErrorMessageFunction } from '@/types';
import { computed } from 'vue';

//#region Props
export interface BErrorMessageProps {
  /**
   * A text or a function returning a text.
   */
  errorMessage?: string | ErrorMessageFunction;
}

const props = withDefaults(defineProps<BErrorMessageProps>(), {
  errorMessage: '',
});
//#endregion

//#region Data
const message = computed(() =>
  typeof props.errorMessage === 'function'
    ? props.errorMessage()
    : props.errorMessage,
);
//#endregion
</script>

<template>
  <div class="ds-min-h-[1rem]">
    <div v-if="message" class="ds-text-xs ds-text-red-500">
      {{ message }}
    </div>
  </div>
</template>
