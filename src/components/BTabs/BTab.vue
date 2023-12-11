<script lang="ts" setup></script>

<template>
  <div class="tab">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.tab {
  display: none;
}
.tab.active {
  display: block;
}
</style>
