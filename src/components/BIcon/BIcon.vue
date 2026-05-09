<script setup lang="ts">
import { BIconBrandName, BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BIconSizeMap } from '@/constants';
import { BCommonColor, BIconSize, BIconVariant } from '@/types';
import { computed, ref, watch } from 'vue';

const {
  icon,
  variant = BIconVariant.Regular,
  size = BIconSize.Medium,
  decorative = true,
  rotate = 0,
  brand = false,
  color = 'currentColor',
  width,
  height,
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
  color?: string | 'currentColor' | `${BCommonColor}`;
  /**
   * Custom width
   * @example '2rem', '24px', '1.5em'
   */
  width?: string;
  /**
   * Custom height
   * @example '2rem', '24px', '1.5em'
   */
  height?: string;
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

const ICONS_BASE_URL = import.meta.env.DEV
  ? '/src/assets/icons'
  : `/node_modules/${__PACKAGE_NAME__}/dist/assets/icons`;


const svgStyle = computed(() => ({
  width: width || `${BIconSizeMap[size]}rem`,
  height: height || `${BIconSizeMap[size]}rem`,
  transform: `rotate(${rotate}deg)`,
  fill: ['currentColor', ...Object.values(BCommonColor)].includes(color) ? undefined : color,
}));

const iconFolder = computed(() => (brand ? 'brands' : variant));

/**
 * SVG markup fetched at runtime from the static assets folder.
 * No dynamic import() - icons are NOT bundled as JS chunks.
 * They are served as plain .svg files copied to dist/assets/icons by viteStaticCopy.
 */
const svgMarkup = ref<string>('');

const loadIcon = async () => {
  svgMarkup.value = '';
  const url = `${ICONS_BASE_URL}/${iconFolder.value}/${icon}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[BIcon] Could not load icon '${icon}' from '${url}' (HTTP ${res.status})`);
      return;
    }
    svgMarkup.value = await res.text();
  } catch {
    console.warn(`[BIcon] Could not load icon '${icon}' from '${url}'`);
  }
};

watch(() => [icon, iconFolder.value], loadIcon, { immediate: true });
</script>

<template>
  <!-- v-html renders the raw SVG markup inline so fill/color CSS works normally -->
  <span
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
        'b-icon--color': !!svgStyle.fill,
      },
    ]"
    :aria-hidden="!!decorative || undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    v-html="svgMarkup"
  />
</template>

<style scoped>
.b-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind('svgStyle.width');
  height: v-bind('svgStyle.height');
  transform: v-bind('svgStyle.transform');
}

/* Size the inner <svg> element to fill the wrapper span */
.b-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.b-icon--color :deep(svg) {
  fill: v-bind('svgStyle.fill');
}
</style>
