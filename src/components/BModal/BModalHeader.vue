<script setup lang="ts">
import { BButton } from '@/components';
import { getCurrentInstance } from 'vue';

const { title } = defineProps<{
  title?: string;
}>();

const instance = getCurrentInstance();

const close = () => {
  instance?.parent?.emit('update:modelValue', false);
};
</script>

<template>
  <div class="b:mb-2 b:flex b:items-center b:bg-white">
    <slot name="title">
      <h2 class="b:flex-auto b:font-semibold">
        {{ title }}
      </h2>
    </slot>
    <slot name="icon">
      <BButton
        variant="text"
        color="secondary"
        prepend-icon="xmark"
        prepend-icon-size="md"
        autofocus
        @click="close"
      />
    </slot>
  </div>
</template>
