<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  type StyleValue,
  watch,
} from 'vue';
import BImagePickerCloseButton from './BImagePickerCloseButton.vue';
import { lockScrollBody, unlockScrollBody } from '@/helpers/ComponentHelper';
import BOverlay from '../BOverlay.vue';

/**
 * Props
 */
export interface Props {
  modelValue: boolean;
  url: string;
}
const props = withDefaults(defineProps<Props>(), {});

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
watch(value, (val: boolean) => {
  if (val) {
    lockScrollBody();
  } else {
    unlockScrollBody();
  }
});

/**
 * Methods
 */
const closePreview = () => {
  value.value = false;
};
const closeOnEscapePressed = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePreview();
  }
};

/**
 * Lifecycle hooks
 */
onMounted(() => {
  document.addEventListener('keydown', closeOnEscapePressed);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', closeOnEscapePressed);
});
</script>

<template>
  <Transition name="fade">
    <BOverlay v-if="value">
      <BImagePickerCloseButton
        class="ds-right-4 ds-top-4 ds-h-8 ds-w-8"
        @click="closePreview"
      />
      <div
        :style="
          {
            backgroundImage: `url('${props.url}')`,
            height: 'calc(100vh - 16px)',
            width: 'calc(100vw - 16px)',
          } as StyleValue
        "
        class="ds-bg-contain ds-bg-center ds-bg-no-repeat"
      />
    </BOverlay>
  </Transition>
</template>
