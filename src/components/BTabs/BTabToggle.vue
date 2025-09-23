<script setup lang="ts">
import { PIKey } from '@/constants';
import { getCurrentInstance, inject } from 'vue';

const tabList = inject(PIKey.BTabs)!;
const instance = getCurrentInstance();

if (tabList.value) {
  tabList.value.push({ id: instance?.uid!, isActive: false });
}
</script>

<template>
  <div></div>
</template>
