import { BSplitter, BSplitterPanel } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

/**
 * BSplitter — resizable panel container.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST)
 */
const meta = {
  title: 'Layout/Splitter',
  component: BSplitter,
  subcomponents: { BSplitterPanel },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation. Takes precedence over `vertical` when set.',
      table: { category: 'Props', defaultValue: { summary: 'horizontal' } },
    },
    vertical: {
      control: 'boolean',
      description: 'Convenience boolean for vertical orientation.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    lazy: {
      control: 'boolean',
      description:
        'Whether the resize is committed only on release (a preview line shows during the drag).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    collapsible: {
      control: 'object',
      description:
        'Splitter-level collapsible config: `{ motion?: boolean; icon?: { start?, end? } }`.',
      table: { category: 'Props' },
    },
    onResize: {
      description: 'Fires continuously while the user drags (or once on release in lazy mode).',
      table: { category: 'Events' },
    },
    onResizeStart: {
      description: 'Fires when a resize gesture begins.',
      table: { category: 'Events' },
    },
    onResizeEnd: {
      description: 'Fires when a resize gesture ends.',
      table: { category: 'Events' },
    },
    onCollapse: {
      description: 'Fires when a collapsible panel toggles.',
      table: { category: 'Events' },
    },
    onDraggerDoubleClick: {
      description: 'Fires when a dragger receives a double-click.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSplitter</code> component arranges resizable panels. ' +
          'Drag the bar between panels to resize, double-click to fire ' +
          '<code>onDraggerDoubleClick</code>, or use the keyboard (Tab to focus, ' +
          'Arrow keys to move, Enter/Space to toggle collapse).<br><br>' +
          'Children must be <code>&lt;BSplitterPanel&gt;</code>. Each panel supports ' +
          '<code>size</code> (controlled), <code>defaultSize</code>, <code>min</code>, ' +
          '<code>max</code>, <code>resizable</code>, <code>collapsible</code>, and ' +
          '<code>destroyOnHidden</code>.',
      },
    },
  },
} satisfies Meta<typeof BSplitter>;

export default meta;
type Story = StoryObj<typeof meta>;

