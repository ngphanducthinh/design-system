<script setup lang="ts">
import { PIKey } from '@/constants';
import type { BCollapseData } from '@/types.ts';
import { getCurrentInstance, nextTick, provide, ref } from 'vue';

//#region Props
const model = defineModel<number>({ default: 0 });
//#endregion

const instance = getCurrentInstance();
console.log(instance?.uid);

const collapseList = ref<BCollapseData[]>([]);

provide(PIKey.BCollapseGroup, collapseList);

const init = async () => {
  // Once all children mounted, collapseList has all those components' data
  await nextTick();
  //
  if (model.value >= 0 && collapseList.value.length > 0) {
    collapseList.value[model.value].isOpen = true;
  }
};
init();
</script>

<template>
  <div>
    <slot />
  </div>
</template>
