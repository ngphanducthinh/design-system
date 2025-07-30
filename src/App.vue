<template>
  <header></header>

  <main>
    <BIcon :icon="BIconName.Abacus" size="md" />
    <BIcon :icon="BIconBrandName.Airbnb" brand />
    <BButton
      prepend-icon="house"
      prepend-icon-color="red"
      append-icon="house"
      append-icon-color="red"
    >
      Apply
    </BButton>
  </main>

  <footer></footer>
</template>
<script setup lang="ts">
import { BButton } from '@/components';
import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconBrandName, BIconName } from '@/components/BIcon/BIconEnum.ts';
</script>
