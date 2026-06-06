<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import { BCommonColor } from '@/types.ts';
import { computed, resolveDynamicComponent, useSlots } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const {
  href,
  to,
  target,
  rel,
  disabled = false,
  external = false,
  underline = 'hover',
  color = BCommonColor.Primary,
  as,
  showExternalIcon = true,
} = defineProps<{
  /**
   * URL for an anchor link. When set (and `to` is not), the component
   * renders as an `<a href="...">`.
   * @example 'https://example.com'
   */
  href?: string;
  /**
   * Vue Router target. When set, the component renders as `<RouterLink>`
   * (gracefully falls back to `<a>` if vue-router is not registered).
   */
  to?: RouteLocationRaw;
  /**
   * Anchor `target` attribute. Forced to `_blank` when `external` is true.
   * @example '_blank' | '_self' | '_parent' | '_top'
   */
  target?: string;
  /**
   * Anchor `rel` attribute. When `external` is true the value is augmented
   * with `noopener noreferrer`.
   */
  rel?: string;
  /**
   * Disables interaction. `<a>` and `<RouterLink>` are downgraded to a
   * `<span aria-disabled="true">` since native anchors do not support `:disabled`.
   * @default false
   */
  disabled?: boolean;
  /**
   * Marks the link as external — forces `target="_blank"`,
   * `rel="noopener noreferrer"`, and renders a trailing external-link icon.
   * @default false
   */
  external?: boolean;
  /**
   * Underline behaviour.
   * - `always`  — text-decoration always visible
   * - `hover`   — only on hover / focus-visible
   * - `none`    — never
   * @default 'hover'
   */
  underline?: 'always' | 'hover' | 'none';
  /**
   * Color family applied to the link text.
   * @default 'primary'
   */
  color?: `${BCommonColor}`;
  /**
   * Explicit element override. When set takes the highest priority over
   * `to` / `href`. `'a'` requires either `href` or generates a no-op
   * placeholder; `'button'` renders `<button type="button">`.
   */
  as?: 'a' | 'button';
  /**
   * Whether to render the trailing external-link icon when `external` is true.
   * @default true
   */
  showExternalIcon?: boolean;
}>();

const emit = defineEmits<{
  /** Fired on click. Suppressed when disabled. */
  click: [event: MouseEvent];
}>();

// ─────────────────────────────────────────────
// Router availability (SSR-safe)
// ─────────────────────────────────────────────
const hasRouterLink = computed(() => {
  const resolved = resolveDynamicComponent('RouterLink');
  return typeof resolved !== 'string';
});

// ─────────────────────────────────────────────
// Element resolution priority:
// 1. `as` prop  →  explicit override
// 2. `to`       →  RouterLink (or <a> fallback if router not registered)
// 3. `href`     →  <a>
// 4. otherwise  →  <button type="button">
// When disabled, <a>/<RouterLink> are downgraded to <span aria-disabled="true">.
// ─────────────────────────────────────────────
type ResolvedTag = 'a' | 'button' | 'span' | 'router-link';

const resolvedTag = computed<ResolvedTag>(() => {
  if (as === 'button') return 'button';
  if (as === 'a') return disabled ? 'span' : 'a';
  if (to !== undefined && to !== null) {
    if (!hasRouterLink.value) return disabled ? 'span' : 'a';
    return disabled ? 'span' : 'router-link';
  }
  if (href !== undefined) return disabled ? 'span' : 'a';
  return 'button';
});

// Stringify a `to` prop into a usable href when RouterLink is unavailable.
const fallbackHref = computed(() => {
  if (to === undefined || to === null) return undefined;
  if (typeof to === 'string') return to;
  if (typeof to === 'object' && 'path' in to && typeof to.path === 'string') return to.path;
  try {
    return JSON.stringify(to);
  } catch {
    return undefined;
  }
});

// ─────────────────────────────────────────────
// target / rel — `external` forces _blank + noopener noreferrer
// ─────────────────────────────────────────────
const computedTarget = computed(() => {
  if (external) return '_blank';
  return target;
});

const computedRel = computed(() => {
  const tokens = new Set<string>();
  if (rel) rel.split(/\s+/).filter(Boolean).forEach((t) => tokens.add(t));
  if (external || computedTarget.value === '_blank') {
    tokens.add('noopener');
    tokens.add('noreferrer');
  }
  return tokens.size > 0 ? Array.from(tokens).join(' ') : undefined;
});

// ─────────────────────────────────────────────
// Click handling — block when disabled
// ─────────────────────────────────────────────
const onClick = (event: MouseEvent) => {
  if (disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
};

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
const hasLeading = computed(() => !!slots.leading);
const hasTrailing = computed(() => !!slots.trailing);
const showExternalGlyph = computed(
  () => external && showExternalIcon && !hasTrailing.value,
);

// ─────────────────────────────────────────────
// Class binding (CSS-first)
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-link',
  `b-link--${color}`,
  `b-link--underline-${underline}`,
  {
    'b-link--disabled': disabled,
    'b-link--external': external,
  },
]);
</script>

