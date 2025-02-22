<script lang="ts" setup>
import { BToastItemType } from '@/constants/Enums';
import { computed } from 'vue';

//#region Props
export interface Props {
  text?: string;
  message?: string;
  type?: `${BToastItemType}`;
  hideClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  message: '',
  type: BToastItemType.Default,
  hideClose: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Item is closed
   * @param e
   */
  (e: 'close'): void;
}>();
//#endregion

//#region Data
const cssClass = computed<string>(() => {
  let result = `ds-flex ds-items-center ds-w-80 ds-px-4 ds-py-5 ds-rounded-lg ds-shadow-2xl ds-bg-white `;

  switch (props.type) {
    case BToastItemType.Success:
      result += ``;
      break;
    case BToastItemType.Error:
      result += ``;
      break;
    case BToastItemType.Default:
    default:
      result += ``;
  }

  return result;
});
//#endregion
</script>

<template>
  <div :class="cssClass">
    <div
      v-if="BToastItemType.Success === props.type"
      class="ds-flex ds-flex-initial ds-items-center ds-pr-2"
    >
      <svg
        class="ds-h-5 ds-w-5 ds-fill-[#00a86b]"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
        />
      </svg>
    </div>
    <div
      v-else-if="BToastItemType.Error === props.type"
      class="ds-flex ds-flex-initial ds-items-center ds-pr-2"
    >
      <svg
        class="ds-h-5 ds-w-5 ds-fill-red-600"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
        />
      </svg>
    </div>

    <div class="ds-flex ds-flex-auto ds-flex-wrap ds-text-sm">
      <div v-if="text || $slots.text" class="ds-w-full">
        <slot name="text">
          <div class="ds-font-semibold ds-text-black/80" v-html="text" />
        </slot>
      </div>
      <div v-if="message || $slots.message" class="ds-w-full">
        <slot name="message">
          <div class="ds-text-gray-500" v-html="message" />
        </slot>
      </div>
    </div>

    <div
      v-if="!props.hideClose"
      class="ds-flex ds-flex-initial ds-cursor-pointer ds-items-center ds-pl-1"
      @click="emit('close')"
    >
      <svg
        class="ds-h-5 ds-w-5 ds-fill-gray-600"
        viewBox="0 0 384 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
        />
      </svg>
    </div>
  </div>
</template>
