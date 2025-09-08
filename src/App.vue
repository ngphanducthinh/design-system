<template>
  <header></header>

  <main class="b:grid b:grid-cols-1 b:gap-4 b:p-8">
    <div style="max-height: 200px; overflow: hidden">
      <BCollapseGroup>
        <summary @click="value = !value">System Requirements</summary>
        <BCollapse v-model="value">
          Requires a computer running an operating system. The computer must have some memory and
          ideally some kind of long-term storage. An input device as well as some form of output
          device is recommended.
        </BCollapse>
      </BCollapseGroup>

      {{ select1 }}
      <BSelect v-model="select1" :options="options" placeholder="Select an option..." />
      <BSelect v-model="select1" :options="options" searchable />

      <div class="b:flex b:items-center">
        <BButton @click="modal = !modal">Open modal</BButton>
        <BButton prepend-icon="xmark"></BButton>
        <BButton prepend-icon="xmark" />
      </div>

      <BModal v-model="modal" class="b:w-[400px]">
        <BModalHeader title="My modal title"></BModalHeader>
        <BModalBody>
          {{ 'This is a modal body.' }}
        </BModalBody>
        <BModalFooter></BModalFooter>
      </BModal>
    </div>
    <div class="b:h-[100dvh] b:bg-green-300"></div>
  </main>

  <footer></footer>
</template>
<script setup lang="ts">
import { BButton, BCollapse, BCollapseGroup, BModal, BSelect } from '@/components';
import BModalBody from '@/components/BModal/BModalBody.vue';
import BModalFooter from '@/components/BModal/BModalFooter.vue';
import BModalHeader from '@/components/BModal/BModalHeader.vue';
import type { BSelectOption } from '@/types.ts';
import { ref } from 'vue';

const modal = ref(false);
const select1 = ref('');
const options: BSelectOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 2 },
];

const value = ref(false);
const markerContentColor = 'red';
const markerContent = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" fill="${markerContentColor}"/></svg>')`;

const toggle = () => {
  value.value = !value.value;
};
</script>

<style scoped>
summary::marker {
  content: '';
}

summary::before {
  content: v-bind('markerContent');
  display: inline-block;
  margin-right: 0.5rem;
  transition: transform 0.2s ease-in-out;
}

details:open > summary::before {
  transform: rotate(90deg);
}
</style>
