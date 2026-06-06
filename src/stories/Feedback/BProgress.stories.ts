import BProgress from '@/components/BProgress/BProgress.vue';
import { BCommonColor, BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * BProgress — circular ring or linear bar showing completion of an operation.
 *
 * Pure CSS animation via `@property --b-progress-percent` so the conic-gradient
 * (circle) and bar width (linear) transition smoothly without JS. Supports
 * `v-model`, custom `max`, semantic `status`, indeterminate animation, and a
 * pluggable `formatter` for the label.
 */
const meta = {
  title: 'Feedback/Progress',
  component: BProgress,
  tags: ['autodocs'],
  argTypes: {
    percent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value (uncontrolled fallback when `v-model` is not used). Clamped to `[0, max]`.',
      table: { category: 'Props', defaultValue: { summary: '0' } },
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum value of the progress range. The displayed percentage is `(value / max) * 100`.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    shape: {
      control: 'select',
      options: ['linear', 'circle'],
      description: 'Visual shape — circular ring or horizontal bar.',
      table: { category: 'Props', defaultValue: { summary: 'circle' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size preset. Affects diameter for `circle` and track height for `linear`.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'select',
      options: Object.values(BCommonColor),
      description: 'Color family for the filled portion. Overridden by `status` when not `normal`.',
      table: { category: 'Props', defaultValue: { summary: 'primary' } },
    },
    status: {
      control: 'select',
      options: ['normal', 'success', 'error', 'warning'],
      description: 'Semantic status. `success` → success color, `error` → failure color, `warning` → warning color.',
      table: { category: 'Props', defaultValue: { summary: 'normal' } },
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to render the textual progress label.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Render an indefinite-duration animation instead of a value-driven fill. `aria-valuenow` is omitted while indeterminate.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    strokeWidth: {
      control: 'text',
      description: 'Override for the bar / ring thickness. Numeric values are treated as `px`; strings are passed through (`"1rem"`, `"12px"`, …).',
      table: { category: 'Props' },
    },
    formatter: {
      control: false,
      description: 'Custom label formatter `(value, max, percentage) => string`. Defaults to `${Math.round(percentage)}%`.',
      table: { category: 'Props' },
    },
    modelValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Two-way bound progress value. Takes precedence over `percent` when set.',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`BProgress` is a completion indicator with two shapes — a circular ring (default) and a horizontal linear bar. ' +
          'The fill animates smoothly via a typed CSS custom property (`@property`), so no JS runs the animation. ' +
          'It exposes the canonical `role="progressbar"` + `aria-valuenow` / `min` / `max` triplet, ' +
          'plus `aria-busy` while progressing or indeterminate.',
      },
    },
  },
} satisfies Meta<typeof BProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default circular ring at 35%. */
export const Default: Story = {
  args: {
    percent: 35,
    shape: 'circle',
    size: BCommonSize.Medium,
    color: BCommonColor.Primary,
    status: 'normal',
    showLabel: true,
    indeterminate: false,
  },
  parameters: {
    docs: { source: { code: `<BProgress :percent="35" aria-label="Progress" />` } },
  },
  render: (args) => ({
    components: { BProgress },
    setup: () => ({ args }),
    template: `<BProgress v-bind="args" aria-label="Progress" />`,
  }),
};

/** Horizontal bar — pairs the track with a right-aligned percentage label. */
export const Linear: Story = {
  parameters: {
    docs: { source: { code: `<BProgress shape="linear" :percent="60" aria-label="Progress" />` } },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="width: 320px;">
        <BProgress shape="linear" :percent="60" aria-label="Progress" />
      </div>
    `,
  }),
};

/** Circular ring — the default. */
export const Circle: Story = {
  parameters: {
    docs: { source: { code: `<BProgress shape="circle" :percent="60" aria-label="Progress" />` } },
  },
  render: () => ({
    components: { BProgress },
    template: `<BProgress shape="circle" :percent="60" aria-label="Progress" />`,
  }),
};

/** Three sizes — `sm`, `md`, `lg`. The track / ring thickness scales with the label. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress :percent="50" size="sm" />
<BProgress :percent="50" size="md" />
<BProgress :percent="50" size="lg" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="display:flex;align-items:center;gap:1.5rem;">
          <BProgress :percent="50" size="sm" aria-label="Small" />
          <BProgress :percent="50" size="md" aria-label="Medium" />
          <BProgress :percent="50" size="lg" aria-label="Large" />
        </div>
        <div style="width:320px;display:flex;flex-direction:column;gap:0.75rem;">
          <BProgress shape="linear" :percent="50" size="sm" aria-label="Small linear" />
          <BProgress shape="linear" :percent="50" size="md" aria-label="Medium linear" />
          <BProgress shape="linear" :percent="50" size="lg" aria-label="Large linear" />
        </div>
      </div>
    `,
  }),
};

/** All six color families on the circular ring. */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress :percent="60" color="primary" />
<BProgress :percent="60" color="secondary" />
<BProgress :percent="60" color="success" />
<BProgress :percent="60" color="failure" />
<BProgress :percent="60" color="warning" />
<BProgress :percent="60" color="info" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;">
        <BProgress :percent="60" color="primary" aria-label="Primary" />
        <BProgress :percent="60" color="secondary" aria-label="Secondary" />
        <BProgress :percent="60" color="success" aria-label="Success" />
        <BProgress :percent="60" color="failure" aria-label="Failure" />
        <BProgress :percent="60" color="warning" aria-label="Warning" />
        <BProgress :percent="60" color="info" aria-label="Info" />
      </div>
    `,
  }),
};

/** Use semantic `status` for stateful UIs — overrides `color` with the matching theme. */
export const Status: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress :percent="100" status="success" aria-label="Done" />
<BProgress :percent="42" status="error" aria-label="Failed" />
<BProgress :percent="78" status="warning" aria-label="Throttled" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;">
        <BProgress :percent="100" status="success" aria-label="Done" />
        <BProgress :percent="42" status="error" aria-label="Failed" />
        <BProgress :percent="78" status="warning" aria-label="Throttled" />
      </div>
    `,
  }),
};

