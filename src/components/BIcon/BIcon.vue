<script setup lang="ts">
import { BIconBrandName, BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSizeMap } from '@/constants';
import { BIconColor, BIconSize, BIconVariant } from '@/types';
import { computed, ref, useAttrs, watch } from 'vue';

const {
  icon,
  variant = BIconVariant.Regular,
  size = BIconSize.Medium,
  decorative = true,
  rotate = 0,
  brand = false,
  color = 'currentColor',
} = defineProps<{
  /**
   * Icon name, should match the file name in the assets/icons folder
   * @example 'check', 'cross', 'arrow-right'
   */
  icon: `${BIconName}` | `${BIconBrandName}`;
  /**
   * Predefined icon variant, such as 'regular', 'solid', 'light', etc.
   * @default 'regular'
   */
  variant?: `${BIconVariant}`;
  /**
   * Predefined icon sizes
   * @default 'medium'
   */
  size?: `${BIconSize}`;
  /**
   * Custom color for the icon, can be a CSS color value or a theme color
   * @example 'currentColor', 'primary', 'secondary', '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)'
   */
  color?: string | 'currentColor' | `${BIconColor}`;
  /**
   * Custom width
   */
  width?: string | number;
  /**
   * Custom height
   */
  height?: string | number;
  /**
   * Whether icon is decorative (sets aria-hidden)
   * @default true
   */
  decorative?: boolean;
  /**
   * Accessible label for meaningful icons
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this icon
   */
  ariaLabelledby?: string;
  /**
   * Icon rotation in degrees
   * @default 0
   */
  rotate?: number;
  /**
   * Whether the icon is a brand icon
   */
  brand?: boolean;
}>();

const svgRef = ref<HTMLDivElement | null>(null);
const svgStyle = computed(() => ({
  width: `${BIconSizeMap[size]}rem`,
  height: `${BIconSizeMap[size]}rem`,
  rotate: `rotate(${rotate}deg)`,
  color: ['currentColor', ...Object.values(BIconColor)].includes(color) ? undefined : color,
}));

const attrs = useAttrs();
const svgAttributes = ref<Record<string, string>>({});
const svgInnerHtml = ref<string>('');
const svgMergedAttributes = computed(() => ({
  ...svgAttributes.value,
  ...attrs,
}));

const getIconFolder = () => (brand ? 'brands' : variant);
const importIcon = async () => {
  // Should keep SVG files in one folder
  // Because each import statement results in a file system access. File system accesses are relatively expensive operations, and we should avoid them when possible.
  try {
    if (!icon) {
      return;
    }
    return (await (() => import(`../../assets/icons/${getIconFolder()}/${icon}.svg?raw`))())
      .default;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    console.warn(`Icon '${icon}' not found`);
  }
};
const loadAndParseIcon = async () => {
  // Load icon URL
  const iconUrl = await importIcon();
  if (!iconUrl) {
    return;
  }

  // Parse the SVG string into an actual SVG element
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(iconUrl, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  // Set the attributes of the SVG element
  Array.from(svgElement.attributes).forEach((attr) => {
    svgAttributes.value[attr.name] = attr.value;
  });

  // Set the inner HTML of the SVG element
  svgInnerHtml.value = svgElement.innerHTML;
};

watch(
  () => icon,
  () => {
    loadAndParseIcon();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <svg
    ref="svgRef"
    class="b-icon"
    :class="[
      {
        'b:fill-current': color === 'currentColor',
        'b:fill-primary': color === 'primary',
        'b:fill-secondary': color === 'secondary',
        'b:fill-success': color === 'success',
        'b:fill-failure': color === 'failure',
        'b:fill-warning': color === 'warning',
        'b:fill-info': color === 'info',
      },
      {
        'b-icon--color': !!svgStyle.color,
      },
    ]"
    :aria-hidden="!!decorative"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    v-bind="svgMergedAttributes"
    v-html="svgInnerHtml"
  />
</template>

<style scoped>
.b-icon {
  width: v-bind('svgStyle.width');
  height: v-bind('svgStyle.height');
  rotate: v-bind('svgStyle.rotate');
}

.b-icon--color {
  fill: v-bind('svgStyle.color');
}
</style>
