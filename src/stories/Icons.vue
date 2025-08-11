<script setup lang="ts">
import { BInput, BPagination } from '@/components';
import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSize, BIconVariant } from '@/types.ts';
import { debounce } from 'lodash-es';
import { ref } from 'vue';

const searchText = ref('');
const size = ref<BIconSize>(BIconSize.XLarge);
const variant = ref<BIconVariant>(BIconVariant.Regular);
const iconNames = Object.values(BIconName);
const icons = ref<any[]>([]);
const page = ref(1);
const pageSize = 180;
const totalIcons = ref(iconNames.length);

const searchDebounced = debounce(() => {
  resetPageAndSearch();
}, 500);
const resetPageAndSearch = () => {
  page.value = 1; // Reset to first page on new search
  search();
};
const search = () => {
  const filteredIcons = iconNames.reduce((acc, name) => {
    if (name.toLowerCase().includes(searchText.value.toLowerCase())) {
      acc.push({
        name,
      });
    }
    return acc;
  }, [] as any[]);
  totalIcons.value = filteredIcons.length;
  icons.value = filteredIcons.slice((page.value - 1) * pageSize, page.value * pageSize);
};

search();
</script>

<template>
  <div class="b:grid b:grid-cols-1 b:gap-y-8">
    <div class="b:flex b:flex-wrap b:gap-4">
      <BInput v-model="searchText" placeholder="Search..." @update:model-value="searchDebounced" />

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

    <div class="icons b:grid b:gap-x-14 b:gap-y-10">
      <template v-for="icon in icons">
        <KeepAlive>
          <div class="b:flex b:flex-wrap b:justify-center">
            <BIcon
              :key="icon.name"
              :icon="icon.name"
              :size="size"
              :variant="variant"
              :color="icon.color"
              :width="icon.width"
              :height="icon.height"
            />
            <div class="b:mt-2 b:line-clamp-2 b:h-8 b:w-full b:text-center b:text-xs">
              {{ icon.name }}
            </div>
          </div>
        </KeepAlive>
      </template>
    </div>

    <div class="b:flex b:w-full b:justify-center">
      <BPagination v-model="page" :page-size="pageSize" :total="totalIcons" @change="search" />
    </div>
  </div>
</template>

<style scoped>
.icons {
  grid-template-columns: repeat(auto-fit, minmax(min(5rem, 100%), 1fr));
}
</style>
