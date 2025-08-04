<template>
  <header></header>

  <main class="b:grid b:grid-cols-1 b:gap-4 b:p-8">
    <BInput placeholder="Placeholder..." size="sm" />
    <BInput placeholder="Placeholder..." />
    <BInput placeholder="Placeholder..." size="lg" />

    <BInput placeholder="Placeholder..." variant="filled" />
    <BInput placeholder="Placeholder..." variant="borderless" />
    <BInput placeholder="Placeholder..." variant="underlined" />

    <BButton> Click Me </BButton>
  </main>

  <footer></footer>
</template>
<script setup lang="ts">
import { BButton } from '@/components';
import BInput from '@/components/BInput/BInput.vue';
</script>
