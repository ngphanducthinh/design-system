<template>
  <header></header>

  <main class="b:p-16">
    {{ page }}

    <BPagination v-model="page" :total="10000" />
  </main>

  <footer></footer>
</template>
<script setup lang="ts">
import { BPagination } from '@/components';
import { ref } from 'vue';

const page = ref(1);
</script>
