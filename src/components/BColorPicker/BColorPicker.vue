<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import {
  BColorPickerFormat,
  BColorPickerPlacement,
  BColorPickerSize,
  BColorPickerTrigger,
  type BColorHsb,
  type BColorHsl,
  type BColorPickerPreset,
  type BColorRgb,
} from './types';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  modelValue = undefined,
  defaultValue = '#1677ff',
  disabled = false,
  open = undefined,
  trigger = BColorPickerTrigger.Click,
  size = BColorPickerSize.Medium,
  placement = BColorPickerPlacement.BottomLeft,
  format = undefined,
  defaultFormat = BColorPickerFormat.Hex,
  disabledAlpha = false,
  disabledFormat = false,
  showText = false,
  presets = undefined,
  allowClear = false,
  destroyOnHidden = false,
  arrow = true,
} = defineProps<{
  /** Current color value (v-model). Accepts hex, rgb, hsl strings. */
  modelValue?: string;
  /** Default color when uncontrolled. */
  defaultValue?: string;
  /** Whether the color picker is disabled. */
  disabled?: boolean;
  /** Controlled open state of the popup (v-model:open). */
  open?: boolean;
  /** How the popup is triggered. */
  trigger?: `${BColorPickerTrigger}`;
  /** Size of the trigger button. */
  size?: `${BColorPickerSize}`;
  /** Placement of the popup relative to the trigger. */
  placement?: `${BColorPickerPlacement}`;
  /** Controlled color format. */
  format?: `${BColorPickerFormat}`;
  /** Default color format when uncontrolled. */
  defaultFormat?: `${BColorPickerFormat}`;
  /** Whether to disable the alpha slider. */
  disabledAlpha?: boolean;
  /** Whether to disable format switching. */
  disabledFormat?: boolean;
  /** Whether to show the color text value next to the swatch. */
  showText?: boolean | ((color: string) => string);
  /** Preset color groups. */
  presets?: BColorPickerPreset[];
  /** Whether to allow clearing the color. */
  allowClear?: boolean;
  /** Destroy popup DOM when closed. */
  destroyOnHidden?: boolean;
  /** Whether the popup has an arrow. */
  arrow?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:open', value: boolean): void;
  (e: 'change', value: string, css: string): void;
  (e: 'changeComplete', value: string): void;
  (e: 'formatChange', format: `${BColorPickerFormat}`): void;
  (e: 'clear'): void;
  (e: 'openChange', open: boolean): void;
}>();

defineSlots<{
  /** Custom trigger element. */
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Color conversion utilities
// ─────────────────────────────────────────────

function hexToRgb(hex: string): BColorRgb {
  let h = hex.replace('#', '');
  let a = 1;
  if (h.length === 4) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  } else if (h.length === 8) {
    a = parseInt(h.slice(6, 8), 16) / 255;
    h = h.slice(0, 6);
  }
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a };
}

function rgbToHex(rgb: BColorRgb): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0');
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  if (rgb.a < 1) {
    return hex + toHex(Math.round(rgb.a * 255));
  }
  return hex;
}

function rgbToHsb(rgb: BColorRgb): BColorHsb {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s: s * 100, b: v * 100, a: rgb.a };
}

function hsbToRgb(hsb: BColorHsb): BColorRgb {
  const h = hsb.h / 360;
  const s = hsb.s / 100;
  const v = hsb.b / 100;
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsb.a,
  };
}

function rgbToHsl(rgb: BColorRgb): BColorHsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a: rgb.a };
}

function hslToRgb(hsl: BColorHsl): BColorRgb {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p2 = 2 * l - q2;
    r = hue2rgb(p2, q2, h + 1 / 3);
    g = hue2rgb(p2, q2, h);
    b = hue2rgb(p2, q2, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  };
}

function parseColor(input: string): BColorHsb {
  const s = input.trim().toLowerCase();

  // HSL string
  const hslMatch = s.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const hsl: BColorHsl = {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
      a: hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1,
    };
    return rgbToHsb(hslToRgb(hsl));
  }

  // RGB string
  const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const rgb: BColorRgb = {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    };
    return rgbToHsb(rgb);
  }

  // HSB string
  const hsbMatch = s.match(/hsb\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hsbMatch) {
    return {
      h: parseInt(hsbMatch[1]),
      s: parseInt(hsbMatch[2]),
      b: parseInt(hsbMatch[3]),
      a: hsbMatch[4] !== undefined ? parseFloat(hsbMatch[4]) : 1,
    };
  }

  // Hex (default)
  return rgbToHsb(hexToRgb(s));
}

