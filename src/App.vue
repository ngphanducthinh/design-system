<template>
  <header></header>

  <main class="b:grid b:grid-cols-1 b:gap-4 b:p-8">
    <div style="max-height: 200px; overflow: hidden">
      {{ select1 }}
      <BSelect v-model="select1" :options="options" placeholder="Select an option..." />
      <BSelect v-model="select1" :options="options" searchable />

      <BButton>Button</BButton>
    </div>
    <div class="b:h-[100dvh] b:bg-green-300"></div>
  </main>

  <footer></footer>
</template>
<script setup lang="ts">
import { BButton, BSelect } from '@/components';
import type { BSelectOption } from '@/types.ts';
import { ref } from 'vue';

const select1 = ref('');
const options: BSelectOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 2 },
];
</script>
