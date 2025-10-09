<script setup lang="ts">
import { PIKey } from '@/constants';
import { computed, getCurrentInstance, inject, nextTick, watch } from 'vue';

const tabToggleList = inject(PIKey.BTabToggleGroup)!;
const tabContentList = inject(PIKey.BTabContentGroup)!;
const instance = getCurrentInstance();
const uid = instance?.uid || 0;

if (tabContentList.value) {
  tabContentList.value.push({ id: uid, isActive: false });
}

watch(
  tabToggleList,
  () => {
    const activeTabToggleIndex = tabToggleList.value.findIndex((tab) => tab.isActive);
    tabContentList.value.forEach((tab, index) => {
      tab.isActive = index === activeTabToggleIndex;
    });
  },
  {
    deep: true,
  },
);

const init = async () => {
  // Once all children mounted, BTabs has all those components' data
  await nextTick();

  const activeTabToggleIndex = tabToggleList.value.findIndex((tab) => tab.isActive);
  tabContentList.value[activeTabToggleIndex].isActive = true;
};

init();

const isActive = computed(() => tabContentList.value.find((i) => i.id === uid)?.isActive);
</script>

<template>
  <KeepAlive>
    <div v-if="isActive" role="tabpanel">
      <slot />
    </div>
  </KeepAlive>
</template>
