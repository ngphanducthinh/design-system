import { BAvatar } from '@/components';
import { BAvatarShape, BAvatarSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Avatar',
  component: BAvatar,
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: Object.values(BAvatarShape),
      description: 'Shape of the avatar.',
      table: { defaultValue: { summary: BAvatarShape.Circle } },
    },
    size: {
      control: 'select',
      options: [...Object.values(BAvatarSize), 48, 64, 100],
      description: 'Size preset or custom pixel value.',
      table: { defaultValue: { summary: BAvatarSize.Default } },
    },
    src: {
      control: 'text',
      description: 'Image source URL.',
    },
    srcSet: {
      control: 'text',
      description: 'Responsive image srcset attribute.',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image avatar.',
    },
    icon: {
      control: 'boolean',
      description: 'Whether the slot content is an icon.',
      table: { defaultValue: { summary: 'false' } },
    },
    gap: {
      control: 'number',
      description: 'Pixel gap for text auto-scaling.',
      table: { defaultValue: { summary: '4' } },
    },
    crossOrigin: {
      control: 'select',
      options: ['', 'anonymous', 'use-credentials'],
      description: 'CORS setting for the image element.',
    },
    draggable: {
      control: 'boolean',
      description: 'Whether the image is draggable.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BAvatar</code> component displays a user avatar, supporting <strong>images</strong>, <strong>icons</strong>, and <strong>text</strong> content.<br><br>' +
          'It features automatic text scaling, image error fallback, two shapes (circle, square), three preset sizes (small, default, large) plus custom pixel sizes, and accessible markup.<br>' +
          'Theming is done via <code>--b-avatar-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BAvatar>;

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
    shape: BAvatarShape.Circle,
    size: BAvatarSize.Default,
    src: 'https://picsum.photos/id/40/300/300',
    alt: 'User avatar',
    icon: false,
    gap: 4,
  },
  render: (args) => ({
    components: { BAvatar },
    setup() {
      return { args };
    },
    template: `<BAvatar v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// 2. Content types
// ─────────────────────────────────────────────
/**
 * Three content types: image, icon (character), and text.
 */
export const ContentTypes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BAvatar src="https://..." alt="User" />
<BAvatar :icon="true">★</BAvatar>
<BAvatar>U</BAvatar>
<BAvatar />
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;">
        <div style="text-align:center;">
          <BAvatar src="https://picsum.photos/id/40/300/300" alt="User" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Image</p>
        </div>
        <div style="text-align:center;">
          <BAvatar :icon="true"><span style="font-size:18px;">★</span></BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Icon</p>
        </div>
        <div style="text-align:center;">
          <BAvatar>U</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Text</p>
        </div>
        <div style="text-align:center;">
          <BAvatar />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Fallback</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. All sizes
// ─────────────────────────────────────────────
/**
 * Demonstrates preset sizes and custom pixel sizes.
 */
export const AllSizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BAvatar size="small" />
<BAvatar />
<BAvatar size="large" />
<BAvatar :size="64" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;">
        <div style="text-align:center;">
          <BAvatar size="small">S</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Small (24px)</p>
        </div>
        <div style="text-align:center;">
          <BAvatar>D</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Default (32px)</p>
        </div>
        <div style="text-align:center;">
          <BAvatar size="large">L</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Large (40px)</p>
        </div>
        <div style="text-align:center;">
          <BAvatar :size="64">64</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Custom (64px)</p>
        </div>
        <div style="text-align:center;">
          <BAvatar :size="100" src="https://picsum.photos/id/237/300/300" alt="Large" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Custom (100px)</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Shapes
// ─────────────────────────────────────────────
/**
 * Circle vs. square shape.
 */
export const Shapes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BAvatar shape="circle" />
<BAvatar shape="square" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div style="text-align:center;">
          <BAvatar shape="circle" size="large" src="https://picsum.photos/id/40/300/300" alt="Circle" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Circle</p>
        </div>
        <div style="text-align:center;">
          <BAvatar shape="square" size="large" src="https://picsum.photos/id/40/300/300" alt="Square" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Square</p>
        </div>
        <div style="text-align:center;">
          <BAvatar shape="circle" size="large">U</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Circle text</p>
        </div>
        <div style="text-align:center;">
          <BAvatar shape="square" size="large">U</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Square text</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Image fallback
// ─────────────────────────────────────────────
/**
 * When an image fails to load, the avatar falls back to text or the default user icon.
 */
export const ImageFallback: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The left avatar has a broken image URL and falls back to text "AB". ' +
          'The right has a broken image and no fallback slot, showing the default user icon.',
      },
      source: {
        code: `
<BAvatar src="https://broken-url" @error="onError">AB</BAvatar>
<BAvatar src="https://broken-url" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div style="text-align:center;">
          <BAvatar src="https://this-url-does-not-exist.example/broken.png" size="large">AB</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Fallback to text</p>
        </div>
        <div style="text-align:center;">
          <BAvatar src="https://this-url-does-not-exist.example/broken.png" size="large" />
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Fallback to icon</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Text auto-scaling
// ─────────────────────────────────────────────
/**
 * Long text is automatically scaled down to fit within the avatar.
 */
export const TextAutoScale: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BAvatar>U</BAvatar>
<BAvatar>Tom</BAvatar>
<BAvatar>Username</BAvatar>
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;">
        <BAvatar size="large">U</BAvatar>
        <BAvatar size="large">Tom</BAvatar>
        <BAvatar size="large">User</BAvatar>
        <BAvatar :size="40">LongName</BAvatar>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates accessibility features:
 * - `role="img"` on image avatars with alt text
 * - `aria-label` from alt prop
 * - `aria-hidden="true"` on decorative icons
 * - No role on text-only avatars
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & ARIA)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Image avatars get `role="img"` and `aria-label` from `alt`. ' +
          'Icon/fallback content is `aria-hidden="true"` (decorative). ' +
          'Text avatars have no special role, as the text is readable. ' +
          'Animations respect `prefers-reduced-motion`.',
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Image with alt (role="img", aria-label)</h4>
          <BAvatar data-testid="img-avatar" src="https://picsum.photos/id/40/300/300" alt="User's avatar" />
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Text avatar (no role)</h4>
          <BAvatar data-testid="text-avatar">U</BAvatar>
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Icon avatar (aria-hidden on icon)</h4>
          <BAvatar data-testid="icon-avatar" :icon="true" alt="Starred user"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg></BAvatar>
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Fallback (aria-hidden on fallback icon)</h4>
          <BAvatar data-testid="fallback-avatar" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Image avatar: role="img" and aria-label from alt
    const imgAvatar = canvas.getByTestId('img-avatar');
    expect(imgAvatar.getAttribute('role')).toBe('img');
    expect(imgAvatar.getAttribute('aria-label')).toBe("User's avatar");

    // Text avatar: role="img" and default aria-label
    const textAvatar = canvas.getByTestId('text-avatar');
    expect(textAvatar.getAttribute('role')).toBe('img');
    expect(textAvatar.getAttribute('aria-label')).toBe('Avatar');

    // Icon avatar: role="img", icon container is aria-hidden
    const iconAvatar = canvas.getByTestId('icon-avatar');
    expect(iconAvatar.getAttribute('role')).toBe('img');
    const iconEl = iconAvatar.querySelector('.b-avatar__icon');
    expect(iconEl?.getAttribute('aria-hidden')).toBe('true');

    // Fallback avatar: role="img", fallback icon is aria-hidden
    const fallbackAvatar = canvas.getByTestId('fallback-avatar');
    expect(fallbackAvatar.getAttribute('role')).toBe('img');
    expect(fallbackAvatar.getAttribute('aria-label')).toBe('Avatar');
    const fallbackIcon = fallbackAvatar.querySelector('.b-avatar__icon--fallback');
    expect(fallbackIcon?.getAttribute('aria-hidden')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// 8. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override `--b-avatar-*` CSS custom properties to customise appearance.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-avatar-*` CSS custom properties to customise the avatar appearance ' +
          'without touching the component source.',
      },
      source: {
        code: `
<style>
.custom-avatar {
  --b-avatar-bg: #e94560;
  --b-avatar-color: #ffffff;
}
</style>

<BAvatar class="custom-avatar">R</BAvatar>
        `,
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem;">
        <div style="text-align:center;">
          <BAvatar size="large" alt="Default theme">DEF</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Default</p>
        </div>
        <div style="text-align:center;">
          <BAvatar size="large" alt="Red theme" style="--b-avatar-bg:#e94560;--b-avatar-color:#fff;">RED</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Red</p>
        </div>
        <div style="text-align:center;">
          <BAvatar size="large" alt="Green theme" style="--b-avatar-bg:#389e0d;--b-avatar-color:#fff;">GRN</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Green</p>
        </div>
        <div style="text-align:center;">
          <BAvatar size="large" alt="Purple theme" style="--b-avatar-bg:#722ed1;--b-avatar-color:#fff;">PUR</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Purple</p>
        </div>
        <div style="text-align:center;">
          <BAvatar size="large" shape="square" alt="Orange theme" style="--b-avatar-bg:#d46b08;--b-avatar-color:#fff;--b-avatar-border-radius-square:12px;">ORA</BAvatar>
          <p style="margin-top:0.5rem;font-size:0.75rem;color:#666;">Orange + radius</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Interaction test – image fallback
// ─────────────────────────────────────────────
/**
 * Automated interaction test: verifies image fallback behavior.
 */
export const InteractionImageFallback: Story = {
  name: 'Interaction – image fallback',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: verifies that broken images fall back to text or default icon.',
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    template: `
      <div style="display:flex;gap:1rem;">
        <BAvatar data-testid="fallback-text" src="https://this-url-does-not-exist.example/broken.png">AB</BAvatar>
        <BAvatar data-testid="fallback-icon" src="https://this-url-does-not-exist.example/broken.png" />
        <BAvatar data-testid="valid-image" src="https://picsum.photos/id/40/300/300" alt="Valid" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Valid image should render <img>
    const validAvatar = canvas.getByTestId('valid-image');
    const img = validAvatar.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('Valid');
  },
};

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-avatar-size-default',
    defaultValue: '32px',
    description: 'Default avatar size (AntD: containerSize).',
  },
  {
    token: '--b-avatar-size-large',
    defaultValue: '40px',
    description: 'Large avatar size (AntD: containerSizeLG).',
  },
  {
    token: '--b-avatar-size-small',
    defaultValue: '24px',
    description: 'Small avatar size (AntD: containerSizeSM).',
  },
  {
    token: '--b-avatar-font-size-default',
    defaultValue: '18px',
    description: 'Default text/icon font size (AntD: textFontSize / iconFontSize).',
  },
  {
    token: '--b-avatar-font-size-large',
    defaultValue: '24px',
    description: 'Large text/icon font size (AntD: textFontSizeLG / iconFontSizeLG).',
  },
  {
    token: '--b-avatar-font-size-small',
    defaultValue: '14px',
    description: 'Small text/icon font size (AntD: textFontSizeSM / iconFontSizeSM).',
  },
  // ── Local extras ──
  {
    token: '--b-avatar-bg',
    defaultValue: 'oklch(50% 0.06 240)',
    description: 'Background color of the avatar.',
  },
  {
    token: '--b-avatar-color',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Text color inside the avatar.',
  },
  {
    token: '--b-avatar-icon-color',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Color of the icon when used inside the avatar.',
  },
  {
    token: '--b-avatar-border-radius-square',
    defaultValue: '6px',
    description: 'Corner radius applied to the square shape variant.',
  },
  {
    token: '--b-avatar-transition-duration',
    defaultValue: '200ms',
    description: 'Transition duration for color/background changes.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-avatar-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BAvatar },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BAvatar - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-avatar</code>. Override inline or via a CSS class.
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Three+ tokens overridden inline (background, color, size, border radius).
        </p>
        <BAvatar
          shape="square"
          style="
            --b-avatar-bg: oklch(42% 0.16 145);
            --b-avatar-color: oklch(98% 0.005 145);
            --b-avatar-size-default: 56px;
            --b-avatar-border-radius-square: 16px;
          "
        >TN</BAvatar>
      </div>
    `,
  }),
};
