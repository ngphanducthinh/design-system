<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue';
import type { BTabData } from '@/types';

//#region Props
export interface BTabsProps {
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
const tabs = ref<Record<string, BTabData>>({});
const instance = getCurrentInstance();
provide(`tabs-${instance?.uid}`, tabs);
//#endregion

//#region Watchers
watch(value, (val) => {
  showTab(val);
});
//#endregion

//#region Methods
const handleClickTabHeader = (tabId: string) => {
  value.value = Object.keys(tabs.value).findIndex((key) => key === tabId);
};
const showTab = (index: number) => {
  Object.keys(tabs.value).forEach((key, i) => {
    tabs.value[key].active = i === index;
  });
};
const init = () => {
  showTab(value.value);
};
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  init();
});
//#endregion
</script>

<template>
  <div>
    <slot name="headers-prepend"></slot>
    <ul
      class="ds-flex ds-flex-wrap ds-overflow-hidden ds-rounded-lg ds-border ds-border-gray-100 ds-bg-gray-100"
    >
      <li
        v-for="(tab, tabId) in tabs"
        :key="tabId"
        :class="[
          headerCssClass,
          tab.disabled ? 'ds-pointer-events-none ds-text-black/40' : '',
        ]"
        class="tab-header ds-min-w-[5rem] ds-flex-1 ds-cursor-pointer ds-rounded-lg ds-p-2 ds-text-center ds-text-sm ds-font-medium ds-capitalize hover:ds-bg-slate-50 hover:ds-text-primary-t"
        @click="handleClickTabHeader(tabId)"
      >
        {{ tab.text }}
      </li>
    </ul>
    <slot name="headers-append"></slot>

    <div class="ds-w-full">
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
