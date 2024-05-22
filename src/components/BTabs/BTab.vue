<script lang="ts" setup>
import { computed, getCurrentInstance, inject, type Ref, watch } from 'vue';
import type { BTabData } from '@/types';

//#region Props
const props = withDefaults(
  defineProps<{
    /**
     * Title of tab.
     */
    text: string;
    /**
     * If tab is disabled.
     */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);
//#endregion

//#region Watchers
watch(
  () => props.text,
  () => {
    if (tabs) {
      tabs.value[`tab-${instance?.uid}`].text = props.text;
    }
  },
);
watch(
  () => props.disabled,
  () => {
    if (tabs) {
      tabs.value[`tab-${instance?.uid}`].disabled = props.disabled;
    }
  },
);
//#endregion

const instance = getCurrentInstance();
const tabs = inject<Ref<Record<string, BTabData>> | null>(
  `tabs-${instance?.parent?.uid}`,
  null,
);
const active = computed(
  () => tabs && tabs.value[`tab-${instance?.uid}`].active,
);

const init = () => {
  if (tabs) {
    tabs.value[`tab-${instance?.uid}`] = {
      active: false,
      disabled: props.disabled,
      text: props.text,
    };
  }
};
init();
</script>

<template>
  <div :class="{ active }" class="tab">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.tab {
  display: none;
}

.tab.active {
  display: block;
}
</style>
