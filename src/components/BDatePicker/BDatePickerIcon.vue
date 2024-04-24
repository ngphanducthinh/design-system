<script lang="ts" setup>
//#region Props
interface BDatePickerIconProps {
  disabled: boolean;
}

const props = withDefaults(defineProps<BDatePickerIconProps>(), {});
//#endregion
</script>

<template>
  <label
    class="ds-absolute ds-right-3 ds-top-0 ds-z-[3] ds-flex ds-h-10 ds-items-center"
  >
    <svg
      :class="[
        props.disabled
          ? 'ds-cursor-not-allowed ds-fill-black/40'
          : 'ds-cursor-pointer ds-fill-black/80',
      ]"
      class="ds-h-[18px] ds-w-[18px]"
      viewBox="0 0 448 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192zM96 296c0-13.3 10.7-24 24-24H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24zm24 72H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
      />
    </svg>
  </label>
</template>