function hsbToString(hsb: BColorHsb, fmt: `${BColorPickerFormat}`): string {
  const rgb = hsbToRgb(hsb);
  switch (fmt) {
    case BColorPickerFormat.Hex:
      return rgbToHex(rgb);
    case BColorPickerFormat.Rgb:
      return rgb.a < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${roundTo(rgb.a, 2)})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case BColorPickerFormat.Hsl: {
      const hsl = rgbToHsl(rgb);
      return hsl.a < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${roundTo(hsl.a, 2)})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case BColorPickerFormat.Hsb:
      return hsb.a < 1
        ? `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%, ${roundTo(hsb.a, 2)})`
        : `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%)`;
    default:
      return rgbToHex(rgb);
  }
}

function roundTo(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

function hsbToCssColor(hsb: BColorHsb): string {
  const rgb = hsbToRgb(hsb);
  return rgb.a < 1
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${roundTo(rgb.a, 2)})`
    : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const panelId = useId();

const initialColor = parseColor(modelValue ?? defaultValue);
const internalHsb = ref<BColorHsb>({ ...initialColor });
const internalFormat = ref<`${BColorPickerFormat}`>(format ?? defaultFormat);
const internalOpen = ref(false);
const cleared = ref(false);
const hasBeenOpened = ref(false);

const isOpen = computed(() => (open !== undefined ? open : internalOpen.value));
const shouldRender = computed(() => {
  if (destroyOnHidden) return isOpen.value;
  return hasBeenOpened.value || isOpen.value;
});

const activeFormat = computed(() => format ?? internalFormat.value);

const colorString = computed(() => hsbToString(internalHsb.value, activeFormat.value));
const cssColor = computed(() => hsbToCssColor(internalHsb.value));

const displayText = computed(() => {
  if (!showText) return '';
  if (typeof showText === 'function') return showText(colorString.value);
  return colorString.value;
});

watch(isOpen, (val) => {
  if (val) hasBeenOpened.value = true;
});

watch(
  () => modelValue,
  (val) => {
    if (val !== undefined) {
      const parsed = parseColor(val);
      internalHsb.value = parsed;
      cleared.value = false;
    }
  },
);

watch(
  () => format,
  (val) => {
    if (val) internalFormat.value = val;
  },
);

// ─────────────────────────────────────────────
// Visibility control
// ─────────────────────────────────────────────
const triggerRef = ref<HTMLDivElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);

let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function setOpen(val: boolean) {
  if (disabled) return;
  if (open !== undefined) {
    emit('update:open', val);
  } else {
    internalOpen.value = val;
  }
  emit('openChange', val);
}

function toggleOpen() {
  setOpen(!isOpen.value);
}

function onTriggerClick() {
  if (trigger === BColorPickerTrigger.Click) toggleOpen();
}

function onTriggerMouseEnter() {
  if (trigger === BColorPickerTrigger.Hover) {
    if (hoverTimer) clearTimeout(hoverTimer);
    setOpen(true);
  }
}

function onTriggerMouseLeave() {
  if (trigger === BColorPickerTrigger.Hover) {
    hoverTimer = setTimeout(() => setOpen(false), 150);
  }
}

function onPanelMouseEnter() {
  if (trigger === BColorPickerTrigger.Hover && hoverTimer) {
    clearTimeout(hoverTimer);
  }
}

function onPanelMouseLeave() {
  if (trigger === BColorPickerTrigger.Hover) {
    hoverTimer = setTimeout(() => setOpen(false), 150);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault();
    setOpen(false);
    triggerRef.value?.focus();
  }
  if ((event.key === 'Enter' || event.key === ' ') && !isOpen.value) {
    event.preventDefault();
    setOpen(true);
  }
}

// Close on outside click
function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) {
    return;
  }
  setOpen(false);
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick);
  if (hoverTimer) clearTimeout(hoverTimer);
});

// Sync controlled open → popover
watch(
  () => open,
  (val) => {
    if (val === undefined) return;
    internalOpen.value = val;
  },
);

// Focus management
let previouslyFocusedElement: HTMLElement | null = null;

watch(isOpen, (val) => {
  if (val) {
    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    nextTick(() => {
      panelRef.value?.focus();
    });
  } else {
    nextTick(() => previouslyFocusedElement?.focus());
  }
});

// ─────────────────────────────────────────────
// Saturation panel interaction
// ─────────────────────────────────────────────
const saturationRef = ref<HTMLDivElement | null>(null);
let isDraggingSat = false;

function updateSaturationFromEvent(event: MouseEvent | TouchEvent) {
  if (!saturationRef.value) return;
  const rect = saturationRef.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  internalHsb.value = {
    ...internalHsb.value,
    s: x * 100,
    b: (1 - y) * 100,
  };
  emitChange();
}

function onSaturationMouseDown(event: MouseEvent) {
  event.preventDefault();
  isDraggingSat = true;
  updateSaturationFromEvent(event);
  document.addEventListener('mousemove', onSaturationMouseMove);
  document.addEventListener('mouseup', onSaturationMouseUp);
}

function onSaturationMouseMove(event: MouseEvent) {
  if (!isDraggingSat) return;
  updateSaturationFromEvent(event);
}

function onSaturationMouseUp() {
  isDraggingSat = false;
  document.removeEventListener('mousemove', onSaturationMouseMove);
  document.removeEventListener('mouseup', onSaturationMouseUp);
  emitChangeComplete();
}

function onSaturationTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDraggingSat = true;
  updateSaturationFromEvent(event);
  document.addEventListener('touchmove', onSaturationTouchMove);
  document.addEventListener('touchend', onSaturationTouchEnd);
}

function onSaturationTouchMove(event: TouchEvent) {
  if (!isDraggingSat) return;
  updateSaturationFromEvent(event);
}

function onSaturationTouchEnd() {
  isDraggingSat = false;
  document.removeEventListener('touchmove', onSaturationTouchMove);
  document.removeEventListener('touchend', onSaturationTouchEnd);
  emitChangeComplete();
}

// ─────────────────────────────────────────────
// Hue slider interaction
// ─────────────────────────────────────────────
const hueRef = ref<HTMLDivElement | null>(null);
let isDraggingHue = false;

function updateHueFromEvent(event: MouseEvent | TouchEvent) {
  if (!hueRef.value) return;
  const rect = hueRef.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  internalHsb.value = { ...internalHsb.value, h: x * 360 };
  emitChange();
}

function onHueMouseDown(event: MouseEvent) {
  event.preventDefault();
  isDraggingHue = true;
  updateHueFromEvent(event);
  document.addEventListener('mousemove', onHueMouseMove);
  document.addEventListener('mouseup', onHueMouseUp);
}

function onHueMouseMove(event: MouseEvent) {
  if (!isDraggingHue) return;
  updateHueFromEvent(event);
}

function onHueMouseUp() {
  isDraggingHue = false;
  document.removeEventListener('mousemove', onHueMouseMove);
  document.removeEventListener('mouseup', onHueMouseUp);
  emitChangeComplete();
}

// ─────────────────────────────────────────────
// Alpha slider interaction
// ─────────────────────────────────────────────
const alphaRef = ref<HTMLDivElement | null>(null);
let isDraggingAlpha = false;

function updateAlphaFromEvent(event: MouseEvent | TouchEvent) {
  if (!alphaRef.value) return;
  const rect = alphaRef.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  internalHsb.value = { ...internalHsb.value, a: roundTo(x, 2) };
  emitChange();
}

function onAlphaMouseDown(event: MouseEvent) {
  event.preventDefault();
  isDraggingAlpha = true;
  updateAlphaFromEvent(event);
  document.addEventListener('mousemove', onAlphaMouseMove);
  document.addEventListener('mouseup', onAlphaMouseUp);
}

function onAlphaMouseMove(event: MouseEvent) {
  if (!isDraggingAlpha) return;
  updateAlphaFromEvent(event);
}

function onAlphaMouseUp() {
  isDraggingAlpha = false;
  document.removeEventListener('mousemove', onAlphaMouseMove);
  document.removeEventListener('mouseup', onAlphaMouseUp);
  emitChangeComplete();
}

// ─────────────────────────────────────────────
// Format switching
// ─────────────────────────────────────────────
const formatOrder: `${BColorPickerFormat}`[] = [
  BColorPickerFormat.Hex,
  BColorPickerFormat.Hsb,
  BColorPickerFormat.Rgb,
  BColorPickerFormat.Hsl,
];

function cycleFormat() {
  if (disabledFormat) return;
  const idx = formatOrder.indexOf(activeFormat.value);
  const next = formatOrder[(idx + 1) % formatOrder.length];
  if (format === undefined) {
    internalFormat.value = next;
  }
  emit('formatChange', next);
}

// ─────────────────────────────────────────────
// Input handling
// ─────────────────────────────────────────────
const inputValue = computed(() => {
  switch (activeFormat.value) {
    case BColorPickerFormat.Hex:
      return rgbToHex(hsbToRgb(internalHsb.value)).replace('#', '');
    case BColorPickerFormat.Rgb: {
      const rgb = hsbToRgb(internalHsb.value);
      return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    }
    case BColorPickerFormat.Hsl: {
      const hsl = rgbToHsl(hsbToRgb(internalHsb.value));
      return `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    }
    case BColorPickerFormat.Hsb:
      return `${Math.round(internalHsb.value.h)}, ${Math.round(internalHsb.value.s)}%, ${Math.round(internalHsb.value.b)}%`;
    default:
      return '';
  }
});