<template>
  <RouterLink
    v-if="resolvedTag === 'router-link'"
    :to="to!"
    :class="rootClasses"
    :target="computedTarget"
    :rel="computedRel"
    v-bind="$attrs"
    @click="onClick"
  >
    <span v-if="hasLeading" class="b-link__leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span class="b-link__label">
      <slot />
    </span>
    <span v-if="hasTrailing" class="b-link__trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <BIcon
      v-if="showExternalGlyph"
      class="b-link__external-icon"
      icon="up-right-from-square"
      size="xs"
      aria-hidden="true"
    />
  </RouterLink>

  <a
    v-else-if="resolvedTag === 'a'"
    :class="rootClasses"
    :href="href ?? fallbackHref"
    :target="computedTarget"
    :rel="computedRel"
    v-bind="$attrs"
    @click="onClick"
  >
    <span v-if="hasLeading" class="b-link__leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span class="b-link__label">
      <slot />
    </span>
    <span v-if="hasTrailing" class="b-link__trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <BIcon
      v-if="showExternalGlyph"
      class="b-link__external-icon"
      icon="up-right-from-square"
      size="xs"
      aria-hidden="true"
    />
  </a>

  <button
    v-else-if="resolvedTag === 'button'"
    :class="rootClasses"
    type="button"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
    v-bind="$attrs"
    @click="onClick"
  >
    <span v-if="hasLeading" class="b-link__leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span class="b-link__label">
      <slot />
    </span>
    <span v-if="hasTrailing" class="b-link__trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <BIcon
      v-if="showExternalGlyph"
      class="b-link__external-icon"
      icon="up-right-from-square"
      size="xs"
      aria-hidden="true"
    />
  </button>

  <span
    v-else
    :class="rootClasses"
    role="link"
    aria-disabled="true"
    v-bind="$attrs"
  >
    <span v-if="hasLeading" class="b-link__leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span class="b-link__label">
      <slot />
    </span>
    <span v-if="hasTrailing" class="b-link__trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <BIcon
      v-if="showExternalGlyph"
      class="b-link__external-icon"
      icon="up-right-from-square"
      size="xs"
      aria-hidden="true"
    />
  </span>
</template>

<style>
.b-link {
  /* ── Component tokens ── */
  --b-link-color: var(--color-primary, oklch(55% 0.169 237.323));
  --b-link-color-hover: var(--color-primary-hover, oklch(48% 0.158 241.966));
  --b-link-color-disabled: oklch(0 0 0 / 0.35);
  --b-link-underline-color: currentColor;
  --b-link-underline-offset: 2px;
  --b-link-underline-thickness: 1px;
  --b-link-gap: 0.25rem;
  --b-link-focus-outline-color: currentColor;
  --b-link-focus-outline-width: 2px;
  --b-link-focus-outline-offset: 2px;
  --b-link-transition-duration: 150ms;

  display: inline-flex;
  align-items: center;
  gap: var(--b-link-gap);
  color: var(--b-link-color);
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  line-height: inherit;
  cursor: pointer;
  text-decoration: none;
  text-decoration-color: var(--b-link-underline-color);
  text-underline-offset: var(--b-link-underline-offset);
  text-decoration-thickness: var(--b-link-underline-thickness);
  transition:
    color var(--b-link-transition-duration) ease,
    text-decoration-color var(--b-link-transition-duration) ease;
}

.b-link:hover:not(.b-link--disabled),
.b-link:focus-visible:not(.b-link--disabled) {
  color: var(--b-link-color-hover);
}

.b-link:focus-visible {
  outline: var(--b-link-focus-outline-width) solid var(--b-link-focus-outline-color);
  outline-offset: var(--b-link-focus-outline-offset);
  border-radius: 2px;
}

/* ── Underline modes (CSS-first) ── */
.b-link--underline-always {
  text-decoration: underline;
}

.b-link--underline-hover:hover:not(.b-link--disabled),
.b-link--underline-hover:focus-visible:not(.b-link--disabled) {
  text-decoration: underline;
}

.b-link--underline-none,
.b-link--underline-none:hover {
  text-decoration: none;
}

/* ── Color families ── */
.b-link--primary {
  --b-link-color: var(--color-primary, oklch(55% 0.169 237.323));
  --b-link-color-hover: var(--color-primary-hover, oklch(48% 0.158 241.966));
}
.b-link--secondary {
  --b-link-color: oklch(0 0 0 / 0.85);
  --b-link-color-hover: var(--color-secondary-hover, oklch(87.1% 0.006 286.286));
}
.b-link--success {
  --b-link-color: var(--color-success, oklch(50% 0.17 149.579));
  --b-link-color-hover: var(--color-success-hover, oklch(43% 0.15 149.214));
}
.b-link--failure {
  --b-link-color: var(--color-failure, oklch(55% 0.22 25.331));
  --b-link-color-hover: var(--color-failure-hover, oklch(49% 0.21 27.325));
}
.b-link--warning {
  --b-link-color: var(--color-warning, oklch(55% 0.16 55.934));
  --b-link-color-hover: var(--color-warning-hover, oklch(48% 0.15 47.604));
}
.b-link--info {
  --b-link-color: var(--color-info, oklch(55% 0.2 259.815));
  --b-link-color-hover: var(--color-info-hover, oklch(48% 0.2 262.881));
}

/* ── Disabled ── */
.b-link--disabled {
  color: var(--b-link-color-disabled);
  cursor: not-allowed;
  pointer-events: none;
  text-decoration: none;
}

button.b-link:disabled {
  color: var(--b-link-color-disabled);
  cursor: not-allowed;
}

/* ── Sub-elements ── */
.b-link__leading,
.b-link__trailing,
.b-link__external-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 1;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-link {
  --b-link-color-disabled: oklch(100% 0 0 / 0.35);
}
[data-prefers-color='dark'] .b-link--secondary {
  --b-link-color: oklch(100% 0 0 / 0.85);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-link {
    --b-link-color-disabled: oklch(100% 0 0 / 0.35);
  }
  [data-prefers-color='system'] .b-link--secondary {
    --b-link-color: oklch(100% 0 0 / 0.85);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-link {
    transition: none;
  }
}
</style>
