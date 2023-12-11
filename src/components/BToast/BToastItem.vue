<script lang="ts" setup>
import { BToastItemType } from '@/constants/Enums';
import { computed, ref } from 'vue';

/**
 * Props
 */
export interface Props {
  text?: string;
  icon?: string;
  type?: `${BToastItemType}`;
  hideClose?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  text: '',
  icon: '',
  type: BToastItemType.Default,
  hideClose: false,
});

/**
 * Events
 */
const emit = defineEmits<{
  close: [];
}>();

/**
 * Data
 */
const cssClass = computed<string>(() => {
  let result = `ds-flex ds-items-center ds-w-80 ds-px-4 ds-py-5 ds-rounded-lg ds-shadow-2xl `;

  switch (props.type) {
    case BToastItemType.Success:
      result += `ds-bg-[#00a86b] ds-text-white `;
      break;
    case BToastItemType.Error:
      result += `ds-bg-red-600 ds-text-white `;
      break;
    case BToastItemType.Default:
    default:
      result += `ds-bg-white ds-text-primary-t `;
  }

  return result;
});
const defaultIcon = ref<Record<BToastItemType, string>>({
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-exclamation',
  default: '',
});
</script>

<template>
  <div :class="cssClass">
    <div
      v-if="props.icon || defaultIcon[props.type]"
      class="ds-flex ds-flex-initial ds-items-center ds-pr-1"
    >
      <i :class="props.icon || defaultIcon[props.type]" class="ds-text-lg" />
    </div>
    <div class="ds-flex-auto ds-text-sm ds-font-normal" v-html="text" />
    <div
      v-if="!props.hideClose"
      class="ds-flex ds-flex-initial ds-cursor-pointer ds-items-center ds-pl-1"
      @click="emit('close')"
    >
      <i class="fa-solid fa-xmark ds-text-lg"></i>
    </div>
  </div>
</template>