const alphaPercent = computed(() => Math.round(internalHsb.value.a * 100));

function onInputChange(event: Event) {
  const val = (event.target as HTMLInputElement).value.trim();
  try {
    let parsed: BColorHsb;
    switch (activeFormat.value) {
      case BColorPickerFormat.Hex:
        parsed = parseColor('#' + val);
        break;
      case BColorPickerFormat.Rgb: {
        const parts = val.split(',').map((s) => parseInt(s.trim()));
        if (parts.length >= 3) {
          parsed = rgbToHsb({ r: parts[0], g: parts[1], b: parts[2], a: internalHsb.value.a });
        } else return;
        break;
      }
      case BColorPickerFormat.Hsl: {
        const parts = val.split(',').map((s) => parseInt(s.trim()));
        if (parts.length >= 3) {
          parsed = rgbToHsb(
            hslToRgb({ h: parts[0], s: parts[1], l: parts[2], a: internalHsb.value.a }),
          );
        } else return;
        break;
      }
      case BColorPickerFormat.Hsb: {
        const parts = val.split(',').map((s) => parseInt(s.trim()));
        if (parts.length >= 3) {
          parsed = { h: parts[0], s: parts[1], b: parts[2], a: internalHsb.value.a };
        } else return;
        break;
      }
      default:
        return;
    }
    internalHsb.value = parsed;
    emitChange();
    emitChangeComplete();
  } catch {
    // Invalid input, ignore
  }
}

