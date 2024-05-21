<script lang="ts" setup>
import { computed, getCurrentInstance, inject, type Ref } from 'vue';

const instance = getCurrentInstance();
const tabs = inject<Ref<Record<string, boolean>> | null>(
  `tabs-${instance?.parent?.uid}`,
  null,
);
const active = computed(() => tabs && tabs.value[`tab-${instance?.uid}`]);

const init = () => {
  if (tabs) {
    tabs.value[`tab-${instance?.uid}`] = false;
  }
};
init();
</script>

<template>
  <div :class="{ active }" class="tab">
    <slot></slot>
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
