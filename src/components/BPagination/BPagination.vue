<script setup lang="ts">
import { BIcon } from '@/components';
import { BPaginationSize } from '@/types.ts';
import { computed } from 'vue';

const {
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  total,
  size = BPaginationSize.Medium,
} = defineProps<{
  pageSize?: number;
  pageSizeOptions?: number[];
  total: number;
  size?: `${BPaginationSize}`;
}>();

/**
 * Size of the pagination component.
 * https://vuejs.org/api/sfc-script-setup.html#usage-with-typescript
 */
const model = defineModel<number>({ required: true });

const totalPages = computed(() => {
  if (!total || !pageSize) {
    return 0;
  }
  return Math.ceil(total / pageSize);
});
const EllipsisText = '...';

const emit = defineEmits<{
  /**
   * Value is changed, param: <code>value: number</code>
   * @param e
   * @param value
   */
  change: [value: number];
}>();

const clickPage = (page: number) => {
  model.value = page;
  // Emitted when page changes via user interaction
  emit('change', model.value);
};
const clickPrevious = () => {
  if (model.value > 1) {
    model.value--;
    emit('change', model.value);
  }
};
const clickNext = () => {
  if (model.value < totalPages.value) {
    model.value++;
    emit('change', model.value);
  }
};
</script>

<template>
  <nav>
    <ul class="b:inline-flex b:gap-x-1">
      <li
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        tabindex="0"
        @click="clickPrevious"
        @keydown.enter="clickPrevious"
      >
        <BIcon icon="chevron-left" />
      </li>

      <!--First-->
      <li
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        :class="[
          {
            'b:bg-primary b:text-white': model === 1,
          },
        ]"
        tabindex="0"
        @click="clickPage(1)"
        @keydown.enter="clickPage(1)"
      >
        <a> {{ '1' }}</a>
      </li>
      <!---->
      <li v-show="model > 3">
        <a> {{ EllipsisText }} </a>
      </li>

      <li
        v-show="model > 2"
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        tabindex="0"
        @click="clickPage(model - 1)"
        @keydown.enter="clickPage(model - 1)"
      >
        <a>
          {{ model - 1 }}
        </a>
      </li>
      <!--Active item-->
      <li
        v-show="model !== 1 && model !== totalPages"
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:bg-white b:px-1.5 b:text-primary b:ring b:ring-primary b:select-none b:hover:text-primary-hover b:hover:ring-primary-hover"
        tabindex="0"
        @click="clickPage(model)"
        @keydown.enter="clickPage(model)"
      >
        <a>
          {{ model }}
        </a>
      </li>
      <!---->
      <li
        v-show="model < totalPages - 1"
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        tabindex="0"
        @click="clickPage(model + 1)"
        @keydown.enter="clickPage(model + 1)"
      >
        <a>
          {{ model + 1 }}
        </a>
      </li>

      <li v-show="model < totalPages - 2">
        <a> {{ EllipsisText }} </a>
      </li>
      <!--Last-->
      <li
        v-show="totalPages > 1"
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        :class="[
          {
            'b:bg-primary b:text-white': model === totalPages,
          },
        ]"
        tabindex="0"
        @click="clickPage(totalPages)"
        @keydown.enter="clickPage(totalPages)"
      >
        <a>
          {{ totalPages }}
        </a>
      </li>
      <!---->

      <li
        class="b:flex b:h-8 b:min-w-8 b:cursor-pointer b:items-center b:justify-center b:rounded-lg b:px-1.5 b:transition-all b:duration-200 b:select-none b:hover:not-disabled:bg-secondary"
        tabindex="0"
        @click="clickNext"
        @keydown.enter="clickNext"
      >
        <BIcon icon="chevron-right" />
      </li>
    </ul>
  </nav>
</template>
