<template>
  <header></header>

  <main class="b:grid b:grid-cols-1 b:gap-4 b:p-8">
    <BIcon class="mr-4" :icon="BIconName.BellSchoolSlash" color="warning" :rotate="90"></BIcon>

    <BSwitch v-model="switchValue" />

    <div>
      <BBadge text="Wow" color="warning" />
      <BBadge color="warning"> Hello world! </BBadge>
      <div>
        <BBadge text="Wow" color="warning" dot />
      </div>
    </div>

    <BPagination :total="40" v-model="page" showPageSizeSelector size="sm" />
    <BPagination :total="40" v-model="page" showPageSizeSelector />
    <BPagination :total="40" v-model="page" showPageSizeSelector size="lg" />

    <div>
      <BTooltip :tooltip="tooltipContent" placement="bottom-left">
        <span>Hello world!</span>
      </BTooltip>

      <BTooltip tooltip="Tooltip content 02!" placement="bottom-right" trigger="click">
        <span>Tooltip will show on mouse enter.</span>
        <template #tooltip>
          <div class="b:max-w-32">
            {{ 'This is a custom tooltip content with more complex structure.' }}
          </div>
        </template>
      </BTooltip>
    </div>

    <BBreadcrumb
      :items="[
        { text: 'Home' },
        { text: 'Products' },
        { text: 'Product Detail' },
        { text: 'Product Detail - Comments' },
      ]"
    />

    <BTabs>
      <BTabToggleGroup>
        <BTabToggle>Head 1</BTabToggle>
        <BTabToggle>Head 2</BTabToggle>
        <BTabToggle>Head 3</BTabToggle>
      </BTabToggleGroup>
      <BTabContentGroup>
        <BTabContent>Hello world 01!</BTabContent>
        <BTabContent>Hello world 02!</BTabContent>
        <BTabContent>Hello world 03!</BTabContent>
      </BTabContentGroup>
    </BTabs>

    <BProgress :percent="progressValue" />

    <BButton @click="singleCollapse = !singleCollapse"> Toggle </BButton>
    <BCollapse v-model="singleCollapse">
      Requires a computer running an operating system. The computer must have some memory and
      ideally some kind of long-term storage. An input device as well as some form of output device
      is recommended.
    </BCollapse>

    <BCollapseGroup v-model="collapseGroup" class="b:space-y-2">
      <BCollapse header="Hello world">
        Requires a computer running an operating system. The computer must have some memory and
        ideally some kind of long-term storage. An input device as well as some form of output
        device is recommended.
      </BCollapse>

      <BCollapse header="Hello world 2">
        Requires a computer running an operating system. The computer must have some memory and
        ideally some kind of long-term storage. An input device as well as some form of output
        device is recommended.
      </BCollapse>

      <BCollapse header="Hello world 3">
        Requires a computer running an operating system. The computer must have some memory and
        ideally some kind of long-term storage. An input device as well as some form of output
        device is recommended.
      </BCollapse>
    </BCollapseGroup>

    <div style="max-height: 200px; overflow: hidden">
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
import {
  BBadge,
  BBreadcrumb,
  BButton,
  BCollapse,
  BCollapseGroup,
  BIcon,
  BModal,
  BPagination,
  BSelect,
  BSwitch,
  BTabContent,
  BTabContentGroup,
  BTabs,
  BTabToggle,
  BTabToggleGroup,
} from '@/components';
import BModalBody from '@/components/BModal/BModalBody.vue';
import BModalFooter from '@/components/BModal/BModalFooter.vue';
import BModalHeader from '@/components/BModal/BModalHeader.vue';
import BProgress from '@/components/BProgress/BProgress.vue';
import BTooltip from '@/components/BTooltip/BTooltip.vue';

import { BIconName } from '@/components/BIcon/BIconEnum.ts';
import type { BSelectOption } from '@/types.ts';
import { ref } from 'vue';

const page = ref(1);

const modal = ref(false);
const select1 = ref('');
const options: BSelectOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 2 },
];
const singleCollapse = ref(false);

const progressValue = ref(25);
setTimeout(() => {
  progressValue.value = 75;

  setTimeout(() => {
    progressValue.value = 100;
  }, 1000);
}, 1000);

const collapseGroup = ref(2);

const tab = ref(0);
setTimeout(() => {
  tab.value = 1;

  setTimeout(() => {
    tab.value = 2;
  }, 1000);
}, 1000);

const tooltipContent = ref('Tooltip content!');
setTimeout(() => {
  tooltipContent.value = 'Updated tooltip content!';
}, 2000);

const showBadge = ref(true);
setTimeout(() => {
  showBadge.value = false;
  setTimeout(() => {
    showBadge.value = true;
  }, 2000);
}, 2000);

const switchValue = ref(false);
</script>