function onAlphaInputChange(event: Event) {
  const val = parseInt((event.target as HTMLInputElement).value);
  if (!isNaN(val)) {
    internalHsb.value = { ...internalHsb.value, a: Math.max(0, Math.min(100, val)) / 100 };
    emitChange();
    emitChangeComplete();
  }
}

// ─────────────────────────────────────────────
// Preset selection
// ─────────────────────────────────────────────
function selectPreset(color: string) {
  internalHsb.value = parseColor(color);
  cleared.value = false;
  emitChange();
  emitChangeComplete();
}

// ─────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────
function onClear() {
  cleared.value = true;
  emit('clear');
}

// ─────────────────────────────────────────────
// Emit helpers
// ─────────────────────────────────────────────
function emitChange() {
  cleared.value = false;
  const str = hsbToString(internalHsb.value, activeFormat.value);
  const css = hsbToCssColor(internalHsb.value);
  emit('update:modelValue', str);
  emit('change', str, css);
}

function emitChangeComplete() {
  const str = hsbToString(internalHsb.value, activeFormat.value);
  emit('changeComplete', str);
}

// ─────────────────────────────────────────────
// Computed styles
// ─────────────────────────────────────────────
const anchorName = computed(() => `--b-color-picker-anchor-${componentUID.value}`);

const saturationStyle = computed(() => ({
  backgroundColor: `hsl(${internalHsb.value.h}, 100%, 50%)`,
}));

const saturationHandleStyle = computed(() => ({
  left: `${internalHsb.value.s}%`,
  top: `${100 - internalHsb.value.b}%`,
}));

const hueHandleStyle = computed(() => ({
  left: `${(internalHsb.value.h / 360) * 100}%`,
}));

const alphaHandleStyle = computed(() => ({
  left: `${internalHsb.value.a * 100}%`,
}));

const alphaGradient = computed(() => {
  const rgb = hsbToRgb({ ...internalHsb.value, a: 1 });
  return `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`;
});

const sizeClass = computed(() => {
  switch (size) {
    case BColorPickerSize.Small:
      return 'b-color-picker--sm';
    case BColorPickerSize.Large:
      return 'b-color-picker--lg';
    default:
      return 'b-color-picker--md';
  }
});

// ─────────────────────────────────────────────
// Panel keyboard nav
// ─────────────────────────────────────────────
function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    setOpen(false);
    triggerRef.value?.focus();
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ open: () => setOpen(true), close: () => setOpen(false) });
</script>

