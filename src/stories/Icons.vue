<script setup lang="ts">
import { BButton } from '@/components';
import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSize, BIconVariant } from '@/types.ts';
import { ref } from 'vue';

const searchText = ref('');
const size = ref<BIconSize>(BIconSize.Medium);
const variant = ref<BIconVariant>(BIconVariant.Regular);
const iconNames = Object.values(BIconName);
const icons = ref<any[]>([]);

// TODO: Apply pagination and sorting, then remove search button
const search = () => {
  icons.value = iconNames.reduce((acc, name) => {
    if (name.toLowerCase().includes(searchText.value.toLowerCase())) {
      acc.push({
        name,
      });
    }
    return acc;
  }, [] as any[]);
};

search();
</script>

<template>
  <div class="gap-x-2 b:grid b:grid-cols-1">
    <div class="b:flex b:flex-wrap b:gap-4">
      <input type="text" v-model="searchText" />
      <BButton @click="search"> Search </BButton>

      <select v-model="size">
        <option v-for="size in Object.values(BIconSize)" :key="size" :value="size">
          {{ size }}
        </option>
      </select>

      <select v-model="variant">
        <option v-for="variant in Object.values(BIconVariant)" :key="variant" :value="variant">
          {{ variant }}
        </option>
      </select>
    </div>

    <p>Use the icons below to see how they render.</p>

    <div class="icons b:grid b:gap-4">
      <KeepAlive>
        <BIcon
          v-for="icon in icons"
          :key="icon.name"
          :icon="icon.name"
          :size="size"
          :variant="variant"
          :color="icon.color"
          :width="icon.width"
          :height="icon.height"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.icons {
  grid-template-columns: repeat(auto-fit, minmax(min(24px, 100%), 1fr));
}
</style>
