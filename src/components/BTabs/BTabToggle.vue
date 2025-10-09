<script setup lang="ts">
import { PIKey } from '@/constants';
import { computed, getCurrentInstance, inject } from 'vue';

const tabToggleList = inject(PIKey.BTabToggleGroup)!;
const instance = getCurrentInstance();
const uid = instance?.uid || 0;

if (tabToggleList.value) {
  tabToggleList.value.push({ id: uid, isActive: false });
}

const isActive = computed(() => tabToggleList.value.find((i) => i.id === uid)?.isActive);

const setActive = () => {
  tabToggleList.value.forEach((i) => {
    i.isActive = i.id === uid;
  });
};
</script>

<template>
  <div role="tab" :class="[{ 'b:bg-red-500': isActive }]" @click="setActive">
    <slot />
  </div>
</template>