<template>
  <div class="b-color-picker" :class="[sizeClass, { 'b-color-picker--disabled': disabled }]">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      class="b-color-picker__trigger"
      :style="{ anchorName }"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? panelId : undefined"
      :aria-disabled="disabled"
      :aria-label="`Color picker: ${colorString}`"
      aria-haspopup="dialog"
      @click="onTriggerClick"
      @mouseenter="onTriggerMouseEnter"
      @mouseleave="onTriggerMouseLeave"
      @keydown="onKeydown"
    >
      <slot>
        <div class="b-color-picker__swatch-wrapper">
          <div
            class="b-color-picker__swatch"
            :class="{ 'b-color-picker__swatch--cleared': cleared && allowClear }"
            :style="{ backgroundColor: cleared ? 'transparent' : cssColor }"
          />
        </div>
        <span v-if="showText" class="b-color-picker__text">
          {{ displayText }}
        </span>
      </slot>
    </div>

    <!-- Panel (popup) -->
    <div
      v-if="shouldRender"
      ref="panelRef"
      :id="panelId"
      class="b-color-picker__panel"
      :class="[
        `b-color-picker__panel--${placement}`,
        { 'b-color-picker__panel--open': isOpen, 'b-color-picker__panel--no-arrow': !arrow },
      ]"
      :style="{ positionAnchor: anchorName }"
      role="dialog"
      :aria-label="'Color picker'"
      tabindex="-1"
      @mouseenter="onPanelMouseEnter"
      @mouseleave="onPanelMouseLeave"
      @keydown="onPanelKeydown"
    >
      <!-- Arrow -->
      <div v-if="arrow" class="b-color-picker__arrow" aria-hidden="true" />

      <!-- Saturation panel -->
      <div
        ref="saturationRef"
        class="b-color-picker__saturation"
        :style="saturationStyle"
        role="slider"
        aria-label="Color saturation and brightness"
        :aria-valuetext="`Saturation ${Math.round(internalHsb.s)}%, Brightness ${Math.round(internalHsb.b)}%`"
        tabindex="0"
        @mousedown="onSaturationMouseDown"
        @touchstart.passive="onSaturationTouchStart"
      >
        <div class="b-color-picker__saturation-white" />
        <div class="b-color-picker__saturation-black" />
        <div class="b-color-picker__saturation-handle" :style="saturationHandleStyle" />
      </div>

      <!-- Sliders + preview row -->
      <div class="b-color-picker__controls">
        <div class="b-color-picker__preview">
          <div class="b-color-picker__preview-color" :style="{ backgroundColor: cssColor }" />
        </div>

        <div class="b-color-picker__sliders">
          <!-- Hue slider -->
          <div
            ref="hueRef"
            class="b-color-picker__hue"
            role="slider"
            aria-label="Hue"
            :aria-valuenow="Math.round(internalHsb.h)"
            aria-valuemin="0"
            aria-valuemax="360"
            tabindex="0"
            @mousedown="onHueMouseDown"
          >
            <div class="b-color-picker__hue-handle" :style="hueHandleStyle" />
          </div>

          <!-- Alpha slider -->
          <div
            v-if="!disabledAlpha"
            ref="alphaRef"
            class="b-color-picker__alpha"
            :style="{ '--b-color-picker-alpha-gradient': alphaGradient }"
            role="slider"
            aria-label="Opacity"
            :aria-valuenow="alphaPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            tabindex="0"
            @mousedown="onAlphaMouseDown"
          >
            <div class="b-color-picker__alpha-handle" :style="alphaHandleStyle" />
          </div>
        </div>
      </div>

      <!-- Input row -->
      <div class="b-color-picker__input-row">
        <button
          v-if="!disabledFormat"
          class="b-color-picker__format-btn"
          type="button"
          aria-label="Switch color format"
          @click="cycleFormat"
        >
          {{ activeFormat.toUpperCase() }}
        </button>
        <span v-else class="b-color-picker__format-label">
          {{ activeFormat.toUpperCase() }}
        </span>

        <input
          class="b-color-picker__input"
          type="text"
          :value="inputValue"
          aria-label="Color value"
          @change="onInputChange"
        />

        <input
          v-if="!disabledAlpha"
          class="b-color-picker__alpha-input"
          type="text"
          :value="`${alphaPercent}%`"
          aria-label="Alpha percentage"
          @change="onAlphaInputChange"
        />
      </div>

      <!-- Presets -->
      <div v-if="presets && presets.length" class="b-color-picker__presets">
        <div v-for="preset in presets" :key="preset.label" class="b-color-picker__preset-group">
          <div class="b-color-picker__preset-label">{{ preset.label }}</div>
          <div class="b-color-picker__preset-colors">
            <button
              v-for="color in preset.colors"
              :key="color"
              type="button"
              class="b-color-picker__preset-color"
              :style="{ backgroundColor: color }"
              :aria-label="`Select color ${color}`"
              @click="selectPreset(color)"
            />
          </div>
        </div>
      </div>

      <!-- Clear button -->
      <div v-if="allowClear" class="b-color-picker__clear-row">
        <button
          type="button"
          class="b-color-picker__clear-btn"
          aria-label="Clear color"
          @click="onClear"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (Design Tokens)
   ──────────────────────────────────────────── */
