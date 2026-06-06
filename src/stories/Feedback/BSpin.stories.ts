import { BSpin } from '@/components';
import { BSpinSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BSpin — loading indicator with optional tip, delay, fullscreen, and nested wrap modes.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Spin',
  component: BSpin,
  tags: ['autodocs'],
  argTypes: {
    spinning: {
      control: 'boolean',
      description: 'Whether the spinner is active.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'select',
      options: Object.values(BSpinSize),
      description: 'Size of the spinner indicator.',
      table: { category: 'Props', defaultValue: { summary: BSpinSize.Default } },
    },
    tip: {
      control: 'text',
      description: 'Descriptive text below the spinner.',
      table: { category: 'Props' },
    },
    delay: {
      control: 'number',
      description: 'Delay in ms before spinner shows (prevents flicker).',
      table: { category: 'Props', defaultValue: { summary: '0' } },
    },
    fullscreen: {
      control: 'boolean',
      description: 'Display as a fullscreen overlay.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    default: { description: 'Content to wrap with a dimmed overlay while loading.', table: { category: 'Slots' } },
    indicator: { description: 'Slot to override the default dot indicator.', table: { category: 'Slots' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSpin</code> component displays a loading indicator.<br><br>' +
          'It supports three <strong>sizes</strong> (small, default, large), an optional <strong>tip</strong> text, ' +
          'a <strong>delay</strong> to prevent flicker, <strong>fullscreen</strong> overlay mode, and a <strong>nested</strong> mode ' +
          'that wraps content with a dimmed overlay while loading.<br>' +
          'Accessible with <code>role="status"</code> and respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BSpin>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — standalone spinner. */
export const Default: Story = {
  args: {
    spinning: true,
    size: BSpinSize.Default,
    tip: '',
    delay: 0,
    fullscreen: false,
  },
  parameters: { docs: { source: { code: `<BSpin />` } } },
  render: (args) => ({
    components: { BSpin },
    setup: () => ({ args }),
    template: `<BSpin v-bind="args" />`,
  }),
};

/** Three sizes — `small`, `default`, `large`. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSpin size="small" />
<BSpin />
<BSpin size="large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    template: `
      <div style="display:flex;align-items:center;gap:2rem;">
        <div style="text-align:center;">
          <BSpin size="small" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Small</p>
        </div>
        <div style="text-align:center;">
          <BSpin />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Default</p>
        </div>
        <div style="text-align:center;">
          <BSpin size="large" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Large</p>
        </div>
      </div>
    `,
  }),
};

/** Spinner with a descriptive tip below. */
export const WithTip: Story = {
  parameters: { docs: { source: { code: `<BSpin tip="Loading data..." />` } } },
  render: () => ({
    components: { BSpin },
    template: `
      <div style="display:flex;align-items:flex-start;gap:2rem;">
        <BSpin size="small" tip="Loading..." />
        <BSpin tip="Loading data..." />
        <BSpin size="large" tip="Please wait..." />
      </div>
    `,
  }),
};

/** Wrap content with a translucent overlay and blur while loading. */
export const Nested: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSpin :spinning="loading" tip="Loading...">
  <div>Your content here</div>
</BSpin>
        `,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    setup: () => ({ loading: ref(true) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <button
          data-testid="toggle-btn"
          style="align-self:flex-start;padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;cursor:pointer;"
          @click="loading = !loading"
        >
          {{ loading ? 'Stop' : 'Start' }} loading
        </button>
        <BSpin :spinning="loading" tip="Loading...">
          <div style="padding:2rem;border:1px solid #e8e8e8;border-radius:0.5rem;background:#fafafa;">
            <p style="margin:0 0 0.5rem"><strong>Card Title</strong></p>
            <p style="margin:0;color:#666;">Content is blurred and dimmed while loading.</p>
          </div>
        </BSpin>
      </div>
    `,
  }),
};

/** Anti-flicker: spinner only appears after `delay` ms. */
export const Delay: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSpin :spinning="loading" :delay="500" tip="Loading...">content</BSpin>`,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    setup() {
      const loading = ref(false);
      function toggle() {
        loading.value = !loading.value;
      }
      return { loading, toggle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <button
          style="align-self:flex-start;padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;cursor:pointer;"
          @click="toggle"
        >
          {{ loading ? 'Stop' : 'Start' }} loading (500ms delay)
        </button>
        <BSpin :spinning="loading" :delay="500" tip="Loading...">
          <div style="padding:2rem;border:1px solid #e8e8e8;border-radius:0.5rem;background:#fafafa;">
            <p style="margin:0;">This spinner has a 500ms delay before appearing.</p>
          </div>
        </BSpin>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Replace the dot indicator with a custom SVG via the `indicator` slot. */
export const CustomIndicator: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSpin tip="Custom spinner...">
  <template #indicator>
    <svg>...</svg>
  </template>
</BSpin>
        `,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    template: `
      <div style="display:flex;align-items:flex-start;gap:2rem;">
        <BSpin tip="Custom indicator">
          <template #indicator>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation:custom-spin 1s linear infinite;">
              <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0-2.83-2.83M9.76 9.76 6.93 6.93" stroke="oklch(55% 0.169 237.323)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </template>
        </BSpin>
        <style>
          @keyframes custom-spin { to { transform: rotate(360deg) } }
        </style>
      </div>
    `,
  }),
};

