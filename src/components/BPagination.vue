<script lang="ts" setup>
import { BPaginationSize } from '@/constants/Enums';
import { computed } from 'vue';

/**
 * Props
 */
export interface BPaginationProps {
  /**
   * Start by 1.
   */
  modelValue: number;
  numberOfPages: number;
  /**
   * Bordered buttons.
   */
  border?: boolean;
  /**
   * Transparent background buttons.
   */
  transparent?: boolean;
  size?: `${BPaginationSize}`;
}
const props = withDefaults(defineProps<BPaginationProps>(), {
  border: false,
  transparent: false,
  size: BPaginationSize.Medium,
});

/**
 * Events
 */
const emit = defineEmits<{
  change: [value: number];
  'update:modelValue': [value: number];
}>();

/**
 * Data
 */
const First = 1;
const EllipsisText = '...';
const value = computed({
  get() {
    return props.modelValue + 1;
  },
  set(val: number) {
    emit('update:modelValue', val - 1);
  },
});
const paginationItemClass = computed(() => {
  let result = `
  ds-flex ds-items-center ds-justify-center
  ds-rounded-lg `;

  if (props.border) {
    result += 'ds-border ds-border-gray-300 ';
  }

  switch (props.size) {
    case BPaginationSize.Small:
      result += `ds-w-8 ds-h-8 `;
      break;
    case BPaginationSize.Medium:
    default:
      result += `ds-w-10 ds-h-10 `;
      break;
  }

  return result;
});

/**
 * Methods
 */
const clickPage = (page: number) => {
  value.value = page;
  // Emitted when page changes via user interaction
  emit('change', value.value);
};
const clickPrevious = () => {
  if (value.value > 1) {
    value.value--;
    emit('change', value.value);
  }
};
const clickNext = () => {
  if (value.value < props.numberOfPages) {
    value.value++;
    emit('change', value.value);
  }
};
const getActiveClass = (isActive: boolean = true) => {
  return isActive
    ? `ds-text-white ds-bg-primary-t `
    : `ds-text-gray-500 hover:ds-bg-primary-t/10 ${
        props.transparent ? 'ds-bg-transparent' : 'ds-bg-white'
      }`;
};
</script>

<template>
  <nav>
    <ul class="ds-inline-flex ds-space-x-1">
      <li
        :class="[paginationItemClass, getActiveClass(false)]"
        class="ds-ml-0 ds-cursor-pointer"
        @click="clickPrevious"
      >
        <i class="fa-solid fa-angle-left"></i>
      </li>

      <!--First-->
      <li
        :class="[getActiveClass(value === 1), paginationItemClass]"
        class="ds-cursor-pointer"
        @click="clickPage(1)"
      >
        <a> {{ First }}</a>
      </li>
      <!---->
      <li
        v-show="value > 3"
        :class="[paginationItemClass]"
        class="ds-cursor-default"
      >
        <a> {{ EllipsisText }} </a>
      </li>

      <li
        v-show="value > 2"
        :class="[paginationItemClass, getActiveClass(false)]"
        class="ds-cursor-pointer"
        @click="clickPage(value - 1)"
      >
        <a>
          {{ value - 1 }}
        </a>
      </li>
      <!--Active item-->
      <li
        v-show="value !== 1 && value !== numberOfPages"
        :class="[paginationItemClass, getActiveClass()]"
        class="ds-cursor-pointer"
        @click="clickPage(value)"
      >
        <a>
          {{ value }}
        </a>
      </li>
      <!---->
      <li
        v-show="value < numberOfPages - 1"
        :class="[paginationItemClass, getActiveClass(false)]"
        class="ds-cursor-pointer"
        @click="clickPage(value + 1)"
      >
        <a>
          {{ value + 1 }}
        </a>
      </li>

      <li
        v-show="value < numberOfPages - 2"
        :class="[paginationItemClass]"
        class="ds-cursor-default"
      >
        <a> {{ EllipsisText }} </a>
      </li>
      <!--Last-->
      <li
        v-show="numberOfPages > 1"
        :class="[paginationItemClass, getActiveClass(value === numberOfPages)]"
        class="ds-cursor-pointer"
        @click="clickPage(numberOfPages)"
      >
        <a>
          {{ numberOfPages }}
        </a>
      </li>
      <!---->

      <li
        :class="[paginationItemClass, getActiveClass(false)]"
        class="ds-cursor-pointer"
        @click="clickNext"
      >
        <i class="fa-solid fa-angle-right"></i>
      </li>
    </ul>
  </nav>
</template>
