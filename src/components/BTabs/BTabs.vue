<script lang="ts" setup>
import type { BTabsHeader } from '@/types';
import { v4 as uuid } from 'uuid';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

//#region Props
export interface BTabsProps {
  /**
   * Array of header objects.
   */
  headers: BTabsHeader[];
  /**
   * Index of tab.
   */
  modelValue?: number;
  /**
   * CSS of header.
   */
  headerCssClass?: string;
}

const props = withDefaults(defineProps<BTabsProps>(), {
  modelValue: undefined,
  headerCssClass: '',
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Update value, param: <code>value: number</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: number): void;
}>();
//#endregion

//#region Data
const tabContainer = ref<HTMLElement | null>(null);
const tabHeaders = ref<HTMLElement[] | null>(null);
const tabs = ref<Element[] | null>(null);
const activeTabIndex = ref(0);
const mValue = ref(0);
const value = computed({
  get() {
    return props.modelValue !== undefined ? props.modelValue : mValue.value;
  },
  set(val) {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      mValue.value = val;
    }
  },
});
const tabBodyId = computed(() => `id-${uuid()}`);
//#endregion

//#region Watchers
watch(
  value,
  (val) => {
    nextTick(() => {
      selectTab(val);
    });
  },
  { immediate: true },
);
watch(
  () => props.headers,
  () => {
    nextTick(() => {
      initTabs();
    });
  },
);
//#endregion

//#region Methods
const onClickTabHeader = (index: number) => {
  value.value = index;
};
const selectTab = (index: number) => {
  if (tabs.value && tabHeaders.value) {
    // Set activeTabIndex item to the index of the element clicked
    activeTabIndex.value = index;
    // Remove any active classes
    [...tabs.value, ...tabHeaders.value].forEach((t) => {
      t.classList.remove('active');
    });
    // Add active classes where appropriate, to the active element
    if (
      tabs.value[activeTabIndex.value] &&
      tabHeaders.value[activeTabIndex.value]
    ) {
      tabs.value[activeTabIndex.value].classList.add('active');
      tabHeaders.value[activeTabIndex.value].classList.add('active');
    } else {
      // Nearest element if desired index is not found
      const nearestIndex = activeTabIndex.value - 1;
      if (nearestIndex >= 0) {
        tabs.value[nearestIndex].classList.add('active');
        tabHeaders.value[nearestIndex].classList.add('active');
      }
    }
  }
};
const initTabs = () => {
  if (tabContainer.value) {
    // Selects all elements with the class '.tab', which are direct children of element with the id 'tabBodyId'
    tabs.value = [
      ...(tabContainer.value.querySelectorAll(
        `#${tabBodyId.value} > .tab`,
      ) as any),
    ];
    tabs.value.forEach((tab) => {
      if (tab.classList.contains('active')) {
        activeTabIndex.value = tabs.value!.indexOf(tab);
      }
    });
    selectTab(activeTabIndex.value);
  }
};
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  initTabs();
});
//#endregion
</script>

<template>
  <div ref="tabContainer">
    <slot name="headers-prepend"></slot>
    <ul
      class="ds-flex ds-flex-wrap ds-overflow-hidden ds-rounded-lg ds-border ds-border-gray-100 ds-bg-gray-100"
    >
      <li
        v-for="(header, index) in headers"
        :key="index"
        ref="tabHeaders"
        :class="[
          headerCssClass,
          header.disabled ? 'ds-pointer-events-none ds-text-black/40' : '',
        ]"
        class="tab-header ds-min-w-[5rem] ds-flex-1 ds-cursor-pointer ds-rounded-lg ds-p-2 ds-text-center ds-text-sm ds-font-medium ds-capitalize hover:ds-bg-slate-50 hover:ds-text-primary-t"
        @click="onClickTabHeader(index)"
      >
        {{ header.text }}
      </li>
    </ul>
    <slot name="headers-append"></slot>

    <div :id="tabBodyId" class="ds-w-full">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-header.active {
  background-color: theme('colors.white');
  color: theme('colors.primary-t');
}
</style>
