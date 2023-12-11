<script lang="ts" setup>
import { BModalSize } from '@/constants/Enums';
import { lockScrollBody, unlockScrollBody } from '@/helpers/ComponentHelper';
import { computed, onBeforeUnmount, watch } from 'vue';
import BModalContainer from './BModalContainer.vue';

/**
 * Props
 */
export interface BModalProps {
  modelValue: boolean;
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

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

/**
 * Data
 */
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    emit('update:modelValue', val);
  },
});

/**
 * Watch
 */
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

/**
 * Lifecycle hooks
 */
onBeforeUnmount(() => {
  unlockScrollBody();
});
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