.b-color-picker {
  --b-color-picker-width: 234px;
  --b-color-picker-handler-size: 16px;
  --b-color-picker-handler-size-sm: 12px;
  --b-color-picker-slider-height: 8px;
  --b-color-picker-preview-size: 28px;
  --b-color-picker-alpha-input-width: 44px;
  --b-color-picker-border-width: 1px;
  --b-color-picker-border-radius: 6px;
  --b-color-picker-border-radius-sm: 4px;
  --b-color-picker-font-size: 14px;
  --b-color-picker-line-height: 1.5714;
  --b-color-picker-bg: #ffffff;
  --b-color-picker-border-color: #d9d9d9;
  --b-color-picker-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-color-picker-trigger-height: 32px;
  --b-color-picker-trigger-height-sm: 24px;
  --b-color-picker-trigger-height-lg: 40px;
  --b-color-picker-swatch-size: 16px;
  --b-color-picker-swatch-size-sm: 12px;
  --b-color-picker-swatch-size-lg: 20px;
  --b-color-picker-panel-padding: 12px;
  --b-color-picker-saturation-height: 160px;
  --b-color-picker-color-block-border-radius: 4px;
  --b-color-picker-input-bg: #ffffff;
  --b-color-picker-input-border: #d9d9d9;
  --b-color-picker-text-color: rgba(0, 0, 0, 0.88);
  --b-color-picker-text-color-secondary: rgba(0, 0, 0, 0.65);
  --b-color-picker-gap: 8px;
  --b-color-picker-transition-duration: 200ms;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-color-picker {
  --b-color-picker-bg: #1f1f1f;
  --b-color-picker-border-color: #424242;
  --b-color-picker-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-color-picker-input-bg: #141414;
  --b-color-picker-input-border: #424242;
  --b-color-picker-text-color: rgba(255, 255, 255, 0.88);
  --b-color-picker-text-color-secondary: rgba(255, 255, 255, 0.65);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-color-picker {
    --b-color-picker-bg: #1f1f1f;
    --b-color-picker-border-color: #424242;
    --b-color-picker-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
      0 9px 28px 8px rgba(0, 0, 0, 0.2);
    --b-color-picker-input-bg: #141414;
    --b-color-picker-input-border: #424242;
    --b-color-picker-text-color: rgba(255, 255, 255, 0.88);
    --b-color-picker-text-color-secondary: rgba(255, 255, 255, 0.65);
  }
}

/* ────────────────────────────────────────────
   Root
   ──────────────────────────────────────────── */
.b-color-picker {
  display: inline-flex;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--b-color-picker-font-size);
  line-height: var(--b-color-picker-line-height);
}

.b-color-picker--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.b-color-picker--disabled .b-color-picker__trigger {
  pointer-events: none;
}

/* ────────────────────────────────────────────
   Trigger
   ──────────────────────────────────────────── */
.b-color-picker__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--b-color-picker-trigger-height);
  padding: 3px;
  border: var(--b-color-picker-border-width) solid var(--b-color-picker-border-color);
  border-radius: var(--b-color-picker-border-radius);
  cursor: pointer;
  background: var(--b-color-picker-bg);
  transition: border-color var(--b-color-picker-transition-duration);
  outline: none;
}

.b-color-picker__trigger:hover:not([aria-disabled='true']) {
  border-color: #4096ff;
}

.b-color-picker__trigger:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 1px;
}

.b-color-picker--sm .b-color-picker__trigger {
  height: var(--b-color-picker-trigger-height-sm);
  padding: 2px;
}

.b-color-picker--lg .b-color-picker__trigger {
  height: var(--b-color-picker-trigger-height-lg);
  padding: 4px;
}

.b-color-picker__swatch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--b-color-picker-trigger-height) - 8px);
  height: calc(var(--b-color-picker-trigger-height) - 8px);
  border-radius: var(--b-color-picker-border-radius-sm);
  background-image: conic-gradient(
    rgba(0, 0, 0, 0.06) 0 25%,
    transparent 0 50%,
    rgba(0, 0, 0, 0.06) 0 75%,
    transparent 0
  );
  background-size: 8px 8px;
}

.b-color-picker--sm .b-color-picker__swatch-wrapper {
  width: calc(var(--b-color-picker-trigger-height-sm) - 6px);
  height: calc(var(--b-color-picker-trigger-height-sm) - 6px);
}

.b-color-picker--lg .b-color-picker__swatch-wrapper {
  width: calc(var(--b-color-picker-trigger-height-lg) - 10px);
  height: calc(var(--b-color-picker-trigger-height-lg) - 10px);
}