/** Use a custom `max` for non-percentage ranges. The label still defaults to the percentage. */
export const CustomMax: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BProgress :percent="3" :max="10" shape="linear" aria-label="Files processed" />`,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="width:320px;">
        <BProgress :percent="3" :max="10" shape="linear" aria-label="Files processed" />
      </div>
    `,
  }),
};

/** Hide the textual label — useful inside cards or dense layouts. */
export const NoLabel: Story = {
  parameters: {
    docs: { source: { code: `<BProgress :percent="65" :show-label="false" aria-label="Loading" />` } },
  },
  render: () => ({
    components: { BProgress },
    template: `<BProgress :percent="65" :show-label="false" aria-label="Loading" />`,
  }),
};

/** Indefinite-duration animation when no concrete value is yet known. */
export const Indeterminate: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress indeterminate aria-label="Loading" />
<BProgress shape="linear" indeterminate aria-label="Loading" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <BProgress indeterminate aria-label="Loading circle" />
        <div style="width:320px;">
          <BProgress shape="linear" indeterminate aria-label="Loading bar" />
        </div>
      </div>
    `,
  }),
};

/** Tweak the bar / ring thickness via the `strokeWidth` prop. Numbers are treated as `px`. */
export const ThickStroke: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress :percent="60" :stroke-width="20" aria-label="Thick ring" />
<BProgress shape="linear" :percent="60" stroke-width="1.5rem" aria-label="Thick bar" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <BProgress :percent="60" :stroke-width="20" aria-label="Thick ring" />
        <div style="width:320px;">
          <BProgress shape="linear" :percent="60" stroke-width="1.5rem" aria-label="Thick bar" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/**
 * `v-model` binds the value bidirectionally. Drive it from any reactive source —
 * here, an interval increments it every 500ms.
 */
export const LiveProgress: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const value = ref(0);
let id;
onMounted(() => {
  id = setInterval(() => { value.value = (value.value + 5) % 105; }, 500);
});
onBeforeUnmount(() => clearInterval(id));
</script>

<template>
  <BProgress v-model="value" color="primary" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    setup() {
      const value = ref(0);
      let id: ReturnType<typeof setInterval> | undefined;
      onMounted(() => {
        id = setInterval(() => {
          value.value = (value.value + 5) % 105;
        }, 500);
      });
      onBeforeUnmount(() => {
        if (id) clearInterval(id);
      });
      return { value };
    },
    template: `<BProgress v-model="value" color="primary" aria-label="Live progress" />`,
  }),
};

/** Drop in a custom formatter to show the value in any units. */
export const CustomFormatter: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress
  shape="linear"
  :percent="3"
  :max="10"
  aria-label="Files processed"
  :formatter="(v, m) => \`\${v}/\${m} files\`"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    setup() {
      const formatter = (value: number, max: number) => `${value}/${max} files`;
      return { formatter };
    },
    template: `
      <div style="width:320px;">
        <BProgress shape="linear" :percent="3" :max="10" :formatter="formatter" aria-label="Files processed" />
      </div>
    `,
  }),
};

/**
 * Track a multi-step upload workflow: switch shape and status as the operation
 * progresses, ending in a green completion ring.
 */
export const UploadFlow: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress shape="linear" :percent="100" status="success" aria-label="document.pdf" />
<BProgress shape="linear" :percent="68" aria-label="video.mp4" />
<BProgress shape="linear" indeterminate aria-label="archive.zip" />
<BProgress shape="linear" :percent="20" status="error" aria-label="large-file.iso" />
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;width:360px;">
        <div>
          <div style="font-size:0.875rem;margin-bottom:0.25rem;">document.pdf — uploaded</div>
          <BProgress shape="linear" :percent="100" status="success" aria-label="document.pdf upload" />
        </div>
        <div>
          <div style="font-size:0.875rem;margin-bottom:0.25rem;">video.mp4 — uploading</div>
          <BProgress shape="linear" :percent="68" aria-label="video.mp4 upload" />
        </div>
        <div>
          <div style="font-size:0.875rem;margin-bottom:0.25rem;">archive.zip — preparing</div>
          <BProgress shape="linear" indeterminate aria-label="archive.zip upload" />
        </div>
        <div>
          <div style="font-size:0.875rem;margin-bottom:0.25rem;">large-file.iso — failed at 20%</div>
          <BProgress shape="linear" :percent="20" status="error" aria-label="large-file.iso upload" />
        </div>
      </div>
    `,
  }),
};