/** Toggle the nested spinner — `loading` flips overlay, blur, and `aria-busy`. */
export const NestedToggle: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<button @click="loading = !loading">Toggle</button>
<BSpin :spinning="loading" tip="Loading...">
  <div>Card content</div>
</BSpin>
        `,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    setup: () => ({ loading: ref(true) }),
    template: `
      <div>
        <button data-testid="toggle" @click="loading = !loading" style="margin-bottom:1rem;padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;cursor:pointer;">
          Toggle
        </button>
        <BSpin :spinning="loading" tip="Loading...">
          <div data-testid="content" style="padding:2rem;border:1px solid #e8e8e8;border-radius:0.5rem;">
            Card content
          </div>
        </BSpin>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially spinning
    expect(canvasElement.querySelector('.b-spin__overlay-container')).toBeTruthy();
    expect(canvasElement.querySelector('.b-spin__content--blurred')).toBeTruthy();
    expect(canvasElement.querySelector('.b-spin__content')?.getAttribute('aria-busy')).toBe('true');

    // Stop
    await userEvent.click(canvas.getByTestId('toggle'));
    await waitFor(() => {
      expect(canvasElement.querySelector('.b-spin__overlay-container')).toBeNull();
      expect(canvasElement.querySelector('.b-spin__content--blurred')).toBeNull();
    });

    // Start again
    await userEvent.click(canvas.getByTestId('toggle'));
    await waitFor(() => {
      expect(canvasElement.querySelector('.b-spin__overlay-container')).toBeTruthy();
      expect(canvasElement.querySelector('.b-spin__content--blurred')).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * `role="status"` for the spinner region. `aria-label="Loading"` when no tip,
 * or `aria-describedby` referencing the tip element when present.
 * Nested content gets `aria-busy="true"`. Indicator is `aria-hidden="true"`.
 * Animation respects `prefers-reduced-motion`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The spinner uses <code>role="status"</code> to announce loading. With a tip, <code>aria-describedby</code> links to it. In nested mode, <code>aria-busy</code> is set on the content. The indicator is <code>aria-hidden</code> (decorative). Animations respect <code>prefers-reduced-motion</code>.',
      },
    },
  },
  render: () => ({
    components: { BSpin },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Standalone (aria-label)</h4>
          <BSpin data-testid="standalone" />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">With tip (aria-describedby)</h4>
          <BSpin data-testid="with-tip" tip="Loading resources..." />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Nested (aria-busy on content)</h4>
          <BSpin data-testid="nested" :spinning="true" tip="Refreshing...">
            <div style="padding:1rem;border:1px solid #e8e8e8;border-radius:0.5rem;">
              Nested content with aria-busy
            </div>
          </BSpin>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const statusEls = canvasElement.querySelectorAll('[role="status"]');
    expect(statusEls.length).toBeGreaterThanOrEqual(3);

    const standalone = statusEls[0];
    expect(standalone.getAttribute('aria-label')).toBe('Loading');

    const withTip = statusEls[1];
    const tipId = withTip.getAttribute('aria-describedby');
    expect(tipId).toBeTruthy();
    const tipEl = canvasElement.querySelector(`#${tipId}`);
    expect(tipEl?.textContent).toContain('Loading resources...');

    const nestedContent = canvasElement.querySelector('.b-spin__content');
    expect(nestedContent?.getAttribute('aria-busy')).toBe('true');

    const indicators = canvasElement.querySelectorAll('.b-spin__indicator');
    indicators.forEach((indicator) => {
      expect(indicator.getAttribute('aria-hidden')).toBe('true');
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-spin-dot-color`, `--b-spin-tip-color`, and `--b-spin-animation-duration`
 * (or any other token) to customise the spinner.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-spin-dot-color</code>, <code>--b-spin-tip-color</code>, and <code>--b-spin-animation-duration</code> on the component root.',
      },
      source: {
        code: `<BSpin tip="Custom themed..." style="--b-spin-dot-color:#e94560;--b-spin-tip-color:#e94560;--b-spin-animation-duration:0.8s;" />`,
      },
    },
  },
  render: () => ({
    components: { BSpin },
    template: `
      <div style="display:flex;align-items:flex-start;gap:3rem;">
        <div style="text-align:center;">
          <BSpin tip="Default theme" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Default</p>
        </div>
        <div style="text-align:center;">
          <BSpin
            tip="Red theme"
            style="--b-spin-dot-color:#e94560;--b-spin-tip-color:#e94560;--b-spin-animation-duration:0.8s;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Red, faster</p>
        </div>
        <div style="text-align:center;">
          <BSpin
            tip="Green theme"
            style="--b-spin-dot-color:#52c41a;--b-spin-tip-color:#52c41a;--b-spin-animation-duration:1.6s;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Green, slower</p>
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
  { token: '--b-spin-dot-size-default', defaultValue: '1.25rem', description: 'Default spinner dot size.' },
  { token: '--b-spin-dot-size-large', defaultValue: '2rem', description: 'Large spinner dot size.' },
  { token: '--b-spin-dot-size-small', defaultValue: '0.875rem', description: 'Small spinner dot size.' },
  { token: '--b-spin-dot-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the spinner dots.' },
  { token: '--b-spin-tip-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the loading tip text.' },
  { token: '--b-spin-tip-font-size', defaultValue: '0.875rem', description: 'Font size of the loading tip.' },
  { token: '--b-spin-overlay-bg', defaultValue: 'oklch(100% 0 0 / 50%)', description: 'Background of the overlay shown over wrapped content.' },
  { token: '--b-spin-fullscreen-bg', defaultValue: 'oklch(0% 0 0 / 45%)', description: 'Background of the fullscreen mask.' },
  { token: '--b-spin-content-blur', defaultValue: '0.5px', description: 'Blur applied to wrapped content while loading.' },
  { token: '--b-spin-animation-duration', defaultValue: '1.2s', description: 'Duration of the dot rotation animation.' },
  { token: '--b-spin-transition-duration', defaultValue: '300ms', description: 'Fade-in/out duration of the spinner overlay.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BSpin</code>. Override on the component root or any ancestor.',
      },
    },
  },
  render: () => ({
    components: { BSpin },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BSpin — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-spin</code>. Override inline or via a CSS class.
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
