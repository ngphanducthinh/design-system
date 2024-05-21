<script lang="ts" setup>
import type { BTabsHeader } from '@/types';
import {
  computed,
  getCurrentInstance,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue';

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
const tabs = ref<Record<string, boolean>>({});
const instance = getCurrentInstance();
provide(`tabs-${instance?.uid}`, tabs);
//#endregion

//#region Watchers
watch(value, (val) => {
  showTab(val);
});
watch(
  () => props.headers,
  () => {
    init();
  },
  { deep: true },
);
//#endregion

//#region Methods
const handleClickTabHeader = (index: number) => {
  value.value = index;
};
const showTab = (index: number) => {
  Object.keys(tabs.value).forEach((key, i) => {
    tabs.value[key] = i === index;
  });
};
const hideDisabledTabs = () => {
  const disabledIndexes = props.headers.reduce((indices, header, index) => {
    if (header.disabled === true) {
      indices.push(index);
    }
    return indices;
  }, [] as number[]);

  Object.keys(tabs.value).forEach((key, index) => {
    if (disabledIndexes.includes(index)) {
      tabs.value[key] = false;
    }
  });
};
const init = () => {
  showTab(value.value);
  hideDisabledTabs();
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
        v-for="(header, index) in headers"
        :key="index"
        :class="[
          headerCssClass,
          header.disabled ? 'ds-pointer-events-none ds-text-black/40' : '',
        ]"
        class="tab-header ds-min-w-[5rem] ds-flex-1 ds-cursor-pointer ds-rounded-lg ds-p-2 ds-text-center ds-text-sm ds-font-medium ds-capitalize hover:ds-bg-slate-50 hover:ds-text-primary-t"
        @click="handleClickTabHeader(index)"
      >
        {{ header.text }}
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
