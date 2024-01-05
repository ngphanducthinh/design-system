<script lang="ts" setup>
import { BModalSize } from '@/constants/Enums';
import { lockScrollBody, unlockScrollBody } from '@/helpers/ComponentHelper';
import { computed, onBeforeUnmount, watch } from 'vue';
import BModalContainer from './BModalContainer.vue';

//#region Props
export interface BModalProps {
  modelValue: boolean;
  /**
   * Modal size.
   */
  size?: BModalSize;
  /**
   * Fullscreen modal.
   */
  fullscreen?: boolean;
  /**
   * Prevent modal from closing when clicking outside or pressing "Esc".
   */
  persistent?: boolean;
}

const props = withDefaults(defineProps<BModalProps>(), {
  size: BModalSize.Medium,
  fullscreen: false,
  persistent: false,
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

//#region Data
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    emit('update:modelValue', val);
  },
});
//#endregion

//#region Watchers
watch(
  value,
  (val) => {
    if (val) {
      lockScrollBody();
    } else {
      unlockScrollBody();
    }
  },
  { immediate: true },
);
//#endregion

//#region Lifecycle Hooks
onBeforeUnmount(() => {
  unlockScrollBody();
});
//#endregion
</script>

<script lang="ts">
/**
 * [Vue warn]: Extraneous non-props attributes (class) were passed to component but could not be automatically inherited because component renders fragment or text root nodes
 */
export default {
  // https://vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
  inheritAttrs: false,
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="ds-transition-all ds-ease-in-out"
      enter-from-class="ds-opacity-0"
      enter-to-class="ds-opacity-1"
      leave-active-class="ds-transition-all ds-ease-in-out"
      leave-from-class="ds-opacity-1"
      leave-to-class="ds-opacity-0"
    >
      <BModalContainer
        v-if="value"
        :class="$attrs.class"
        :fullscreen="props.fullscreen"
        :persistent="props.persistent"
        :size="props.size"
        @close="value = false"
      >
        <slot />
      </BModalContainer>
    </Transition>
  </Teleport>
</template>
