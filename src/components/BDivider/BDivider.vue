<script setup lang="ts">
import { computed } from 'vue';
import type {
  BDividerOrientation,
  BDividerSize,
  BDividerTitlePlacement,
  BDividerVariant,
} from './types.ts';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  orientation = 'horizontal',
  variant = 'solid',
  dashed = false,
  plain = true,
  size = 'large',
  titlePlacement = 'center',
} = defineProps<{
  /**
   * Line direction.
   * - `'horizontal'` - a full-width horizontal rule (default)
   * - `'vertical'`   - an inline vertical separator
   * @default 'horizontal'
   */
  orientation?: BDividerOrientation;
  /**
   * Line style.
   * - `'solid'`  - continuous line (default)
   * - `'dashed'` - dashed line
   * - `'dotted'` - dotted line
   * @default 'solid'
   */
  variant?: BDividerVariant;
  /**
   * Shorthand for `variant="dashed"`. Overridden when `variant` is also set.
   * Kept for AntD API compatibility.
   * @default false
   * @deprecated Prefer `variant` prop
   */
  dashed?: boolean;
  /**
   * Render the text in plain (normal weight) style rather than bold.
   * Only meaningful for horizontal dividers with content.
   * @default true
   */
  plain?: boolean;
  /**
   * Vertical spacing around horizontal dividers (ignored for vertical orientation).
   * - `'small'`  - tighter margin
   * - `'medium'` - medium margin
   * - `'large'`  - standard Ant Design margin (default)
   * @default 'large'
   */
  size?: BDividerSize;
  /**
   * Horizontal position of the title text inside a horizontal divider.
   * - `'start'`  - align text to the leading edge
   * - `'center'` - centre the text (default)
   * - `'end'`    - align text to the trailing edge
   * @default 'center'
   */
  titlePlacement?: BDividerTitlePlacement;
}>();

