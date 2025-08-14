<script setup lang="ts">
import { BIcon, BInput } from '@/components';
import type { BSelectOption } from '@/types.ts';
import { computed, getCurrentInstance, ref, watch } from 'vue';

/**
 * Read more about the Popover API:
 * https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
 */

const { options = [], searchable } = defineProps<{
  /**
   * Options for the select component.
   */
  options: BSelectOption[];
  /**
   * Whether the select component should be searchable.
   */
  searchable?: boolean;
  /**
   * Whether the select component is disabled.
   */
  disabled?: boolean;
  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
}>();
const model = defineModel<unknown>({ required: true });

const componentInstance = getCurrentInstance();
const componentUID = computed(() => componentInstance?.uid);
const anchorName = computed(() => `--search-input-${componentUID.value}`);

const menuEl = ref<HTMLElement | null>(null);
const searchText = ref<string>('');
const selectedOption = ref<BSelectOption>();
const filteredOptions = ref<BSelectOption[]>([]);
const isOpen = ref(false);

const updateIsOpen = ({ newState }: ToggleEvent) => {
  isOpen.value = newState === 'open';
};
const search = (value: string) => {
  searchText.value = value;
  filteredOptions.value = options.filter((option) =>
    option.label?.toLowerCase().includes(searchText.value?.toLowerCase()),
  );
};
const resetFilteredOptions = () => {
  filteredOptions.value = options;
};
const toggleMenu = () => {
  if (isOpen.value) {
    menuEl.value?.hidePopover();
  } else {
    menuEl.value?.showPopover();
  }
};
const selectOption = (option: BSelectOption) => {
  searchText.value = option.label;
  selectedOption.value = option;

  // Update the model with the selected option's value
  model.value = option.value;

  // Close the menu after selecting an option
  menuEl.value?.hidePopover();

  // Wait for the menu's close animation to finish before resetting the filtered options
  setTimeout(() => {
    resetFilteredOptions();
  }, 200);
};
const init = () => {
  if (model.value) {
    const selected = options.find((option) => option.value === model.value);
    if (selected) {
      selectedOption.value = selected;
      searchText.value = selected.label;
    }
  }
  filteredOptions.value = options;
};

init();

/**
 * Watch for changes in the model and update the search text and selected option accordingly
 * Handle the case when the model is updated externally
 */
watch(model, (newValue) => {
  if (newValue !== selectedOption.value?.value) {
    init();
  }
});
</script>

<template>
  <div class="b:flex b:items-center">
    <BInput
      v-model="searchText"
      :style="{ 'anchor-name': anchorName }"
      :class="[{ 'b:not-disabled:cursor-pointer': !searchable }]"
      :readonly="!searchable"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:modelValue="search"
      @click="toggleMenu"
    />
    <BIcon
      icon="chevron-down"
      size="sm"
      class="b:-ml-6 b:transition-[transform] b:duration-200"
      :class="[
        {
          'b:cursor-not-allowed': disabled,
          'b:cursor-pointer': !disabled,
        },
      ]"
      :color="disabled ? 'secondary' : 'currentColor'"
      :rotate="isOpen ? 180 : 0"
      @click="toggleMenu"
    />
  </div>

  <div
    ref="menuEl"
    class="b-select__menu b:rounded-lg b:bg-white b:p-1 b:shadow"
    popover
    @toggle="updateIsOpen"
  >
    <ul>
      <li
        v-for="option in filteredOptions"
        :key="option.value as string"
        class="b:cursor-pointer b:rounded-lg b:px-3 b:py-1"
        :class="[
          {
            'b:hover:bg-secondary-hover-light': option.value !== selectedOption?.value,
            'b:bg-primary-hover b:text-white': option.value === selectedOption?.value,
          },
        ]"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.b-select__menu {
  /* Reset default styles of browsers */
  position: absolute;
  margin-top: var(--b-spacing);

  /* Positioning based on anchor element */
  position-anchor: v-bind('anchorName');
  position-try-fallbacks: --bottom-left, --top-right, --top-left;
  inset: auto;
  /* bottom right */
  top: anchor(bottom);
  right: anchor(right);

  /* Animation and visibility */
  transition:
    display 0.2s,
    opacity 0.2s;
  transition-behavior: allow-discrete;
  opacity: 0;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

@position-try --bottom-left {
  inset: auto;

  top: anchor(bottom);
  left: anchor(left);
}

@position-try --top-left {
  inset: auto;

  bottom: anchor(top);
  left: anchor(left);
}

@position-try --top-right {
  inset: auto;

  bottom: anchor(top);
  right: anchor(right);
}
</style>
