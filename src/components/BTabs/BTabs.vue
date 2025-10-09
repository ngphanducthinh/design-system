<script setup lang="ts">
import { PIKey } from '@/constants';
import type { BTabData } from '@/types';
import { computed, getCurrentInstance, nextTick, provide, ref, watch } from 'vue';

const model = defineModel<number>();

const internalModel = ref(0);
const uModel = computed({
  get() {
    return model.value !== undefined ? model.value : internalModel.value;
  },
  set(val: number) {
    if (model.value !== undefined) {
      model.value = val;
    } else {
      internalModel.value = val;
    }
  },
});

const instance = getCurrentInstance();
console.log(instance?.uid);

const tabToggleList = ref<BTabData[]>([]);
const tabContentList = ref<BTabData[]>([]);

provide(PIKey.BTabToggleGroup, tabToggleList);
provide(PIKey.BTabContentGroup, tabContentList);

const init = async () => {
  // Once all children mounted, collapseList has all those components' data
  await nextTick();
  //
  if (uModel.value >= 0 && tabToggleList.value.length > 0) {
    tabToggleList.value[uModel.value].isActive = true;
  }
};
init();

watch(tabToggleList, () => {
  const activeTabIndex = tabToggleList.value.findIndex((tab) => tab.isActive === true);

  if (activeTabIndex !== -1 && activeTabIndex !== uModel.value) {
    uModel.value = activeTabIndex;
  }
});
watch(model, () => {
  const activeTabIndex = tabToggleList.value.findIndex((tab) => tab.isActive === true);

  if (activeTabIndex !== -1 && activeTabIndex !== uModel.value) {
    tabToggleList.value.forEach((tab, index) => {
      tab.isActive = index === uModel.value;
    });
  }
});
</script>

<template>
  <div>
    <slot />
  </div>
</template>