/** Out-of-range values clamp to the `[0, max]` interval — both the visual and `aria-valuenow`. */
export const ClampedRange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Both <code>-30</code> and <code>140</code> are clamped — <code>aria-valuenow</code> reflects the displayed value (0 / 100).',
      },
      source: {
        code: `
<BProgress :percent="-30" aria-label="Below zero" /><!-- clamped to 0 -->
<BProgress :percent="140" aria-label="Above max" /><!-- clamped to 100 -->
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;">
        <BProgress :percent="-30" aria-label="Below zero" />
        <BProgress :percent="140" status="success" aria-label="Above max" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Exposes <code>role="progressbar"</code> with the canonical
 * <code>aria-valuenow</code>/<code>min</code>/<code>max</code> triplet.
 * <code>aria-busy</code> is <code>true</code> only while progressing
 * (0 &lt; value &lt; max) or while indeterminate, so screen readers do not
 * vocalise every intermediate update. Indeterminate progressbars omit
 * <code>aria-valuenow</code> per the ARIA spec.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;">
        <BProgress :percent="0" aria-label="Idle" />
        <BProgress :percent="40" aria-label="Working" />
        <BProgress :percent="100" aria-label="Complete" />
        <BProgress indeterminate aria-label="Loading" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bars = c.getAllByRole('progressbar');
    expect(bars).toHaveLength(4);

    expect(bars[0]).toHaveAttribute('aria-valuenow', '0');
    expect(bars[0]).toHaveAttribute('aria-busy', 'false');

    expect(bars[1]).toHaveAttribute('aria-valuenow', '40');
    expect(bars[1]).toHaveAttribute('aria-busy', 'true');

    expect(bars[2]).toHaveAttribute('aria-valuenow', '100');
    expect(bars[2]).toHaveAttribute('aria-busy', 'false');

    // Indeterminate omits aria-valuenow but reports aria-busy=true.
    expect(bars[3]).not.toHaveAttribute('aria-valuenow');
    expect(bars[3]).toHaveAttribute('aria-busy', 'true');

    // Triplet is always present for aria-valuemin / aria-valuemax.
    bars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override <code>--b-progress-fill-color</code>, <code>--b-progress-track-color</code>,
 * and <code>--b-progress-bar-width</code> on the component root (or any ancestor) to
 * theme the component without writing new CSS rules.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BProgress
  :percent="65"
  style="
    --b-progress-fill-color: oklch(50% 0.18 290);
    --b-progress-track-color: oklch(92% 0.04 290);
    --b-progress-bar-width: 1.5rem;
    --b-progress-label-color: oklch(40% 0.18 290);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <BProgress
          :percent="65"
          aria-label="Themed circle"
          :style="{
            '--b-progress-fill-color': 'oklch(50% 0.18 290)',
            '--b-progress-track-color': 'oklch(92% 0.04 290)',
            '--b-progress-bar-width': '1.25rem',
            '--b-progress-label-color': 'oklch(40% 0.18 290)',
          }"
        />
        <div style="width:320px;">
          <BProgress
            shape="linear"
            :percent="65"
            aria-label="Themed bar"
            :style="{
              '--b-progress-fill-color': 'oklch(50% 0.18 290)',
              '--b-progress-track-color': 'oklch(92% 0.04 290)',
              '--b-progress-bar-width': '0.75rem',
              '--b-progress-label-color': 'oklch(40% 0.18 290)',
            }"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-progress-size', defaultValue: '6rem', description: 'Outer diameter of the circular ring (overridden per `size`).' },
  { token: '--b-progress-bar-width', defaultValue: '0.75rem', description: 'Track / ring thickness. Also exposed via the `strokeWidth` prop.' },
  { token: '--b-progress-font-size', defaultValue: '1rem', description: 'Inner / inline percentage label font size.' },
  { token: '--b-progress-track-color', defaultValue: 'oklch(92% 0.004 286.32)', description: 'Color of the unfilled portion of the track.' },
  { token: '--b-progress-fill-color', defaultValue: 'var(--color-primary)', description: 'Color of the filled portion. Set by the `color` / `status` props; override directly to retheme.' },
  { token: '--b-progress-label-color', defaultValue: 'oklch(0 0 0 / 0.85)', description: 'Color of the inline / inner percentage label.' },
  { token: '--b-progress-bg-color', defaultValue: 'white', description: 'Background of the circle\'s inner disc that punches a ring out of the conic-gradient.' },
  { token: '--b-progress-radius', defaultValue: '999px', description: 'Border radius of the linear track. Use a smaller value for square corners.' },
  { token: '--b-progress-transition-duration', defaultValue: '0.5s', description: 'Duration of the fill animation. Honored unless `prefers-reduced-motion: reduce` is set.' },
  { token: '--b-progress-percent', defaultValue: '0%', description: 'Current value as a percentage. Set internally by the component, but exposed as a `<percentage>`-typed custom property via `@property` so it animates.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Scoped CSS variables exposed by <code>BProgress</code>. Override on the component root or any ancestor — dark-mode reassigns these same vars, never new ones.',
      },
    },
  },
  render: () => ({
    components: { BProgress },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BProgress — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All CSS variables exposed by <code>BProgress</code>. Override them on the component root
          (<code>style="--b-progress-fill-color: …"</code>) or any ancestor.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">CSS Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tokens" :key="t.token" style="border-bottom:1px solid oklch(94% 0.003 260);">
              <td style="padding:8px 12px;font-family:monospace;color:oklch(40% 0.18 280);"><code>{{ t.token }}</code></td>
              <td style="padding:8px 12px;font-family:monospace;color:#595959;">{{ t.defaultValue }}</td>
              <td style="padding:8px 12px;">{{ t.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
