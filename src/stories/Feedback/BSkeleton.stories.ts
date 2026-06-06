import {
  BSkeleton,
  BSkeletonAvatar,
  BSkeletonButton,
  BSkeletonImage,
  BSkeletonInput,
  BSkeletonNode,
} from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BSkeleton — placeholder shown while content loads.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Skeleton',
  component: BSkeleton,
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Show animated shimmer effect.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    avatar: {
      control: 'boolean',
      description: 'Show avatar placeholder. Pass an object to configure shape/size/active.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    title: {
      control: 'boolean',
      description: 'Show title placeholder. Pass an object to configure width.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    paragraph: {
      control: 'boolean',
      description: 'Show paragraph placeholder. Pass an object to configure rows / width.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    round: {
      control: 'boolean',
      description: 'Round corners on title and paragraph rows.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'When false, renders the default slot (real content) instead of placeholders.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'true' } },
    },
    default: { description: 'Real content to render when `loading` is false.', table: { category: 'Slots' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSkeleton</code> component shows a placeholder while content is loading.<br><br>' +
          'It supports an optional <strong>avatar</strong>, <strong>title</strong>, and <strong>paragraph</strong> ' +
          '(each individually configurable), an <strong>active</strong> shimmer effect, and <strong>round</strong> corners.<br>' +
          'Sub-components: <code>BSkeletonAvatar</code>, <code>BSkeletonButton</code>, <code>BSkeletonInput</code>, ' +
          '<code>BSkeletonImage</code>, <code>BSkeletonNode</code>.<br>' +
          'Exposes <code>role="status"</code> and respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — title + paragraph placeholder. */
export const Default: Story = {
  args: {
    active: false,
    avatar: false,
    title: true,
    paragraph: true,
    round: false,
    loading: true,
  },
  parameters: { docs: { source: { code: `<BSkeleton />` } } },
  render: (args) => ({
    components: { BSkeleton },
    setup: () => ({ args }),
    template: `
      <BSkeleton v-bind="args">
        <p>Real content shown when loading is false.</p>
      </BSkeleton>
    `,
  }),
};

/** Static placeholder (no shimmer). */
export const Static: Story = {
  parameters: { docs: { source: { code: `<BSkeleton />` } } },
  render: () => ({
    components: { BSkeleton },
    template: `<BSkeleton />`,
  }),
};

/** Animated shimmer effect — default for visible loading states. */
export const Active: Story = {
  parameters: { docs: { source: { code: `<BSkeleton active />` } } },
  render: () => ({
    components: { BSkeleton },
    template: `<BSkeleton active />`,
  }),
};

/** Show an avatar placeholder alongside the text rows. */
export const WithAvatar: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSkeleton active avatar />
<BSkeleton active :avatar="{ shape: 'square', size: 'large' }" />
        `,
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BSkeleton active avatar />
        <BSkeleton active :avatar="{ shape: 'square', size: 'large' }" />
      </div>
    `,
  }),
};

/** Configure title width, paragraph row count, and per-row widths. */
export const Configurable: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSkeleton active :title="{ width: '40%' }" :paragraph="{ rows: 5 }" />
<BSkeleton active :paragraph="{ rows: 3, width: [200, 300, '50%'] }" />
        `,
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BSkeleton active :title="{ width: '40%' }" :paragraph="{ rows: 5 }" />
        <BSkeleton active :paragraph="{ rows: 3, width: [200, 300, '50%'] }" />
      </div>
    `,
  }),
};

