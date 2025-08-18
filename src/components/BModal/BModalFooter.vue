<script setup lang="ts">
import { BButton } from '@/components';

const { cancelText = 'Cancel', okText = 'OK' } = defineProps<{
  /**
   * Text to display on the cancel button.
   */
  cancelText?: string;
  /**
   * If true, the cancel button will not be displayed.
   */
  hideCancel?: boolean;
  /**
   * Text to display on the OK button.
   */
  okText?: string;
  /**
   * If true, the OK button will not be displayed.
   */
  hideOk?: boolean;
}>();

const emit = defineEmits<{
  /**
   * Emitted when the cancel button is clicked.
   */
  cancel: [];
  /**
   * Emitted when the OK button is clicked.
   */
  ok: [];
}>();
</script>

<template>
  <div class="b:mt-2 b:flex b:items-center b:bg-white">
    <slot name="left">
      <div class="b:flex-auto"></div>
    </slot>

    <slot name="right">
      <div class="b:flex b:flex-initial b:gap-x-2">
        <BButton
          v-if="!hideCancel"
          variant="outlined"
          color="secondary"
          autofocus
          @click="emit('cancel')"
        >
          {{ cancelText }}
        </BButton>
        <BButton v-if="!hideOk" @click="emit('ok')">
          {{ okText }}
        </BButton>
      </div>
    </slot>
  </div>
</template>
