<script lang="ts" setup>
import { BModalSize } from '@/constants/Enums';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BOverlay from '../BOverlay.vue';

//#region Props
export interface Props {
  size?: BModalSize;
  fullscreen?: boolean;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: BModalSize.Medium,
  fullscreen: false,
  persistent: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  (e: 'close'): void;
}>();
//#endregion

//#region Data
const modalWrapperContentRef = ref<HTMLDivElement | null>(null);
const modalWrapperCssClass = computed(() => {
  let result = `ds-relative ds-w-full ds-h-auto ds-m-auto ds-flex ds-items-center `;

  if (props.fullscreen) {
    result += `ds-w-screen ds-h-screen `;
  } else {
    result += `ds-p-4 `;
    switch (props.size) {
      case BModalSize.Small:
        result += `ds-max-w-md `;
        break;
      case BModalSize.Large:
        result += `ds-max-w-4xl `;
        break;
      case BModalSize.Medium:
      default:
        result += `ds-max-w-2xl `;
        break;
    }
  }

  return result;
});
const modalWrapperContentCssClass = computed(() => {
  let result = `ds-relative ds-bg-white ds-rounded-lg ds-shadow `;
  result += props.fullscreen ? `ds-w-screen ds-h-screen ds-rounded-none ` : ``;

  return result;
});
//#endregion

//#region Methods
const initPressEscapeEventListener = () => {
  document.addEventListener('keydown', closeOnEscapePressed);
};
const closeOnEscapePressed = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};
const initClickOutsideEventListener = () => {
  document.addEventListener('click', closeOnClickOutside);
};
const closeOnClickOutside = (event: any) => {
  const refs = [modalWrapperContentRef.value];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    emit('close');
  }
};
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  if (!props.persistent) {
    setTimeout(() => {
      initPressEscapeEventListener();
      initClickOutsideEventListener();
    }, 200);
  }
});
onBeforeUnmount(() => {
  if (!props.persistent) {
    document.removeEventListener('keydown', closeOnEscapePressed);
    document.removeEventListener('click', closeOnClickOutside);
  }
});
//#endregion
</script>

<template>
  <BOverlay>
    <div :class="modalWrapperCssClass" class="modal-wrapper">
      <!--Modal-->
      <div
        ref="modalWrapperContentRef"
        :class="modalWrapperContentCssClass"
        class="modal-wrapper-content ds-w-full"
      >
        <slot />
      </div>
      <!---->
    </div>
  </BOverlay>
</template>
