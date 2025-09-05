<script setup lang="ts">
import { ref, watch } from 'vue';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
 * Animation: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#animating_dialogs
 * Transition Behavior: https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior
 */

const model = defineModel<boolean>({ required: true });

const dialogRef = ref<HTMLDialogElement | null>(null);

const updateModelFalse = () => {
  model.value = false;
};

watch(
  model,
  (newValue) => {
    if (!dialogRef.value) {
      return;
    }
    if (newValue) {
      dialogRef.value.showModal();
    } else {
      dialogRef.value.close();
    }
  },
  { immediate: true },
);
</script>

<template>
  <dialog
    ref="dialogRef"
    class="b-modal b:rounded-lg b:bg-white b:px-5 b:py-4"
    @close="updateModelFalse"
  >
    <slot />
  </dialog>
</template>

<style scoped>
.b-modal {
  --duration: 0.7s;

  margin: auto;

  opacity: 0;
  transform: scaleY(0);
  transition:
    opacity var(--duration) ease-out,
    transform var(--duration) ease-out,
    overlay var(--duration) ease-out allow-discrete,
    display var(--duration) ease-out allow-discrete;
  /* Equivalent to transition: all var(--duration) allow-discrete; */

  &::backdrop {
    background-color: transparent;
    transition:
      display var(--duration) allow-discrete,
      overlay var(--duration) allow-discrete,
      background-color var(--duration);
    /* Equivalent to transition: all var(--duration) allow-discrete; */
  }

  &:open {
    opacity: 1;
    transform: scaleY(1);
  }

  &:open::backdrop {
    background-color: rgb(0 0 0 / 25%);
  }
}

/* Before open state  */
/* Needs to be after the previous dialog:open rule to take effect, as the specificity is the same */
@starting-style {
  .b-modal:open {
    opacity: 0;
    transform: scaleY(0);
  }
}

/* This starting-style rule cannot be nested inside the above selector because the nesting selector cannot represent pseudo-elements. */
@starting-style {
  .b-modal:open::backdrop {
    background-color: transparent;
  }
}
</style>
