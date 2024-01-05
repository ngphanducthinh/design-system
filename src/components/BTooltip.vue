<script lang="ts" setup>
import { BTooltipOpenEvent, BTooltipPosition } from '@/constants/Enums';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

//#region Props
export interface BTooltipProps {
  modelValue?: boolean;
  /**
   * Position of opened tooltip compare to its toggle.
   */
  position?: `${BTooltipPosition}`;
  /**
   * Event to open tooltip.
   */
  openEvent?: `${BTooltipOpenEvent}`;
}

const props = withDefaults(defineProps<BTooltipProps>(), {
  modelValue: false,
  position: BTooltipPosition.Top,
  openEvent: BTooltipOpenEvent.Hover,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: boolean): void;
}>();
//#endregion

//region Data
const toggleRef = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
const mValue = ref(false);
const value = computed({
  get() {
    return props.modelValue !== undefined ? props.modelValue : mValue.value;
  },
  set(val: boolean) {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      mValue.value = val;
    }
  },
});
//endregion

//region Watchers
watch(
  () => props.position,
  () => {
    resetContentPosition();
    ensureContentPosition();
  },
);
watch(
  () => props.openEvent,
  () => {
    clearEventListeners();
    ensureEventListeners();
  },
);
//#endregion

//region Methods
const onClick = () => {
  value.value = !value.value;
};
const onFocus = () => {
  value.value = true;
};
const onFocusOut = () => {
  value.value = false;
};
const onHover = () => {
  value.value = true;
};
const onHoverOut = () => {
  value.value = false;
};
const resetContentPosition = () => {
  if (!contentRef.value) {
    return;
  }
  contentRef.value.style.top = '';
  contentRef.value.style.right = '';
  contentRef.value.style.bottom = '';
  contentRef.value.style.left = '';
};
const ensureContentPosition = () => {
  if (!contentRef.value) {
    return;
  }

  switch (props.position) {
    case BTooltipPosition.Bottom:
      contentRef.value.style.top = '4px';
      break;
    case BTooltipPosition.Top:
    default:
      contentRef.value.style.bottom = '24px';
      break;
  }
};
const ensureEventListeners = () => {
  switch (props.openEvent) {
    case BTooltipOpenEvent.Click:
      toggleRef.value?.addEventListener('click', onClick);
      break;
    case BTooltipOpenEvent.Focus:
      toggleRef.value?.addEventListener('focus', onFocus);
      toggleRef.value?.addEventListener('focusout', onFocusOut);
      break;
    case BTooltipOpenEvent.Hover:
    default:
      toggleRef.value?.addEventListener('mouseover', onHover);
      toggleRef.value?.addEventListener('mouseleave', onHoverOut);
      break;
  }
};
const clearEventListeners = () => {
  toggleRef.value?.removeEventListener('click', onClick);
  toggleRef.value?.removeEventListener('focus', onFocus);
  toggleRef.value?.removeEventListener('mouseover', onHover);
  toggleRef.value?.removeEventListener('mouseleave', onHoverOut);
};
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  ensureEventListeners();
  ensureContentPosition();
});
onBeforeUnmount(() => {
  clearEventListeners();
});
//#endregion
</script>

<template>
  <div ref="toggleRef" class="ds-inline">
    <slot name="toggle"></slot>
  </div>

  <div v-show="value" class="ds-relative">
    <div
      ref="contentRef"
      class="ds-absolute ds-z-10 ds-inline-block ds-rounded-lg ds-bg-black/[0.65] ds-px-3 ds-py-2 ds-text-sm ds-font-medium ds-text-white ds-shadow-sm ds-transition-opacity ds-duration-300"
    >
      <slot></slot>
      <div class="tooltip-arrow" data-popper-arrow></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tooltip-arrow {
  position: absolute;
  left: 0;
  transform: translate3d(59.5px, 0px, 0px);
}
</style>
