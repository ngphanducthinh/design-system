<script setup lang="ts">
import { defineAsyncComponent, shallowRef } from 'vue';

/**
 * Data
 */
const PlaygroundViewPath = `./playground/PlaygroundView.vue`;
const PlaygroundView = shallowRef(
  defineAsyncComponent(() => import(/* @vite-ignore */ PlaygroundViewPath)),
);

/**
 *
 */
</script>

<template>
  <main class="ds-mt-8">
    <div class="ds-container ds-mx-auto">
      <PlaygroundView />
    </div>
  </main>
</template>
