<script setup lang="ts">
import { PIKey } from '@/constants';
import { getCurrentInstance, provide } from 'vue';

const instance = getCurrentInstance();
console.log(instance?.uid);

const collapseList = {};

provide(PIKey.BCollapseGroup, collapseList);
</script>

<template>
  <div>
    <slot />
  </div>
</template>