/** Pill-rounded corners on title and paragraph rows. */
export const Round: Story = {
  parameters: { docs: { source: { code: `<BSkeleton round active />` } } },
  render: () => ({
    components: { BSkeleton },
    template: `<BSkeleton round active />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Toggle `loading` to swap between placeholder and real content. */
export const LoadingToggle: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<button @click="loading = !loading">{{ loading ? 'Stop' : 'Start' }} loading</button>
<BSkeleton :loading="loading" active avatar>
  <article>Real content shown when loading=false.</article>
</BSkeleton>
        `,
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    setup: () => ({ loading: ref(true) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <button
          data-testid="toggle-loading"
          style="align-self:flex-start;padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;cursor:pointer;"
          @click="loading = !loading"
        >
          {{ loading ? 'Stop' : 'Start' }} loading
        </button>
        <BSkeleton :loading="loading" active avatar>
          <article data-testid="real-content" style="display:flex;gap:1rem;">
            <div style="width:32px;height:32px;border-radius:50%;background:#1677ff;flex-shrink:0;"/>
            <div>
              <h4 style="margin:0;">Real article title</h4>
              <p style="margin:0.25rem 0 0;color:#666;">Body content rendered when loading is false.</p>
            </div>
          </article>
        </BSkeleton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially loading: skeleton visible, real content hidden
    expect(canvasElement.querySelector('.b-skeleton')).toBeTruthy();
    expect(canvas.queryByTestId('real-content')).toBeNull();

    // Toggle off
    await userEvent.click(canvas.getByTestId('toggle-loading'));
    await waitFor(() => {
      expect(canvasElement.querySelector('.b-skeleton')).toBeNull();
      expect(canvas.getByTestId('real-content')).toBeTruthy();
    });

    // Toggle back on
    await userEvent.click(canvas.getByTestId('toggle-loading'));
    await waitFor(() => {
      expect(canvasElement.querySelector('.b-skeleton')).toBeTruthy();
    });
  },
};

/** Skeleton primitives — `Avatar`, `Button`, `Input`, `Image`, `Node` for ad-hoc placeholders. */
export const SkeletonPrimitives: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSkeletonAvatar active />
<BSkeletonAvatar active shape="square" size="large" />
<BSkeletonButton active />
<BSkeletonInput active />
<BSkeletonImage active />
<BSkeletonNode active>📦</BSkeletonNode>
        `,
      },
    },
  },
  render: () => ({
    components: {
      BSkeletonAvatar,
      BSkeletonButton,
      BSkeletonImage,
      BSkeletonInput,
      BSkeletonNode,
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <BSkeletonAvatar active />
          <BSkeletonAvatar active shape="square" size="large" />
          <BSkeletonAvatar active :size="64" />
        </div>
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <BSkeletonButton active size="small" />
          <BSkeletonButton active />
          <BSkeletonButton active size="large" />
          <BSkeletonButton active shape="round" />
          <BSkeletonButton active shape="circle" />
        </div>
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <BSkeletonInput active size="small" />
          <BSkeletonInput active />
          <BSkeletonInput active size="large" />
        </div>
        <div style="display:flex;align-items:center;gap:1rem;">
          <BSkeletonImage active />
          <BSkeletonNode active>📦</BSkeletonNode>
        </div>
      </div>
    `,
  }),
};

