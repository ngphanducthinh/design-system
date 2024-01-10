<script lang="ts" setup>
import BButton from '@/components/BButton.vue';
import { useValidationForm } from '@/composables/Validation';

//#region Data
const { validateAll } = useValidationForm();
const submitText = 'Submit';
//#endregion

//#region Methods
const submit = () => {
  if (validateAll()) {
    alert('All fields are validated!');
  }
};
//#endregion
</script>

<template>
  <div class="ds-flex ds-flex-wrap ds-gap-3">
    <slot />

    <div class="ds-flex ds-w-full ds-justify-end">
      <BButton @click="submit">{{ submitText }}</BButton>
    </div>
  </div>
</template>