.b-color-picker__swatch {
  width: 100%;
  height: 100%;
  border-radius: var(--b-color-picker-border-radius-sm);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.25);
}

.b-color-picker__swatch--cleared {
  background: linear-gradient(135deg, transparent 45%, #ff4d4f 45%, #ff4d4f 55%, transparent 55%)
    center/100% 100%;
}

.b-color-picker__text {
  padding-right: 4px;
  color: var(--b-color-picker-text-color);
  font-size: var(--b-color-picker-font-size);
  user-select: none;
}

/* ────────────────────────────────────────────
   Panel
   ──────────────────────────────────────────── */
.b-color-picker__panel {
  position: absolute;
  z-index: 1050;
  width: var(--b-color-picker-width);
  padding: var(--b-color-picker-panel-padding);
  background: var(--b-color-picker-bg);
  border-radius: var(--b-color-picker-border-radius);
  box-shadow: var(--b-color-picker-shadow);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--b-color-picker-transition-duration),
    visibility var(--b-color-picker-transition-duration);
  outline: none;
}

.b-color-picker__panel--open {
  opacity: 1;
  visibility: visible;
}

/* Placement */
.b-color-picker__panel--bottom-left {
  top: calc(100% + var(--b-color-picker-gap));
  left: 0;
}

.b-color-picker__panel--bottom-center {
  top: calc(100% + var(--b-color-picker-gap));
  left: 50%;
  transform: translateX(-50%);
}

.b-color-picker__panel--bottom-right {
  top: calc(100% + var(--b-color-picker-gap));
  right: 0;
}

.b-color-picker__panel--top-left {
  bottom: calc(100% + var(--b-color-picker-gap));
  left: 0;
}

.b-color-picker__panel--top-center {
  bottom: calc(100% + var(--b-color-picker-gap));
  left: 50%;
  transform: translateX(-50%);
}

.b-color-picker__panel--top-right {
  bottom: calc(100% + var(--b-color-picker-gap));
  right: 0;
}

/* ── Arrow ── */
.b-color-picker__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--b-color-picker-bg);
  transform: rotate(45deg);
  pointer-events: none;
  box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
}

.b-color-picker__panel--bottom-left .b-color-picker__arrow,
.b-color-picker__panel--bottom-center .b-color-picker__arrow,
.b-color-picker__panel--bottom-right .b-color-picker__arrow {
  top: -4px;
  left: 16px;
}

.b-color-picker__panel--top-left .b-color-picker__arrow,
.b-color-picker__panel--top-center .b-color-picker__arrow,
.b-color-picker__panel--top-right .b-color-picker__arrow {
  bottom: -4px;
  left: 16px;
}

.b-color-picker__panel--no-arrow .b-color-picker__arrow {
  display: none;
}

/* ────────────────────────────────────────────
   Saturation panel
   ──────────────────────────────────────────── */
.b-color-picker__saturation {
  position: relative;
  width: 100%;
  height: var(--b-color-picker-saturation-height);
  border-radius: var(--b-color-picker-border-radius-sm);
  cursor: crosshair;
  overflow: hidden;
  touch-action: none;
}

.b-color-picker__saturation-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #fff, transparent);
}

.b-color-picker__saturation-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, #000);
}

.b-color-picker__saturation-handle {
  position: absolute;
  width: var(--b-color-picker-handler-size);
  height: var(--b-color-picker-handler-size);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.2),
    inset 0 0 1px 1px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ────────────────────────────────────────────
   Controls row (preview + sliders)
   ──────────────────────────────────────────── */
.b-color-picker__controls {
  display: flex;
  align-items: center;
  gap: var(--b-color-picker-gap);
  margin-top: var(--b-color-picker-gap);
}

.b-color-picker__preview {
  flex-shrink: 0;
  width: var(--b-color-picker-preview-size);
  height: var(--b-color-picker-preview-size);
  border-radius: 50%;
  background-image: conic-gradient(
    rgba(0, 0, 0, 0.06) 0 25%,
    transparent 0 50%,
    rgba(0, 0, 0, 0.06) 0 75%,
    transparent 0
  );
  background-size: 8px 8px;
  overflow: hidden;
}

.b-color-picker__preview-color {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.15);
}

.b-color-picker__sliders {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--b-color-picker-gap);
}

/* ────────────────────────────────────────────
   Hue slider
   ──────────────────────────────────────────── */
.b-color-picker__hue {
  position: relative;
  height: var(--b-color-picker-slider-height);
  border-radius: calc(var(--b-color-picker-slider-height) / 2);
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
  cursor: pointer;
  touch-action: none;
  outline: none;
}

.b-color-picker__hue:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 2px;
}

