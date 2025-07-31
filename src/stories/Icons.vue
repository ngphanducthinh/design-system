<script setup lang="ts">
import { BPagination } from '@/components';
import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSize, BIconVariant } from '@/types.ts';
import { debounce } from 'lodash-es';
import { computed, ref } from 'vue';

const searchText = ref('');
const size = ref<BIconSize>(BIconSize.XLarge);
const variant = ref<BIconVariant>(BIconVariant.Regular);
const iconNames = Object.values(BIconName);
const icons = ref<any[]>([]);
const page = ref(1);
const pageSize = 180;
const totalIcons = computed(() => icons.length);

const searchDebounced = debounce(() => {
  search();
}, 500);
const search = () => {
  icons.value = iconNames
    .reduce((acc, name) => {
      if (name.toLowerCase().includes(searchText.value.toLowerCase())) {
        acc.push({
          name,
        });
      }
      return acc;
    }, [] as any[])
    .slice((page.value - 1) * pageSize, page.value * pageSize);
};

search();
</script>

<template>
  <div class="b:grid b:grid-cols-1 b:gap-y-8">
    <div class="b:flex b:flex-wrap b:gap-4">
      <input type="text" v-model="searchText" @input="searchDebounced" />

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

    <div class="icons b:grid b:gap-x-14 b:gap-y-10">
      <template v-for="icon in icons">
        <KeepAlive>
          <div>
            <BIcon
              :key="icon.name"
              :icon="icon.name"
              :size="size"
              :variant="variant"
              :color="icon.color"
              :width="icon.width"
              :height="icon.height"
            />
            <p class="b:mt-2 b:text-center b:text-xs">{{ icon.name }}</p>
          </div>
        </KeepAlive>
      </template>
    </div>

    <BPagination v-model="page" :page-size="pageSize" :total="totalIcons" @change="search" />
  </div>
</template>

<style scoped>
.icons {
  grid-template-columns: repeat(auto-fit, minmax(min(24px, 100%), 1fr));
}
</style>
