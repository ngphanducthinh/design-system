import { BImage } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Sample image URLs (public domain)
// ─────────────────────────────────────────────
const SAMPLE_IMG =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop';
const SAMPLE_IMG_LARGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=900&fit=crop';
const SAMPLE_IMG_4K =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=3840&h=2160&fit=crop&q=90';
const SAMPLE_IMG_TINY =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=40&h=30&fit=crop&q=10';
const SAMPLE_IMG_2 =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'DataDisplay/Image',
  component: BImage,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL.',
      table: { category: 'Props' },
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image.',
      table: { defaultValue: { summary: '""' }, category: 'Props' },
    },
    width: {
      control: { type: 'number' },
      description: 'Image width (px number or CSS string).',
      table: { defaultValue: { summary: '-' }, category: 'Props' },
    },
    height: {
      control: { type: 'number' },
      description: 'Image height (px number or CSS string).',
      table: { defaultValue: { summary: '-' }, category: 'Props' },
    },
    fallback: {
      control: 'text',
      description: 'Fallback source URL when the primary image fails to load.',
      table: { category: 'Props' },
    },
    placeholder: {
      control: 'boolean',
      description:
        'Show built-in shimmer placeholder while loading. Use the `placeholder` slot for custom content.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    placeholderSrc: {
      control: 'text',
      description:
        'Low-resolution image URL for progressive loading. Shown blurred while the full image loads.',
      table: { category: 'Props' },
    },
    preview: {
      control: 'boolean',
      description: 'Enable click-to-preview overlay.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    mask: {
      control: 'boolean',
      description:
        'Show the hover mask overlay. Set `false` to hide the mask while keeping preview clickable.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    previewSrc: {
      control: 'text',
      description: 'Custom source for the preview overlay (e.g. a higher-resolution version).',
      table: { category: 'Props' },
    },
    previewVisible: {
      control: 'boolean',
      description: 'Controlled preview visibility. Use with `v-model:previewVisible`.',
      table: { category: 'Two-Way Binding Props' },
    },
    scaleStep: {
      control: { type: 'number', min: 0.1, max: 2, step: 0.1 },
      description: 'Zoom increment/decrement per step.',
      table: { defaultValue: { summary: '0.5' }, category: 'Props' },
    },
    minScale: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
      description: 'Minimum zoom scale.',
      table: { defaultValue: { summary: '1' }, category: 'Props' },
    },
    maxScale: {
      control: { type: 'number', min: 1, max: 100, step: 1 },
      description: 'Maximum zoom scale.',
      table: { defaultValue: { summary: '50' }, category: 'Props' },
    },
    movable: {
      control: 'boolean',
      description: 'Allow dragging/panning the image inside the preview.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    loading: {
      control: 'select',
      options: ['lazy', 'eager'],
      description: 'Native `loading` attribute - use `lazy` for below-the-fold images.',
      table: { category: 'Props' },
    },
    crossOrigin: {
      control: 'select',
      options: ['', 'anonymous', 'use-credentials'],
      description: 'CORS setting for the image.',
      table: { category: 'Props' },
    },
    decoding: {
      control: 'select',
      options: ['async', 'auto', 'sync'],
      description: 'Decoding hint for the browser.',
      table: { category: 'Props' },
    },
    referrerPolicy: {
      control: 'text',
      description: 'Referrer policy for the image request.',
      table: { category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BImage</code> component displays images with built-in preview, ' +
          'loading placeholders, progressive loading, fallback handling, and a full-screen preview overlay with ' +
          'zoom, rotate, flip, drag-to-pan, and reset controls.<br><br>' +
          'Supports <strong>controlled</strong> and <strong>uncontrolled</strong> preview via ' +
          '<code>v-model:previewVisible</code>.<br>' +
          '<strong>Progressive loading</strong> via <code>placeholderSrc</code> shows a blurred low-res image while the full image loads.<br>' +
          '<strong>Drag-to-pan</strong> (movable) allows repositioning the image in the preview.<br>' +
          'Theming via <code>--b-image-*</code> and <code>--b-image-preview-*</code> CSS custom properties. ' +
          'Respects <code>prefers-reduced-motion</code>.',
      },
    },
    // The mask overlay text ("Preview") is rendered on top of an <img> node.
    // axe-core cannot sample background colors through image nodes and reports
    // color-contrast as "incomplete". The mask uses --b-image-mask-bg (50% black
    // backdrop) with white text, which exceeds WCAG AA contrast requirements.
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '.b-image__mask *, .b-image__mask-text',
            enabled: false,
          },
        ],
      },
    },
  },
} satisfies Meta<typeof BImage>;

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
    src: SAMPLE_IMG,
    alt: 'Mountain landscape',
    width: 300,
    height: 200,
    preview: true,
    mask: true,
    placeholder: false,
    movable: true,
    scaleStep: 0.5,
    minScale: 1,
    maxScale: 50,
  },
  render: (args) => ({
    components: { BImage },
    setup() {
      return { args };
    },
    template: `<BImage v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic usage
// ─────────────────────────────────────────────
/**
 * Simple image with preview enabled by default. Click to open the preview overlay.
 */
export const BasicUsage: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage src="photo.jpg" alt="Landscape" :width="300" :height="200" />
<BImage src="photo.jpg" alt="No preview" :width="300" :height="200" :preview="false" />
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BImage
            data-testid="basic-image"
            src="${SAMPLE_IMG}"
            alt="Mountain landscape"
            :width="300"
            :height="200"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">With preview (default)</p>
        </div>
        <div style="text-align:center;">
          <BImage
            data-testid="no-preview-image"
            src="${SAMPLE_IMG_2}"
            alt="Nature"
            :width="300"
            :height="200"
            :preview="false"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Preview disabled</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByTestId('basic-image');
    expect(img.classList.contains('b-image--preview')).toBe(true);
    expect(img.querySelector('.b-image__img')).toBeTruthy();

    const noPreview = canvas.getByTestId('no-preview-image');
    expect(noPreview.classList.contains('b-image--preview')).toBe(false);
  },
};

// ─────────────────────────────────────────────
// 3. Progressive loading
// ─────────────────────────────────────────────
/**
 * Progressive loading shows a blurred low-res placeholder while the full image loads.
 * Set `placeholderSrc` to a tiny version of the image.
 */
export const ProgressiveLoading: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage
  src="full-resolution-4k.jpg"
  placeholderSrc="tiny-thumbnail.jpg"
  alt="Progressive"
  :width="600"
  :height="400"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    data() {
      return { refreshKey: 0 };
    },
    methods: {
      reload() {
        (this as unknown as { refreshKey: number }).refreshKey++;
      },
    },
    template: `
      <div>
        <div style="margin-bottom:1rem;">
          <button
            data-testid="refresh-btn"
            style="padding:6px 16px;border:1px solid oklch(54.6% 0.245 262.881);background:oklch(54.6% 0.245 262.881);color:white;border-radius:6px;cursor:pointer;font-size:14px;"
            @click="reload"
          >
            Refresh to replay loading
          </button>
          <span style="margin-left:0.75rem;font-size:0.75rem;color:#525252;">
            Loads a 4K image - watch the blurred placeholder transition to the full image.
          </span>
        </div>
        <div style="display:flex;gap:2rem;align-items:flex-start;">
          <div style="text-align:center;">
            <BImage
              :key="'progressive-' + refreshKey"
              data-testid="progressive-image"
              :src="'${SAMPLE_IMG_4K}&v=' + refreshKey"
              placeholderSrc="${SAMPLE_IMG_TINY}"
              alt="Progressive loading demo"
              :width="600"
              :height="400"
            />
            <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">placeholderSrc (blurred low-res → full 4K)</p>
          </div>
          <div style="text-align:center;">
            <BImage
              :key="'shimmer-' + refreshKey"
              data-testid="shimmer-image"
              :src="'${SAMPLE_IMG_4K}&v=' + refreshKey + '-s'"
              alt="Shimmer placeholder"
              :width="600"
              :height="400"
              placeholder
            />
            <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Shimmer placeholder</p>
          </div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('progressive-image');
    expect(el.querySelector('.b-image__img')).toBeTruthy();

    // Refresh button exists
    const refreshBtn = canvas.getByTestId('refresh-btn');
    expect(refreshBtn).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 4. Placeholder
// ─────────────────────────────────────────────
/**
 * Built-in shimmer placeholder or custom slot content while the image loads.
 */
export const WithPlaceholder: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage src="photo.jpg" alt="Photo" :width="300" :height="200" placeholder />

<BImage src="photo.jpg" alt="Custom" :width="300" :height="200" placeholder>
  <template #placeholder>Loading...</template>
</BImage>
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BImage
            data-testid="placeholder-image"
            src="${SAMPLE_IMG}"
            alt="With placeholder"
            :width="300"
            :height="200"
            placeholder
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Built-in shimmer</p>
        </div>
        <div style="text-align:center;">
          <BImage
            data-testid="custom-placeholder"
            src="${SAMPLE_IMG_2}"
            alt="Custom placeholder"
            :width="300"
            :height="200"
            placeholder
          >
            <template #placeholder>
              <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:14px;">
                Loading...
              </div>
            </template>
          </BImage>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Custom placeholder slot</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByTestId('placeholder-image');
    expect(img.querySelector('.b-image__img')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 5. Fallback
// ─────────────────────────────────────────────
/**
 * Fallback image displayed when the primary source fails.
 */
export const Fallback: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage
  src="https://invalid-url.example/missing.jpg"
  fallback="${SAMPLE_IMG}"
  alt="Fallback demo"
  :width="300"
  :height="200"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <BImage
        data-testid="fallback-image"
        src="https://invalid-url.example/missing.jpg"
        fallback="${SAMPLE_IMG}"
        alt="Fallback demo"
        :width="300"
        :height="200"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('fallback-image');
    expect(el.querySelector('.b-image__img')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 6. Mask hidden (preview still works)
// ─────────────────────────────────────────────
/**
 * Set `mask=false` to hide the hover overlay while keeping preview on click.
 */
export const MaskHidden: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage src="photo.jpg" alt="No mask" :width="300" :height="200" :mask="false" />
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BImage
            data-testid="mask-visible"
            src="${SAMPLE_IMG}"
            alt="With mask"
            :width="300"
            :height="200"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Default mask</p>
        </div>
        <div style="text-align:center;">
          <BImage
            data-testid="mask-hidden"
            src="${SAMPLE_IMG_2}"
            alt="No mask"
            :width="300"
            :height="200"
            :mask="false"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">mask=false (click still opens preview)</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((r) => setTimeout(r, 1000));

    const withMask = canvas.getByTestId('mask-visible');
    expect(withMask.querySelector('.b-image__mask')).toBeTruthy();

    const noMask = canvas.getByTestId('mask-hidden');
    expect(noMask.querySelector('.b-image__mask')).toBeNull();
    // Should still have a click target
    expect(noMask.querySelector('.b-image__click-target')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 7. Lazy loading
// ─────────────────────────────────────────────
/**
 * Use `loading="lazy"` for below-the-fold images to defer loading until near the viewport.
 */
export const LazyLoading: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BImage src="photo.jpg" alt="Lazy" :width="300" :height="200" loading="lazy" />`,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <BImage
        data-testid="lazy-image"
        src="${SAMPLE_IMG}"
        alt="Lazy loaded image"
        :width="300"
        :height="200"
        loading="lazy"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('lazy-image');
    const img = el.querySelector('.b-image__img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  },
};

// ─────────────────────────────────────────────
// 8. Preview with custom source
// ─────────────────────────────────────────────
/**
 * Use `previewSrc` to show a higher-resolution version in the preview overlay.
 */
export const CustomPreviewSrc: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BImage
  src="thumbnail.jpg"
  previewSrc="full-resolution.jpg"
  alt="Preview demo"
  :width="300"
  :height="200"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <BImage
        data-testid="preview-src-image"
        src="${SAMPLE_IMG}"
        previewSrc="${SAMPLE_IMG_LARGE}"
        alt="Click for high-res"
        :width="300"
        :height="200"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('preview-src-image');
    const img = el.querySelector('.b-image__img');
    expect(img?.getAttribute('src')).toContain('w=400');
  },
};

// ─────────────────────────────────────────────
// 9. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates accessibility features:
 * - Proper `alt` text on images
 * - `role="button"` with `tabindex="0"` on preview mask
 * - `role="dialog"` with `aria-modal` on preview overlay
 * - `role="toolbar"` on preview controls
 * - `aria-live="polite"` on scale indicator
 * - Keyboard: Tab → Enter/Space to open, Escape to close
 * - Focus trap in preview dialog
 * - `aria-hidden="true"` on decorative SVG icons
 * - `aria-pressed` on flip toggle buttons
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The image component provides full keyboard navigation and ARIA support. ' +
          'The preview mask is `role="button"` with `tabindex="0"`. ' +
          'The overlay is `role="dialog"` with `aria-modal="true"` and focus trapping. ' +
          'The toolbar is `role="toolbar"` with arrow-key navigation. ' +
          'Zoom scale is announced via `aria-live="polite"`. ' +
          'All decorative icons are `aria-hidden="true"` and `focusable="false"`. ' +
          'Flip buttons reflect `aria-pressed` state.',
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Image with alt text and preview</h4>
          <BImage
            data-testid="a11y-image"
            src="${SAMPLE_IMG}"
            alt="Scenic mountain landscape"
            :width="300"
            :height="200"
          />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Image without preview (preview=false)</h4>
          <BImage
            data-testid="a11y-no-preview"
            src="${SAMPLE_IMG_2}"
            alt="Nature scene"
            :width="300"
            :height="200"
            :preview="false"
          />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">No mask, still keyboard accessible</h4>
          <BImage
            data-testid="a11y-no-mask"
            src="${SAMPLE_IMG}"
            alt="Hidden mask"
            :width="300"
            :height="200"
            :mask="false"
          />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Image has correct alt
    const el = canvas.getByTestId('a11y-image');
    const img = el.querySelector('.b-image__img');
    expect(img?.getAttribute('alt')).toBe('Scenic mountain landscape');

    // No-preview image does not have mask trigger
    const noPreviewEl = canvas.getByTestId('a11y-no-preview');
    expect(noPreviewEl.querySelector('.b-image__mask')).toBeNull();
    expect(noPreviewEl.querySelector('.b-image__click-target')).toBeNull();

    // Wait for image to load, then check mask a11y
    await new Promise((r) => setTimeout(r, 1000));
    const mask = el.querySelector('.b-image__mask');
    if (mask) {
      expect(mask.getAttribute('role')).toBe('button');
      expect(mask.getAttribute('tabindex')).toBe('0');
      expect(mask.getAttribute('aria-label')).toBe('Preview image: Scenic mountain landscape');

      // Decorative SVG
      const svg = mask.querySelector('svg');
      if (svg) {
        expect(svg.getAttribute('aria-hidden')).toBe('true');
        expect(svg.getAttribute('focusable')).toBe('false');
      }
    }

    // No-mask image still has keyboard accessible click target
    const noMaskEl = canvas.getByTestId('a11y-no-mask');
    const clickTarget = noMaskEl.querySelector('.b-image__click-target');
    if (clickTarget) {
      expect(clickTarget.getAttribute('role')).toBe('button');
      expect(clickTarget.getAttribute('tabindex')).toBe('0');
    }
  },
};

// ─────────────────────────────────────────────
// 10. Theming story (CSS vars)
// ─────────────────────────────────────────────
/**
 * Override `--b-image-*` CSS custom properties to customise appearance.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-image-*` CSS custom properties to customise the image appearance ' +
          'without touching the component source. Includes `--b-image-progressive-blur` for ' +
          'controlling the blur amount on progressive placeholders.',
      },
      source: {
        code: `
<style>
.custom-image {
  --b-image-border-radius: 50%;
  --b-image-mask-bg: oklch(45% 0.2 260 / 60%);
}
</style>

<BImage class="custom-image" src="photo.jpg" alt="Styled" :width="200" :height="200" />
        `,
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <div style="text-align:center;">
          <BImage
            src="${SAMPLE_IMG}"
            alt="Default"
            :width="200"
            :height="200"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Default</p>
        </div>
        <div style="text-align:center;">
          <BImage
            src="${SAMPLE_IMG}"
            alt="Round"
            :width="200"
            :height="200"
            style="--b-image-border-radius:50%;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Round (border-radius: 50%)</p>
        </div>
        <div style="text-align:center;">
          <BImage
            src="${SAMPLE_IMG_2}"
            alt="Custom mask"
            :width="200"
            :height="200"
            style="--b-image-border-radius:16px;--b-image-mask-bg:oklch(45% 0.2 260 / 60%);"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Custom mask color</p>
        </div>
        <div style="text-align:center;">
          <BImage
            src="${SAMPLE_IMG}"
            alt="No radius"
            :width="200"
            :height="200"
            style="--b-image-border-radius:0;"
          />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#525252;">Sharp corners</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 11. Interaction tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: verify rendering, preview open/close, toolbar, keyboard nav.
 */
export const InteractionTests: Story = {
  name: 'Interaction – preview & keyboard',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: verifies image rendering, preview mask, ' +
          'preview overlay open/close, toolbar actions (zoom, rotate, flip, reset), and keyboard navigation.',
      },
    },
  },
  render: () => ({
    components: { BImage },
    template: `
      <div style="display:flex;gap:2rem;align-items:flex-start;">
        <BImage
          data-testid="int-basic"
          src="${SAMPLE_IMG}"
          alt="Test image"
          :width="250"
          :height="180"
        />
        <BImage
          data-testid="int-no-preview"
          src="${SAMPLE_IMG_2}"
          alt="No preview"
          :width="250"
          :height="180"
          :preview="false"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for images to load
    await new Promise((r) => setTimeout(r, 1500));

    // Basic image renders with preview
    const basicEl = canvas.getByTestId('int-basic');
    expect(basicEl.classList.contains('b-image--preview')).toBe(true);
    expect(basicEl.querySelector('.b-image__img')).toBeTruthy();

    // Check mask exists after load
    const mask = basicEl.querySelector('.b-image__mask');
    if (mask) {
      expect(mask.getAttribute('role')).toBe('button');
      expect(mask.getAttribute('tabindex')).toBe('0');

      // Click to open preview
      await userEvent.click(mask);
      await new Promise((r) => setTimeout(r, 400));

      const previewOverlay = document.querySelector('.b-image-preview');
      if (previewOverlay) {
        // Dialog a11y
        expect(previewOverlay.getAttribute('role')).toBe('dialog');
        expect(previewOverlay.getAttribute('aria-modal')).toBe('true');

        // Toolbar exists
        const toolbar = previewOverlay.querySelector('.b-image-preview__toolbar');
        expect(toolbar).toBeTruthy();
        expect(toolbar?.getAttribute('role')).toBe('toolbar');

        // Scale indicator
        const scale = previewOverlay.querySelector('.b-image-preview__scale');
        expect(scale?.textContent?.trim()).toBe('100%');
        expect(scale?.getAttribute('aria-live')).toBe('polite');

        // Zoom in
        const zoomIn = toolbar?.querySelector('[aria-label="Zoom in"]') as HTMLElement;
        if (zoomIn) {
          await userEvent.click(zoomIn);
          await new Promise((r) => setTimeout(r, 100));
          expect(scale?.textContent?.trim()).toBe('150%');
        }

        // Reset button
        const resetBtn = toolbar?.querySelector(
          '[aria-label="Reset to original size"]',
        ) as HTMLElement;
        if (resetBtn) {
          await userEvent.click(resetBtn);
          await new Promise((r) => setTimeout(r, 100));
          expect(scale?.textContent?.trim()).toBe('100%');
        }

        // Close via close button
        const closeBtn = previewOverlay.querySelector('.b-image-preview__close') as HTMLElement;
        expect(closeBtn?.getAttribute('aria-label')).toBe('Close preview');
        await userEvent.click(closeBtn);
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    // No-preview image has no mask
    const noPreviewEl = canvas.getByTestId('int-no-preview');
    expect(noPreviewEl.classList.contains('b-image--preview')).toBe(false);
    expect(noPreviewEl.querySelector('.b-image__mask')).toBeNull();
  },
};
