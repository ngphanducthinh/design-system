<script setup lang="ts">
import { ref, watch } from 'vue';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
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
  margin: auto;
  animation: fade-out 0.7s ease-out;
}

.b-modal:open {
  animation: fade-in 0.7s ease-out;
}

.b-modal:open::backdrop {
  background-color: rgba(0, 0, 0, 0.9);
  animation: backdrop-fade-in 0.7s ease-out forwards;
}

/* Animation keyframes */

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: scaleY(0);
    display: none;
  }

  100% {
    opacity: 1;
    transform: scaleY(1);
    display: block;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
    transform: scaleY(1);
    display: block;
  }

  100% {
    opacity: 0;
    transform: scaleY(0);
    display: none;
  }
}

@keyframes backdrop-fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 0.25;
  }
}
</style>
