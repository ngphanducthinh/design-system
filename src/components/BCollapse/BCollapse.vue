<script lang="ts" setup>
// https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/
import BIcon from '@/components/BIcon/BIcon.vue';
import { PIKey } from '@/constants.ts';
import { computed, getCurrentInstance, inject, ref, watch } from 'vue';

//#region Props
const model = defineModel<boolean>();
const {} = defineProps<{
  header?: string;
  hideIcon?: boolean;
}>();
//#endregion

const internalModel = ref(model.value);
const combinedModel = computed({
  get() {
    return model.value !== undefined ? model.value : internalModel.value;
  },
  set(val: boolean) {
    if (model.value !== undefined) {
      model.value = val;
    } else {
      internalModel.value = val;
    }
  },
});

const collapseList = inject(PIKey.BCollapseGroup)!;
const instance = getCurrentInstance();

if (collapseList.value) {
  collapseList.value.push({ id: instance?.uid!, isOpen: false });
}
console.log(collapseList.value);

const toggle = () => {
  combinedModel.value = !combinedModel.value;
};
const open = () => {
  combinedModel.value = true;
};

watch(
  collapseList,
  () => {
    const found = collapseList.value.find((c) => c.id === instance?.uid! && c.isOpen);
    if (found) {
      combinedModel.value = true;
    }
  },
  { deep: true },
);
</script>

<template>
  <div>
    <div
      v-if="header || $slots.header"
      role="button"
      :aria-expanded="combinedModel"
      aria-disabled="false"
      tabindex="0"
      class="b:flex b:items-center b:gap-x-2 b:rounded-t-lg b:border-t b:border-r b:border-l b:border-zinc-200 b:bg-zinc-100 b:px-4 b:pt-3"
      @click="toggle"
    >
      <slot v-if="!hideIcon" name="icon">
        <BIcon
          icon="chevron-right"
          size="sm"
          class="b:transition-transform"
          :class="{ 'b:rotate-90': combinedModel }"
        />
      </slot>
      <slot name="header">
        <span>
          {{ header }}
        </span>
      </slot>
    </div>

    <div
      class="b:grid b:grid-rows-[0fr] b:rounded-b-lg b:border-r b:border-b b:border-l b:border-zinc-200 b:bg-zinc-100 b:pb-3 b:transition-[grid-template-rows] b:duration-300"
      :class="{ 'b:grid-rows-[1fr]': combinedModel }"
      @click="open"
    >
      <div class="b:overflow-y-hidden">
        <hr class="b:mt-3 b:border-zinc-200" />
        <div class="b:px-4 b:pt-4 b:pb-1">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