const slots = defineSlots<{
  /** Optional title or content placed inside the divider line. */
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const isVertical = computed(() => orientation === 'vertical');
const isHorizontal = computed(() => orientation === 'horizontal');

/** Whether there is slot content to render. */
const hasContent = computed(() => Boolean(slots.default));

/**
 * Resolve the effective line style.
 * `dashed` prop is a legacy alias for `variant="dashed"`.
 */
const effectiveVariant = computed<BDividerVariant>(() => {
  if (dashed && variant === 'solid') return 'dashed';
  return variant;
});

const rootClass = computed(() => [
  'b-divider',
  `b-divider--${orientation}`,
  `b-divider--${effectiveVariant.value}`,
  `b-divider--size-${size}`,
  {
    'b-divider--with-text': hasContent.value && isHorizontal.value,
    [`b-divider--text-${titlePlacement}`]: hasContent.value && isHorizontal.value,
    'b-divider--plain': plain,
  },
]);
</script>

<template>
  <!--
    Vertical divider: a presentational inline separator.
    role="separator" with aria-orientation covers both horizontal and vertical.
  -->
  <span v-if="isVertical" :class="rootClass" role="separator" aria-orientation="vertical" />

  <!--
    Horizontal divider WITHOUT content.
    <div role="separator"> is used instead of <hr> because axe-core evaluates
    <hr> (which carries implicit role="separator") for text-colour contrast by
    reading its CSS `color` property. A <div role="separator"> with no text
    content is exempt from that check (WCAG SC 1.4.3 applies only to text).
  -->
  <div
    v-else-if="isHorizontal && !hasContent"
    :class="rootClass"
    role="separator"
    aria-orientation="horizontal"
  />

  <!--
    Horizontal divider WITH content: <div role="separator"> wrapping the text.
    <hr> cannot contain children, so we fall back to a div.
  -->
  <div v-else :class="rootClass" role="separator" aria-orientation="horizontal">
    <span class="b-divider__content">
      <slot />
    </span>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (design tokens)
   Scoped to .b-divider — never on :root
   ──────────────────────────────────────────── */
.b-divider {
  /* AntD token: textPaddingInline → horizontal padding around inner text */
  --b-divider-text-padding-inline: 1em;

  /* AntD token: orientationMargin → fraction of width from the near edge for start/end text */
  --b-divider-orientation-margin: 0.05;

  /* AntD token: verticalMarginInline → horizontal margin on vertical dividers */
  --b-divider-vertical-margin-inline: 8px;

  /* Colour */
  --b-divider-color: oklch(88% 0.01 264); /* neutral border */
  --b-divider-text-color: oklch(32% 0.02 264);

  /* Typography */
  --b-divider-font-size: 1rem;
  --b-divider-font-weight-text: 500; /* "with-text" non-plain heading weight */

  /* Size (margin-block for horizontal) */
  --b-divider-margin-block-large: 1.5rem; /* size=large  (AntD default) */
  --b-divider-margin-block-medium: 0.75rem; /* size=medium */
  --b-divider-margin-block-small: 0.25rem; /* size=small  */

  /* Line geometry */
  --b-divider-line-width: 1px;
}

/* ── Dark mode ───────────────────────────────────────────────────────────
   Use only the attribute selector, consistent with every other component
   in this system (BAlert, BCard, etc.). The @media (prefers-color-scheme)
   query is deliberately omitted: Storybook controls the theme by toggling
   [data-prefers-color='dark'] on <html>. A media-query override would fire
   based on the OS/test-runner's colour scheme regardless of the canvas
   setting, producing light text (#c7cedb) on a white canvas — failing
   WCAG 1.4.3 contrast in automated a11y checks.
   ──────────────────────────────────────────────────────────────────────── */
[data-prefers-color='dark'] .b-divider {
  --b-divider-color: oklch(35% 0.02 264);
  --b-divider-text-color: oklch(85% 0.02 264);
}

/* ─────────────────────────────────────────────
   Horizontal — <div role=separator> (no text) or <div role=separator> (with text)
   ───────────────────────────────────────────── */
.b-divider--horizontal {
  display: block;
  clear: both;
  width: 100%;
  margin-block: var(--b-divider-margin-block-large);
  border: none;
  border-block-start: var(--b-divider-line-width) var(--b-divider-color);
  /* default style is overridden by variant classes below */
  border-block-start-style: solid;
  box-sizing: border-box;
}

/* Size variants (horizontal only) */
.b-divider--horizontal.b-divider--size-small {
  margin-block: var(--b-divider-margin-block-small);
}
.b-divider--horizontal.b-divider--size-medium {
  margin-block: var(--b-divider-margin-block-medium);
}
.b-divider--horizontal.b-divider--size-large {
  margin-block: var(--b-divider-margin-block-large);
}

/* ─────────────────────────────────────────────
   Horizontal WITH text
   ───────────────────────────────────────────── */
.b-divider--with-text {
  display: flex;
  align-items: center;
  border-block-start-style: none; /* lines rendered via ::before / ::after */
  white-space: nowrap;
  font-size: var(--b-divider-font-size);
  color: var(--b-divider-text-color);
  font-weight: var(--b-divider-font-weight-text);
}

/* Plain text: normal weight */
.b-divider--with-text.b-divider--plain {
  font-weight: normal;
}

/* Lines flanking the text */
.b-divider--with-text::before,
.b-divider--with-text::after {
  content: '';
  flex: 1;
  border-block-start: var(--b-divider-line-width) solid var(--b-divider-color);
}

/* variant overrides for ::before / ::after */
.b-divider--dashed.b-divider--with-text::before,
.b-divider--dashed.b-divider--with-text::after {
  border-block-start-style: dashed;
}
.b-divider--dotted.b-divider--with-text::before,
.b-divider--dotted.b-divider--with-text::after {
  border-block-start-style: dotted;
}

/* Text placement — start: push text to left edge */
.b-divider--text-start::before {
  /* orientationMargin is a unitless fraction (0.05 = 5% of width) */
  flex: calc(var(--b-divider-orientation-margin) * 1);
  min-width: 0;
}
.b-divider--text-start::after {
  flex: 1;
}

/* Text placement — end: push text to right edge */
.b-divider--text-end::after {
  flex: calc(var(--b-divider-orientation-margin) * 1);
  min-width: 0;
}
.b-divider--text-end::before {
  flex: 1;
}

/* Text placement — center (default): equal halves */
.b-divider--text-center::before,
.b-divider--text-center::after {
  flex: 1;
}

.b-divider__content {
  padding-inline: var(--b-divider-text-padding-inline);
  /* prevent the text itself from shrinking below its natural width */
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   Line-style variants (horizontal no-text)
   ───────────────────────────────────────────── */
.b-divider--horizontal:not(.b-divider--with-text).b-divider--dashed {
  border-block-start-style: dashed;
}
.b-divider--horizontal:not(.b-divider--with-text).b-divider--dotted {
  border-block-start-style: dotted;
}

/* ─────────────────────────────────────────────
   Vertical divider
   ───────────────────────────────────────────── */
.b-divider--vertical {
  display: inline-block;
  /* explicit height is not set — inherits from line-height of surrounding text */
  height: 0.9em;
  border-inline-start: var(--b-divider-line-width) solid var(--b-divider-color);
  border-block-start: none;
  vertical-align: middle;
  margin-inline: var(--b-divider-vertical-margin-inline);
}

.b-divider--vertical.b-divider--dashed {
  border-inline-start-style: dashed;
}
.b-divider--vertical.b-divider--dotted {
  border-inline-start-style: dotted;
}

/* ─────────────────────────────────────────────
   Reduced motion
   (dividers have no animations, but guard is here for completeness)
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-divider {
    transition: none;
  }
}
</style>
