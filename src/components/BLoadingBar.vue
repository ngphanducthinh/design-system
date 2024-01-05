<script lang="ts" setup>
import { computed, type StyleValue } from 'vue';

//#region Props
export interface BLoadingBarProps {
  loading: boolean;
  height?: string;
  borderRadius?: string;
  absolute?: boolean;
}

const props = withDefaults(defineProps<BLoadingBarProps>(), {
  height: '',
  borderRadius: '',
  absolute: false,
});
//#endregion

//#region Data
const cssStyle = computed(() => {
  const result: StyleValue = {
    opacity: +props.loading,
    height: '',
    borderRadius: '',
    position: 'relative',
  };

  if (props.height) {
    result.height = props.height;
  }
  if (props.borderRadius) {
    result.borderRadius = props.borderRadius;
  }
  if (props.absolute) {
    result.position = 'absolute';
  }

  return result;
});
//#endregion
</script>

<template>
  <div :style="cssStyle" class="b-loading-bar">
    <div class="b-loading-bar-indeterminate" />
  </div>
</template>

<style lang="scss" scoped>
.b-loading-bar {
  height: 0.25rem;
  display: block;
  width: 100%;
  background-color: lighten(rgb(59 130 246), 35%);
  overflow: hidden;

  .b-loading-bar-indeterminate {
    background-color: rgb(59 130 246);

    &:before {
      content: '';
      position: absolute;
      z-index: 100;
      background-color: inherit;
      top: 0;
      left: 0;
      bottom: 0;
      will-change: left, right;
      animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395)
        infinite;
    }

    &:after {
      content: '';
      position: absolute;
      z-index: 100;
      background-color: inherit;
      top: 0;
      left: 0;
      bottom: 0;
      will-change: left, right;
      animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1)
        infinite;
      animation-delay: 1.15s;
    }
  }
}

@keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}
</style>