.b-color-picker__hue-handle {
  position: absolute;
  top: 50%;
  width: var(--b-color-picker-handler-size);
  height: var(--b-color-picker-handler-size);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ────────────────────────────────────────────
   Alpha slider
   ──────────────────────────────────────────── */
.b-color-picker__alpha {
  position: relative;
  height: var(--b-color-picker-slider-height);
  border-radius: calc(var(--b-color-picker-slider-height) / 2);
  background-image: conic-gradient(
    rgba(0, 0, 0, 0.06) 0 25%,
    transparent 0 50%,
    rgba(0, 0, 0, 0.06) 0 75%,
    transparent 0
  );
  background-size: 8px 8px;
  cursor: pointer;
  touch-action: none;
  outline: none;
}

.b-color-picker__alpha::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--b-color-picker-alpha-gradient);
}

.b-color-picker__alpha:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 2px;
}

.b-color-picker__alpha-handle {
  position: absolute;
  top: 50%;
  z-index: 1;
  width: var(--b-color-picker-handler-size);
  height: var(--b-color-picker-handler-size);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ────────────────────────────────────────────
   Input row
   ──────────────────────────────────────────── */
.b-color-picker__input-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--b-color-picker-gap);
}

.b-color-picker__format-btn {
  flex-shrink: 0;
  padding: 2px 4px;
  border: none;
  background: transparent;
  color: var(--b-color-picker-text-color-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--b-color-picker-border-radius-sm);
  line-height: 1.5;
}

.b-color-picker__format-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.b-color-picker__format-btn:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 1px;
}

.b-color-picker__format-label {
  flex-shrink: 0;
  padding: 2px 4px;
  color: var(--b-color-picker-text-color-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.b-color-picker__input {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 4px;
  border: var(--b-color-picker-border-width) solid var(--b-color-picker-input-border);
  border-radius: var(--b-color-picker-border-radius-sm);
  background: var(--b-color-picker-input-bg);
  color: var(--b-color-picker-text-color);
  font-size: 12px;
  text-align: center;
  outline: none;
}

.b-color-picker__input:focus {
  border-color: #4096ff;
}

.b-color-picker__alpha-input {
  width: var(--b-color-picker-alpha-input-width);
  height: 24px;
  padding: 0 4px;
  border: var(--b-color-picker-border-width) solid var(--b-color-picker-input-border);
  border-radius: var(--b-color-picker-border-radius-sm);
  background: var(--b-color-picker-input-bg);
  color: var(--b-color-picker-text-color);
  font-size: 12px;
  text-align: center;
  outline: none;
}

.b-color-picker__alpha-input:focus {
  border-color: #4096ff;
}

/* ────────────────────────────────────────────
   Presets
   ──────────────────────────────────────────── */
.b-color-picker__presets {
  margin-top: var(--b-color-picker-gap);
  border-top: 1px solid var(--b-color-picker-border-color);
  padding-top: var(--b-color-picker-gap);
}

.b-color-picker__preset-group + .b-color-picker__preset-group {
  margin-top: var(--b-color-picker-gap);
}

.b-color-picker__preset-label {
  font-size: 12px;
  color: var(--b-color-picker-text-color-secondary);
  margin-bottom: 4px;
}

.b-color-picker__preset-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.b-color-picker__preset-color {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: var(--b-color-picker-color-block-border-radius);
  cursor: pointer;
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.2);
  padding: 0;
  transition: transform var(--b-color-picker-transition-duration);
}

.b-color-picker__preset-color:hover {
  transform: scale(1.2);
}

.b-color-picker__preset-color:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 1px;
}

/* ────────────────────────────────────────────
   Clear row
   ──────────────────────────────────────────── */
.b-color-picker__clear-row {
  margin-top: var(--b-color-picker-gap);
  border-top: 1px solid var(--b-color-picker-border-color);
  padding-top: var(--b-color-picker-gap);
  display: flex;
  justify-content: flex-end;
}

.b-color-picker__clear-btn {
  padding: 2px 8px;
  border: var(--b-color-picker-border-width) solid var(--b-color-picker-border-color);
  border-radius: var(--b-color-picker-border-radius-sm);
  background: transparent;
  color: var(--b-color-picker-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  line-height: 1.5;
}

.b-color-picker__clear-btn:hover {
  border-color: #4096ff;
  color: #4096ff;
}

.b-color-picker__clear-btn:focus-visible {
  outline: 2px solid #4096ff;
  outline-offset: 1px;
}

/* ────────────────────────────────────────────
   Reduced motion
   ──────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-color-picker__panel {
    transition-duration: 0ms;
  }

  .b-color-picker__trigger {
    transition-duration: 0ms;
  }

  .b-color-picker__preset-color {
    transition-duration: 0ms;
  }
}
</style>
