<script lang="ts" setup>
import type { BStepperHeader } from '@/types';
import { computed } from 'vue';

//#region Props
interface Props {
  /**
   * Array of header objects.
   */
  headers: BStepperHeader[];
  /**
   * Index of step.
   */
  modelValue: number;
}

const props = withDefaults(defineProps<Props>(), {});
//#region

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
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
//#region

//#region Methods
const onClickStepperHeader = (header: BStepperHeader, index: number) => {
  if (!header.clickable) {
    return;
  }
  value.value = index;
};
//#region
</script>

<template>
  <div>
    <ul class="ds-flex">
      <li
        v-for="(header, i) in props.headers"
        :key="header.text"
        :class="{
          'ds-cursor-pointer': header.clickable,
          'ds-pointer-events-none ds-text-black/40': header.disabled,
          'ds-text-primary-t': i < value,
          'after:ds-border-1 after:content-[``] ds-flex-auto after:ds-mx-3 after:ds-h-1 after:ds-w-full after:ds-border-b after:ds-border-gray-200':
            i < headers.length - 1,
        }"
        class="ds-flex ds-items-center ds-whitespace-nowrap ds-text-sm ds-font-medium"
        @click="onClickStepperHeader(header, i)"
      >
        <slot :name="`step-header-${i}`" :text="header.text">
          {{ header.text }}
        </slot>
      </li>
    </ul>

    <div
      v-for="(step, i) in headers"
      :key="step.text"
      :class="{
        'ds-hidden': value !== i,
      }"
    >
      <slot :name="`step-content-${i}`" />
    </div>
  </div>
</template>
