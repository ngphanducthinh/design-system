<script lang="ts" setup>
import { BPaginationSize } from '@/constants/Enums';
import { computed } from 'vue';

//#region Props
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
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Value is changed, param: <code>value: number</code>
   * @param e
   * @param value
   */
  (e: 'change', value: number): void;
  /**
   * Update value, param: <code>value: number</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: number): void;
}>();
//#endregion

//#region Data
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
//#endregion

//#region Methods
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
    : `ds-text-black/80 ${
        props.transparent ? 'ds-bg-transparent' : 'ds-bg-white'
      }`;
};
//#endregion
</script>

<template>
  <nav>
    <ul class="ds-inline-flex ds-space-x-1">
      <li
        :class="[paginationItemClass, getActiveClass(false)]"
        class="ds-ml-0 ds-cursor-pointer"
        @click="clickPrevious"
      >
        <svg
          class="ds-h-4 ds-w-4 ds-fill-black/80"
          viewBox="0 0 320 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
          />
        </svg>
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
        <svg
          class="ds-h-4 ds-w-4 ds-fill-black/80"
          viewBox="0 0 320 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
          />
        </svg>
      </li>
    </ul>
  </nav>
</template>