/** Card-like layout: avatar + title + paragraph composing a list-row placeholder. */
export const ListRowPlaceholder: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<div v-for="i in 3" :key="i">
  <BSkeleton active avatar :paragraph="{ rows: 2 }" />
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <BSkeleton v-for="i in 3" :key="i" active avatar :paragraph="{ rows: 2 }" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Skeleton root has `role="status"` with `aria-live="polite"` and `aria-label="Loading"`.
 * Decorative shapes (title, paragraph rows, avatar, button, input, image, node) are `aria-hidden`.
 * When `loading` flips to false, the skeleton is replaced with real content (announced naturally).
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The skeleton root has <code>role="status"</code> with <code>aria-live="polite"</code> and <code>aria-label="Loading"</code>. Decorative shapes are <code>aria-hidden</code>.',
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    template: `<BSkeleton data-testid="sk" active avatar :paragraph="{ rows: 3 }" />`,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.b-skeleton')!;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-live')).toBe('polite');
    expect(root.getAttribute('aria-label')).toBe('Loading');

    expect(canvasElement.querySelector('.b-skeleton__title')?.getAttribute('aria-hidden')).toBe('true');
    expect(canvasElement.querySelector('.b-skeleton__paragraph')?.getAttribute('aria-hidden')).toBe('true');
    expect(canvasElement.querySelector('.b-skeleton-avatar')?.getAttribute('aria-hidden')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-skeleton-gradient-from-color`, `--b-skeleton-gradient-to-color`,
 * and `--b-skeleton-title-height` (or any other token) on the component root.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-skeleton-gradient-from-color</code>, <code>--b-skeleton-gradient-to-color</code>, <code>--b-skeleton-title-height</code>, and <code>--b-skeleton-paragraph-row-gap</code> on the component root to recolor / resize.',
      },
      source: {
        code: `
<BSkeleton
  active
  avatar
  style="
    --b-skeleton-gradient-from-color: #dbeafe;
    --b-skeleton-gradient-to-color: #93c5fd;
    --b-skeleton-title-height: 24px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Default tokens</h4>
          <BSkeleton active avatar />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Custom: blue gradient + larger title</h4>
          <BSkeleton
            active
            avatar
            style="--b-skeleton-gradient-from-color:#dbeafe;--b-skeleton-gradient-to-color:#93c5fd;--b-skeleton-title-height:24px;"
          />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Custom: rose gradient + tighter rows</h4>
          <BSkeleton
            active
            avatar
            style="--b-skeleton-gradient-from-color:#ffe4e6;--b-skeleton-gradient-to-color:#fda4af;--b-skeleton-paragraph-row-gap:8px;--b-skeleton-paragraph-margin-top:16px;"
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
  { token: '--b-skeleton-gradient-from-color', defaultValue: 'oklch(93% 0 0)', description: 'Base placeholder color.' },
  { token: '--b-skeleton-gradient-to-color', defaultValue: 'oklch(85% 0 0)', description: 'Shimmer highlight color.' },
  { token: '--b-skeleton-title-height', defaultValue: '16px', description: 'Height of the title bar.' },
  { token: '--b-skeleton-paragraph-li-height', defaultValue: '16px', description: 'Height of each paragraph row.' },
  { token: '--b-skeleton-paragraph-margin-top', defaultValue: '28px', description: 'Spacing between title and paragraph.' },
  { token: '--b-skeleton-paragraph-row-gap', defaultValue: '16px', description: 'Vertical gap between paragraph rows.' },
  { token: '--b-skeleton-block-radius', defaultValue: '4px', description: 'Corner radius for title/paragraph blocks.' },
  { token: '--b-skeleton-border-radius', defaultValue: '6px', description: 'Default radius for buttons / inputs / images.' },
  { token: '--b-skeleton-border-radius-sm', defaultValue: '4px', description: 'Smaller radius for small/square variants.' },
  { token: '--b-skeleton-control-height', defaultValue: '32px', description: 'Default control height for Button / Input.' },
  { token: '--b-skeleton-control-height-lg', defaultValue: '40px', description: 'Large control height.' },
  { token: '--b-skeleton-control-height-sm', defaultValue: '24px', description: 'Small control height.' },
  { token: '--b-skeleton-avatar-size-default', defaultValue: '32px', description: 'Avatar size (default).' },
  { token: '--b-skeleton-avatar-size-small', defaultValue: '24px', description: 'Avatar size (small).' },
  { token: '--b-skeleton-avatar-size-large', defaultValue: '40px', description: 'Avatar size (large).' },
  { token: '--b-skeleton-image-size', defaultValue: '96px', description: 'Image / Node placeholder dimensions.' },
  { token: '--b-skeleton-button-min-width', defaultValue: '64px', description: 'Minimum button placeholder width.' },
  { token: '--b-skeleton-input-min-width', defaultValue: '160px', description: 'Minimum input placeholder width.' },
  { token: '--b-skeleton-animation-duration', defaultValue: '1.4s', description: 'Shimmer animation duration.' },
  { token: '--b-skeleton-content-gap', defaultValue: '16px', description: 'Gap between avatar column and content column.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BSkeleton</code> (and <code>.b-skeleton-element</code> for sub-components). Override on the component root.',
      },
    },
  },
  render: () => ({
    components: { BSkeleton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BSkeleton — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-skeleton</code> (and <code>.b-skeleton-element</code> for sub-components). Override on the component root.
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
