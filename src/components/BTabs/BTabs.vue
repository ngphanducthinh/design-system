<script setup lang="ts">
import { PIKey } from '@/constants';
import type { BTabData } from '@/types';
import { computed, getCurrentInstance, nextTick, provide, ref } from 'vue';

const model = defineModel<number>();

const internalModel = ref(0);
const combinedModel = computed({
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

const tabList = ref<BTabData[]>([]);

provide(PIKey.BTabs, tabList);

const init = async () => {
  // Once all children mounted, collapseList has all those components' data
  await nextTick();
  //
  if (combinedModel.value >= 0 && tabList.value.length > 0) {
    tabList.value[combinedModel.value].isActive = true;
  }
};
init();
</script>

<template>
  <div></div>
</template>
