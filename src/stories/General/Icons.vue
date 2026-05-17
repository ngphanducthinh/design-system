<script setup lang="ts">
import { BInput, BPagination, BSelect } from '@/components';
import { BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSize, BIconVariant } from '@/types.ts';
import { debounce } from 'lodash-es';
import { ref, watch } from 'vue';
import BIcon from '../../components/BIcon/BIcon.vue';

const searchText = ref('');
const size = ref<BIconSize>(BIconSize.Large);
const variant = ref<BIconVariant>(BIconVariant.Regular);
const iconNames = Object.values(BIconName);
const icons = ref<{ name: string }[]>([]);
const page = ref(1);
const pageSize = 180;
const totalIcons = ref(iconNames.length);

const copiedIcon = ref<string | null>(null);
const copyIconName = async (name: string) => {
  try {
    await navigator.clipboard.writeText(name);
    copiedIcon.value = name;
    setTimeout(() => {
      if (copiedIcon.value === name) copiedIcon.value = null;
    }, 1500);
  } catch {}
};

const searchDebounced = debounce(() => {
  page.value = 1;
  search();
}, 300);

const search = () => {
  const filtered = iconNames.filter((name) =>
    name.toLowerCase().includes(searchText.value.toLowerCase()),
  );
  totalIcons.value = filtered.length;
  icons.value = filtered
    .slice((page.value - 1) * pageSize, page.value * pageSize)
    .map((name) => ({ name }));
};

watch([size, variant], search);
search();

const variantOptions = Object.values(BIconVariant).map((v) => ({ label: v, value: v }));
const sizeOptions = Object.values(BIconSize).map((s) => ({ label: s, value: s }));
</script>

<template>
  <div class="b:grid b:grid-cols-1 b:gap-y-6">
    <!-- ── Controls bar ───────────────────────────────────── -->
    <div
      class="b:flex b:flex-wrap b:items-end b:gap-4 b:rounded-xl b:border b:border-gray-200 b:bg-gray-50 b:px-4 b:py-3"
    >
      <div class="b:flex b:min-w-56 b:flex-1 b:flex-col b:gap-1">
        <label class="b:text-xs b:font-medium b:tracking-wide b:text-gray-500 b:uppercase"
          >Search</label
        >
        <BInput
          v-model="searchText"
          placeholder="e.g. arrow, home, star…"
          @update:model-value="searchDebounced"
        />
      </div>

      <div class="b:flex b:flex-col b:gap-1">
        <label class="b:text-xs b:font-medium b:tracking-wide b:text-gray-500 b:uppercase"
          >Variant</label
        >
        <BSelect v-model="variant" :options="variantOptions" />
      </div>

      <div class="b:flex b:flex-col b:gap-1">
        <label class="b:text-xs b:font-medium b:tracking-wide b:text-gray-500 b:uppercase"
          >Size</label
        >
        <BSelect v-model="size" :options="sizeOptions" />
      </div>

      <div class="b:ml-auto b:self-end b:pb-0.5 b:text-right">
        <span class="b:text-sm b:font-semibold b:text-gray-700">{{
          totalIcons.toLocaleString()
        }}</span>
        <span class="b:ml-1 b:text-sm b:text-gray-400">icon{{ totalIcons === 1 ? '' : 's' }}</span>
        <template v-if="searchText">
          <br /><span class="b:text-xs b:text-gray-400"
            >matching "<em>{{ searchText }}</em
            >"</span
          >
        </template>
      </div>
    </div>

    <!-- ── Icon grid ──────────────────────────────────────── -->
    <div v-if="icons.length" class="icon-grid">
      <button
        v-for="icon in icons"
        :key="icon.name"
        class="icon-cell b:group b:relative b:flex b:cursor-pointer b:flex-col b:items-center b:justify-center b:gap-2 b:rounded-xl b:border b:bg-white b:px-2 b:py-4 b:transition-all b:duration-150"
        :class="
          copiedIcon === icon.name
            ? 'b:border-primary b:bg-primary/5'
            : 'b:border-transparent b:hover:border-primary/40 b:hover:shadow-sm'
        "
        :title="`Click to copy: ${icon.name}`"
        @click="copyIconName(icon.name)"
      >
        <Transition name="fade">
          <div
            v-if="copiedIcon === icon.name"
            class="b:absolute b:inset-0 b:z-10 b:flex b:items-center b:justify-center b:rounded-xl"
          >
            <span class="b:text-xs b:font-bold b:text-primary">Copied!</span>
          </div>
        </Transition>

        <div
          :class="
            copiedIcon === icon.name
              ? 'b:opacity-20'
              : 'b:transition-transform b:duration-150 b:group-hover:scale-110'
          "
        >
          <BIcon :icon="icon.name as any" :size="size" :variant="variant" />
        </div>

        <span
          class="b:line-clamp-2 b:h-8 b:w-full b:text-center b:text-xs b:leading-tight b:text-gray-400 b:transition-colors b:group-hover:text-primary"
        >
          {{ icon.name }}
        </span>
      </button>
    </div>

    <!-- ── Empty state ────────────────────────────────────── -->
    <div v-else class="b:flex b:flex-col b:items-center b:gap-3 b:py-20 b:text-gray-400">
      <BIcon icon="magnifying-glass" :size="BIconSize.XXLarge" />
      <p class="b:m-0 b:text-base">No icons found for "{{ searchText }}"</p>
      <button
        class="b:cursor-pointer b:border-none b:bg-transparent b:text-sm b:text-primary b:underline"
        @click="
          searchText = '';
          page = 1;
          search();
        "
      >
        Clear search
      </button>
    </div>

    <!-- ── Pagination ─────────────────────────────────────── -->
    <div v-if="totalIcons > pageSize" class="b:flex b:w-full b:justify-center">
      <BPagination v-model="page" :page-size="pageSize" :total="totalIcons" @change="search" />
    </div>
  </div>
</template>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(7rem, 100%), 1fr));
  gap: 0.5rem;
}

.icon-cell {
  background: none;
  font-family: inherit;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
