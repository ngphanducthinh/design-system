import { BEmpty } from '@/components';
import { BEmptyImage } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Empty',
  component: BEmpty,
  tags: ['autodocs'],
  argTypes: {
    description: {
      control: 'text',
      description: 'Customize description text. Pass `false` to hide completely.',
      table: { defaultValue: { summary: '"No data"' }, category: 'Props' },
    },
    image: {
      control: 'select',
      options: [BEmptyImage.Default, BEmptyImage.Simple],
      description:
        'Image type: `default` (detailed illustration) or `simple` (minimal). Also accepts a URL string.',
      table: {
        defaultValue: { summary: BEmptyImage.Default },
        category: 'Props',
      },
    },
    hideDescription: {
      control: 'boolean',
      description: 'Set to true to hide the description area completely.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    imageStyle: {
      control: 'object',
      description: 'Inline styles applied to the image container element.',
      table: { category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BEmpty</code> component displays a placeholder when content is absent - ' +
          'e.g. empty tables, search results, or fresh-start states.<br><br>' +
          'Supports <strong>two built-in illustrations</strong> (default &amp; simple), ' +
          '<strong>custom images</strong> via URL or slot, and an <strong>action footer</strong> slot.<br>' +
          'Theming via <code>--b-empty-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    description: 'No data',
    image: BEmptyImage.Default,
  },
  render: (args) => ({
    components: { BEmpty },
    setup() {
      return { args };
    },
    template: `<BEmpty v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// 2. Image variants
// ─────────────────────────────────────────────
/**
 * Default (detailed) and Simple (minimal) built-in illustrations.
 */
export const ImageVariants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BEmpty />
<BEmpty image="simple" />
        `,
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <div style="display:flex;gap:3rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BEmpty data-testid="default-image" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Default</p>
        </div>
        <div style="text-align:center;">
          <BEmpty data-testid="simple-image" image="simple" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Simple</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultEl = canvas.getByTestId('default-image');
    expect(defaultEl.querySelector('.b-empty__svg--default')).toBeTruthy();

    const simpleEl = canvas.getByTestId('simple-image');
    expect(simpleEl.querySelector('.b-empty__svg--simple')).toBeTruthy();
    expect(simpleEl.classList.contains('b-empty--simple')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 3. Custom description
// ─────────────────────────────────────────────
/**
 * Custom description text and hidden description.
 */
export const CustomDescription: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BEmpty description="No results found" />
<BEmpty hideDescription />
        `,
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <div style="display:flex;gap:3rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BEmpty data-testid="custom-desc" description="No results found" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Custom text</p>
        </div>
        <div style="text-align:center;">
          <BEmpty data-testid="no-desc" hideDescription />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Hidden description</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const customDesc = canvas.getByTestId('custom-desc');
    expect(customDesc.querySelector('.b-empty__description')?.textContent?.trim()).toBe(
      'No results found',
    );

    const noDesc = canvas.getByTestId('no-desc');
    expect(noDesc.querySelector('.b-empty__description')).toBeNull();
  },
};

// ─────────────────────────────────────────────
// 4. With action footer
// ─────────────────────────────────────────────
/**
 * Action content (e.g. a button) rendered below the description.
 */
export const WithAction: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BEmpty description="No items yet">
  <button>Create Now</button>
</BEmpty>
        `,
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <BEmpty data-testid="with-action" description="No items yet">
        <button style="padding:6px 16px;border:1px solid oklch(54.6% 0.245 262.881);background:oklch(54.6% 0.245 262.881);color:white;border-radius:6px;cursor:pointer;font-size:14px;">
          Create Now
        </button>
      </BEmpty>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('with-action');
    expect(el.querySelector('.b-empty__footer')).toBeTruthy();
    expect(el.querySelector('.b-empty__footer button')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 5. Custom image via slot
// ─────────────────────────────────────────────
/**
 * Completely replace the built-in illustration using the `image` slot.
 */
export const CustomImageSlot: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BEmpty description="Custom illustration">
  <template #image>
    <img src="..." alt="" style="height:100px;" />
  </template>
</BEmpty>
        `,
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <BEmpty data-testid="custom-image-slot" description="Custom illustration">
        <template #image>
          <div style="font-size:64px;line-height:1;" aria-hidden="true">📦</div>
        </template>
      </BEmpty>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('custom-image-slot');
    // No built-in SVG should render
    expect(el.querySelector('.b-empty__svg')).toBeNull();
    expect(el.querySelector('.b-empty__image')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 6. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates accessibility features:
 * - `role="status"` on root element
 * - `aria-label` from description text
 * - `aria-hidden="true"` on decorative SVGs
 * - `focusable="false"` on SVGs to prevent IE/Edge focus
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & ARIA)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The empty component uses `role="status"` with `aria-label` from the description. ' +
          'Built-in SVG illustrations are `aria-hidden="true"` and `focusable="false"`. ' +
          'Animations respect `prefers-reduced-motion`.',
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Default (role="status", aria-label="No data")</h4>
          <BEmpty data-testid="a11y-default" />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Custom description (aria-label="Nothing here")</h4>
          <BEmpty data-testid="a11y-custom" description="Nothing here" />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Simple variant (aria-hidden SVG)</h4>
          <BEmpty data-testid="a11y-simple" image="simple" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Default: role="status", aria-label="No data"
    const defaultEl = canvas.getByTestId('a11y-default');
    expect(defaultEl.getAttribute('role')).toBe('status');
    expect(defaultEl.getAttribute('aria-label')).toBe('No data');
    const defaultSvg = defaultEl.querySelector('.b-empty__svg--default');
    expect(defaultSvg?.getAttribute('aria-hidden')).toBe('true');
    expect(defaultSvg?.getAttribute('focusable')).toBe('false');

    // Custom description
    const customEl = canvas.getByTestId('a11y-custom');
    expect(customEl.getAttribute('aria-label')).toBe('Nothing here');

    // Simple variant
    const simpleEl = canvas.getByTestId('a11y-simple');
    const simpleSvg = simpleEl.querySelector('.b-empty__svg--simple');
    expect(simpleSvg?.getAttribute('aria-hidden')).toBe('true');
    expect(simpleSvg?.getAttribute('focusable')).toBe('false');
  },
};

// ─────────────────────────────────────────────
// 7. Theming story (CSS vars)
// ─────────────────────────────────────────────
/**
 * Override `--b-empty-*` CSS custom properties to customise appearance.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-empty-*` CSS custom properties to customise the empty state appearance ' +
          'without touching the component source.',
      },
      source: {
        code: `
<style>
.custom-empty {
  --b-empty-description-color: #722ed1;
  --b-empty-description-font-size: 18px;
  --b-empty-image-opacity: 0.5;
}
</style>

<BEmpty class="custom-empty" description="Styled empty" />
        `,
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <div style="display:flex;gap:3rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BEmpty description="Default" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Default</p>
        </div>
        <div style="text-align:center;">
          <BEmpty
            description="Purple text"
            style="--b-empty-description-color:#722ed1;--b-empty-description-font-size:18px;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Custom text</p>
        </div>
        <div style="text-align:center;">
          <BEmpty
            description="Faded image"
            style="--b-empty-image-opacity:0.35;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Faded</p>
        </div>
        <div style="text-align:center;">
          <BEmpty
            description="Compact"
            style="--b-empty-padding:12px 0;--b-empty-image-height:80px;--b-empty-image-margin-bottom:4px;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Compact</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Interaction tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: verify rendering, slots, and DOM structure.
 */
export const InteractionTests: Story = {
  name: 'Interaction – rendering & slots',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: verifies image rendering, description text, footer slot, and class hooks.',
      },
    },
  },
  render: () => ({
    components: { BEmpty },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <BEmpty data-testid="int-default" />
        <BEmpty data-testid="int-simple" image="simple" description="Simple variant" />
        <BEmpty data-testid="int-action" description="With action">
          <button data-testid="int-action-btn">Create</button>
        </BEmpty>
        <BEmpty data-testid="int-no-desc" hideDescription />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Default rendering
    const defaultEl = canvas.getByTestId('int-default');
    expect(defaultEl.querySelector('.b-empty__svg--default')).toBeTruthy();
    expect(defaultEl.querySelector('.b-empty__description')?.textContent?.trim()).toBe('No data');
    expect(defaultEl.querySelector('.b-empty__footer')).toBeNull();

    // Simple variant
    const simpleEl = canvas.getByTestId('int-simple');
    expect(simpleEl.classList.contains('b-empty--simple')).toBe(true);
    expect(simpleEl.querySelector('.b-empty__svg--simple')).toBeTruthy();
    expect(simpleEl.querySelector('.b-empty__description')?.textContent?.trim()).toBe(
      'Simple variant',
    );

    // With action footer
    const actionEl = canvas.getByTestId('int-action');
    expect(actionEl.querySelector('.b-empty__footer')).toBeTruthy();
    expect(actionEl.querySelector('[data-testid="int-action-btn"]')).toBeTruthy();

    // No description
    const noDescEl = canvas.getByTestId('int-no-desc');
    expect(noDescEl.querySelector('.b-empty__description')).toBeNull();
  },
};