const PANEL_CONTENT_STYLE =
  'height:100%;display:flex;align-items:center;justify-content:center;background:oklch(96% 0.01 264);font-family:sans-serif;color:#333;border-radius:4px;';

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default horizontal splitter with two panels, the first sized to 40%. */
export const Default: Story = {
  args: {
    orientation: 'horizontal',
    vertical: false,
    lazy: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter>
  <BSplitterPanel default-size="40%">Panel A</BSplitterPanel>
  <BSplitterPanel>Panel B</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: (args) => ({
    components: { BSplitter, BSplitterPanel },
    setup: () => ({ args }),
    template: `
      <div style="height:300px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter v-bind="args">
          <BSplitterPanel default-size="40%">
            <div style="${PANEL_CONTENT_STYLE}">Panel A (40%)</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Panel B (auto)</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** Stack panels vertically with the `vertical` shorthand or `orientation="vertical"`. */
export const Vertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter vertical>
  <BSplitterPanel default-size="30%">Top</BSplitterPanel>
  <BSplitterPanel>Middle</BSplitterPanel>
  <BSplitterPanel default-size="20%">Bottom</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:400px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter vertical>
          <BSplitterPanel default-size="30%">
            <div style="${PANEL_CONTENT_STYLE}">Top</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Middle</div>
          </BSplitterPanel>
          <BSplitterPanel default-size="20%">
            <div style="${PANEL_CONTENT_STYLE}">Bottom</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** Constrain panels via `min` / `max` (px or %). The dragger stops at the bounds. */
export const MinMaxConstraints: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter>
  <BSplitterPanel default-size="50%" min="20%" max="70%">Panel A</BSplitterPanel>
  <BSplitterPanel min="100">Panel B</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:240px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel default-size="50%" min="20%" max="70%">
            <div style="${PANEL_CONTENT_STYLE}">min 20% · max 70%</div>
          </BSplitterPanel>
          <BSplitterPanel min="100">
            <div style="${PANEL_CONTENT_STYLE}">min 100px</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** With `lazy`, a preview indicator shows during the drag and the size only commits on release. */
export const Lazy: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter lazy>
  <BSplitterPanel>Panel A</BSplitterPanel>
  <BSplitterPanel>Panel B</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:240px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter lazy>
          <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">Panel A</div></BSplitterPanel>
          <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">Panel B</div></BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** Mark a panel `collapsible` to expose collapse buttons on the adjacent dragger. */
export const Collapsible: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter>
  <BSplitterPanel collapsible>First</BSplitterPanel>
  <BSplitterPanel collapsible>Second</BSplitterPanel>
  <BSplitterPanel collapsible>Third</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:240px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel collapsible>
            <div style="${PANEL_CONTENT_STYLE}">First</div>
          </BSplitterPanel>
          <BSplitterPanel collapsible>
            <div style="${PANEL_CONTENT_STYLE}">Second</div>
          </BSplitterPanel>
          <BSplitterPanel collapsible>
            <div style="${PANEL_CONTENT_STYLE}">Third</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** Set `:resizable="false"` on a panel to lock its size — the adjacent dragger disappears. */
export const NonResizable: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSplitter>
  <BSplitterPanel :resizable="false" default-size="200">Fixed 200px</BSplitterPanel>
  <BSplitterPanel>Flexible</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:200px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel :resizable="false" default-size="200">
            <div style="${PANEL_CONTENT_STYLE}">Fixed 200px</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Flexible</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/**
 * Three-panel IDE shell — fixed sidebar, flexible main area, optional inspector. A
 * common layout for editors, dashboards, and admin tools.
 */
export const IdeLayout: Story = {
  name: 'IDE Layout',
  parameters: {
    docs: {
      description: {
        story:
          'Three-panel layout: collapsible navigation sidebar, flexible editor, and a resizable inspector pane.',
      },
      source: {
        code: `
<BSplitter>
  <BSplitterPanel collapsible default-size="220" min="160" max="400">
    Sidebar
  </BSplitterPanel>
  <BSplitterPanel>Editor</BSplitterPanel>
  <BSplitterPanel collapsible default-size="280" min="200">
    Inspector
  </BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:320px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel collapsible default-size="220" min="160" max="400">
            <div style="${PANEL_CONTENT_STYLE}">Sidebar</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Editor</div>
          </BSplitterPanel>
          <BSplitterPanel collapsible default-size="280" min="200">
            <div style="${PANEL_CONTENT_STYLE}">Inspector</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/** Vertical splitter inside a horizontal splitter — chat preview / editor / console. */
export const NestedSplitters: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Compose a vertical splitter as a child of a horizontal one for multi-axis layouts.',
      },
      source: {
        code: `
<BSplitter>
  <BSplitterPanel default-size="40%">Files</BSplitterPanel>
  <BSplitterPanel>
    <BSplitter vertical>
      <BSplitterPanel default-size="60%">Editor</BSplitterPanel>
      <BSplitterPanel>Console</BSplitterPanel>
    </BSplitter>
  </BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="height:360px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel default-size="40%">
            <div style="${PANEL_CONTENT_STYLE}">Files</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <BSplitter vertical>
              <BSplitterPanel default-size="60%">
                <div style="${PANEL_CONTENT_STYLE}">Editor</div>
              </BSplitterPanel>
              <BSplitterPanel>
                <div style="${PANEL_CONTENT_STYLE}">Console</div>
              </BSplitterPanel>
            </BSplitter>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
};

/**
 * Drag-to-resize interaction test — fires `mousedown` → `mousemove` → `mouseup` and verifies
 * the corresponding events emit.
 */
export const DragToResize: Story = {
  name: 'Drag to Resize',
  parameters: {
    docs: {
      description: {
        story:
          'Programmatically drives the dragger via synthetic mouse events and asserts <code>onResize</code> / <code>onResizeEnd</code> fire.',
      },
      source: {
        code: `
<BSplitter @resize="onResize" @resize-end="onResizeEnd">
  <BSplitterPanel default-size="50%">Left</BSplitterPanel>
  <BSplitterPanel>Right</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  args: {
    onResize: fn(),
    onResizeEnd: fn(),
  },
  render: (args) => ({
    components: { BSplitter, BSplitterPanel },
    setup: () => ({ args }),
    template: `
      <div data-testid="container" style="height:200px;width:600px;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter v-bind="args">
          <BSplitterPanel default-size="50%">
            <div style="${PANEL_CONTENT_STYLE}">Left</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Right</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const dragger = container.querySelector('.b-splitter__dragger') as HTMLElement;

    const rect = dragger.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    dragger.dispatchEvent(
      new MouseEvent('mousedown', { clientX: startX, clientY: startY, bubbles: true }),
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', { clientX: startX + 80, clientY: startY, bubbles: true }),
    );
    document.dispatchEvent(
      new MouseEvent('mouseup', { clientX: startX + 80, clientY: startY, bubbles: true }),
    );

    expect(args.onResize).toHaveBeenCalled();
    expect(args.onResizeEnd).toHaveBeenCalled();
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Each dragger is a `role="separator"` with `aria-orientation`, `aria-valuenow/min/max`,
 * and `aria-controls` referencing the two adjacent panels.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each dragger has <code>role="separator"</code>, <code>aria-orientation</code>, ' +
          '<code>aria-valuenow/min/max</code>, and <code>aria-controls</code> referencing the ' +
          'two adjacent panels. Tab focuses the dragger; ' +
          'Arrow keys resize; Enter / Space toggles collapse for the start side; ' +
          'Home shrinks the previous panel toward 0; End grows it.',
      },
      source: {
        code: `
<BSplitter>
  <BSplitterPanel default-size="50%">Panel A</BSplitterPanel>
  <BSplitterPanel>Panel B</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div data-testid="container" style="height:200px;width:600px;border:1px solid #d9d9d9;border-radius:4px;">
        <BSplitter>
          <BSplitterPanel default-size="50%">
            <div style="${PANEL_CONTENT_STYLE}">Panel A</div>
          </BSplitterPanel>
          <BSplitterPanel>
            <div style="${PANEL_CONTENT_STYLE}">Panel B</div>
          </BSplitterPanel>
        </BSplitter>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const dragger = container.querySelector('.b-splitter__dragger') as HTMLElement;

    // Roles & ARIA
    expect(dragger.getAttribute('role')).toBe('separator');
    expect(dragger.getAttribute('aria-orientation')).toBe('vertical');
    expect(dragger.getAttribute('aria-valuemin')).toBe('0');
    expect(dragger.getAttribute('aria-valuemax')).toBe('100');
    expect(Number(dragger.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0);
    expect(dragger.getAttribute('aria-controls')).toMatch(/panel-0\s.*panel-1/);

    // Tabindex
    expect(dragger.getAttribute('tabindex')).toBe('0');

    // Focus and arrow-key resize
    dragger.focus();
    expect(document.activeElement).toBe(dragger);
    const before = Number(dragger.getAttribute('aria-valuenow'));
    await userEvent.keyboard('{ArrowRight}');
    const after = Number(dragger.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(before);
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-splitter-bg`, `--b-splitter-bg-active`, and `--b-splitter-dragger-size`
 * on the splitter (or any ancestor) to retheme without touching the source.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-splitter-*</code> CSS variables on the splitter (or an ancestor) ' +
          'to customise its appearance without touching the source.',
      },
      source: {
        code: `
<BSplitter style="
  --b-splitter-bg: oklch(80% 0.10 30);
  --b-splitter-bg-active: oklch(55% 0.20 25);
  --b-splitter-dragger-size: 12px;
  --b-splitter-split-bar-size: 4px;
">
  <BSplitterPanel>...</BSplitterPanel>
  <BSplitterPanel>...</BSplitterPanel>
</BSplitter>
        `,
      },
    },
  },
  render: () => ({
    components: { BSplitter, BSplitterPanel },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">

        <p style="margin:0;font-size:0.75rem;color:#595959;">Default theme</p>
        <div style="height:120px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
          <BSplitter>
            <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">A</div></BSplitterPanel>
            <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">B</div></BSplitterPanel>
          </BSplitter>
        </div>

        <p style="margin:0;font-size:0.75rem;color:#595959;">
          --b-splitter-bg + --b-splitter-bg-active + --b-splitter-dragger-size
        </p>
        <div style="height:120px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
          <BSplitter style="
            --b-splitter-bg: oklch(80% 0.10 30);
            --b-splitter-bg-active: oklch(55% 0.20 25);
            --b-splitter-dragger-size: 12px;
            --b-splitter-split-bar-size: 4px;
          ">
            <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">A</div></BSplitterPanel>
            <BSplitterPanel><div style="${PANEL_CONTENT_STYLE}">B</div></BSplitterPanel>
          </BSplitter>
        </div>

        <p style="margin:0;font-size:0.75rem;color:#595959;">
          Vertical with custom collapse-bar tokens
        </p>
        <div style="height:200px;width:100%;border:1px solid #d9d9d9;border-radius:4px;">
          <BSplitter vertical style="
            --b-splitter-collapse-bar-bg: oklch(70% 0.16 145);
            --b-splitter-collapse-bar-bg-hover: oklch(50% 0.22 145);
            --b-splitter-collapse-icon-color: #fff;
            --b-splitter-collapse-icon-color-hover: #fff;
            --b-splitter-bg-active: oklch(55% 0.20 145);
          ">
            <BSplitterPanel :collapsible="{ start: true }">
              <div style="${PANEL_CONTENT_STYLE}">Top</div>
            </BSplitterPanel>
            <BSplitterPanel>
              <div style="${PANEL_CONTENT_STYLE}">Bottom</div>
            </BSplitterPanel>
          </BSplitter>
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
  {
    token: '--b-splitter-split-bar-size',
    defaultValue: '2px',
    description: 'Thickness of the visible split bar drawn at the centre of the dragger.',
  },
  {
    token: '--b-splitter-dragger-size',
    defaultValue: '6px',
    description: 'Total hit-area thickness of the dragger (AntD `splitTriggerSize`).',
  },
  {
    token: '--b-splitter-dragger-draggable-size',
    defaultValue: '20px',
    description: 'Length of the visible drag handle (AntD `splitBarDraggableSize`).',
  },
  {
    token: '--b-splitter-bg',
    defaultValue: 'oklch(94% 0 0)',
    description: 'Default colour of the split bar (maps to AntD `colorFill`).',
  },
  {
    token: '--b-splitter-bg-hover',
    defaultValue: 'oklch(85% 0 0)',
    description: 'Hover colour of the split bar (maps to AntD `colorFillSecondary`).',
  },
  {
    token: '--b-splitter-bg-active',
    defaultValue: 'oklch(60% 0.18 264)',
    description: 'Active / dragging / focused colour (maps to AntD `colorPrimary`).',
  },
  {
    token: '--b-splitter-text-color',
    defaultValue: 'oklch(40% 0 0)',
    description: 'Foreground colour for any text inside the splitter.',
  },
  {
    token: '--b-splitter-color-bg-elevated',
    defaultValue: '#fff',
    description: 'Elevated background (used for floating elements above panels).',
  },
  {
    token: '--b-splitter-collapse-bar-bg',
    defaultValue: 'oklch(94% 0 0)',
    description: 'Background of the collapse button.',
  },
  {
    token: '--b-splitter-collapse-bar-bg-hover',
    defaultValue: 'oklch(60% 0.18 264)',
    description: 'Hover background of the collapse button.',
  },
  {
    token: '--b-splitter-collapse-icon-color',
    defaultValue: 'oklch(60% 0 0)',
    description: 'Icon colour inside the collapse button.',
  },
  {
    token: '--b-splitter-collapse-icon-color-hover',
    defaultValue: '#fff',
    description: 'Icon colour on hover.',
  },
  {
    token: '--b-splitter-motion-duration',
    defaultValue: '0.2s',
    description: 'Duration of the collapse / hover transitions.',
  },
  {
    token: '--b-splitter-z-index-base',
    defaultValue: '1',
    description: 'Base z-index for the dragger; the lazy preview indicator stacks above.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A reference of every CSS variable exposed by <code>BSplitter</code>. ' +
          'Override any of these on the component itself or an ancestor selector to ' +
          're-skin without touching component source.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BSplitter — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-splitter</code>. Override inline or via a CSS class.
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
