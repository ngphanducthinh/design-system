import { BSplitter, BSplitterPanel } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
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
      table: { defaultValue: { summary: 'horizontal' }, category: 'Props' },
    },
    vertical: {
      control: 'boolean',
      description: 'Convenience boolean for vertical orientation.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    lazy: {
      control: 'boolean',
      description:
        'Whether the resize is committed only on release (a preview line shows during the drag).',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    collapsible: {
      control: 'object',
      description:
        'Splitter-level collapsible config: `{ motion?: boolean; icon?: { start?, end? } }`.',
      table: { category: 'Props' },
    },
    onResize: { table: { category: 'Events' } },
    onResizeStart: { table: { category: 'Events' } },
    onResizeEnd: { table: { category: 'Events' } },
    onCollapse: { table: { category: 'Events' } },
    onDraggerDoubleClick: { table: { category: 'Events' } },
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
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    vertical: false,
    lazy: false,
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

// ─────────────────────────────────────────────
// 2. Vertical orientation
// ─────────────────────────────────────────────
export const Vertical: Story = {
  name: 'Vertical orientation',
  parameters: { controls: { disable: true } },
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

// ─────────────────────────────────────────────
// 3. Min / Max constraints
// ─────────────────────────────────────────────
export const MinMaxConstraints: Story = {
  name: 'Min / max constraints',
  parameters: { controls: { disable: true } },
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

// ─────────────────────────────────────────────
// 4. Lazy mode
// ─────────────────────────────────────────────
export const Lazy: Story = {
  name: 'Lazy mode (preview during drag)',
  parameters: { controls: { disable: true } },
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

// ─────────────────────────────────────────────
// 5. Collapsible
// ─────────────────────────────────────────────
export const Collapsible: Story = {
  name: 'Collapsible panels',
  parameters: { controls: { disable: true } },
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

// ─────────────────────────────────────────────
// 6. Disabled (non-resizable) panel
// ─────────────────────────────────────────────
export const NonResizable: Story = {
  name: 'Non-resizable panel',
  parameters: { controls: { disable: true } },
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
// 7. Accessibility (interaction test)
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Each dragger has <code>role="separator"</code>, <code>aria-orientation</code>, ' +
          '<code>aria-valuenow/min/max</code>, and <code>aria-controls</code> referencing the ' +
          'two adjacent panels. Tab focuses the dragger; ' +
          'Arrow keys resize; Enter / Space toggles collapse for the start side; ' +
          'Home shrinks the previous panel toward 0; End grows it.',
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
// 8. Interaction — drag to resize
// ─────────────────────────────────────────────
export const DragToResize: Story = {
  name: 'Interaction — drag to resize',
  parameters: { controls: { disable: true } },
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
// 9. Theming (CSS vars)
// ─────────────────────────────────────────────
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
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
// 10. Design Tokens (LAST story)
// ─────────────────────────────────────────────
const TOKENS: Array<{ name: string; def: string; desc: string }> = [
  {
    name: '--b-splitter-split-bar-size',
    def: '2px',
    desc: 'Thickness of the visible split bar drawn at the centre of the dragger.',
  },
  {
    name: '--b-splitter-dragger-size',
    def: '6px',
    desc: 'Total hit-area thickness of the dragger (AntD `splitTriggerSize`).',
  },
  {
    name: '--b-splitter-dragger-draggable-size',
    def: '20px',
    desc: 'Length of the visible drag handle (AntD `splitBarDraggableSize`).',
  },
  {
    name: '--b-splitter-bg',
    def: 'oklch(94% 0 0)',
    desc: 'Default colour of the split bar (maps to AntD `colorFill`).',
  },
  {
    name: '--b-splitter-bg-hover',
    def: 'oklch(85% 0 0)',
    desc: 'Hover colour of the split bar (maps to AntD `colorFillSecondary`).',
  },
  {
    name: '--b-splitter-bg-active',
    def: 'oklch(60% 0.18 264)',
    desc: 'Active / dragging / focused colour (maps to AntD `colorPrimary`).',
  },
  {
    name: '--b-splitter-text-color',
    def: 'oklch(40% 0 0)',
    desc: 'Foreground colour for any text inside the splitter.',
  },
  {
    name: '--b-splitter-color-bg-elevated',
    def: '#fff',
    desc: 'Elevated background (used for floating elements above panels).',
  },
  {
    name: '--b-splitter-collapse-bar-bg',
    def: 'oklch(94% 0 0)',
    desc: 'Background of the collapse button.',
  },
  {
    name: '--b-splitter-collapse-bar-bg-hover',
    def: 'oklch(60% 0.18 264)',
    desc: 'Hover background of the collapse button.',
  },
  {
    name: '--b-splitter-collapse-icon-color',
    def: 'oklch(60% 0 0)',
    desc: 'Icon colour inside the collapse button.',
  },
  {
    name: '--b-splitter-collapse-icon-color-hover',
    def: '#fff',
    desc: 'Icon colour on hover.',
  },
  {
    name: '--b-splitter-motion-duration',
    def: '0.2s',
    desc: 'Duration of the collapse / hover transitions.',
  },
  {
    name: '--b-splitter-z-index-base',
    def: '1',
    desc: 'Base z-index for the dragger; the lazy preview indicator stacks above.',
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
    setup: () => ({ tokens: TOKENS }),
    template: `
      <div style="font-family:sans-serif;font-size:14px;">
        <h3 style="margin:0 0 0.75rem;">BSplitter Design Tokens</h3>
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr style="background:oklch(96% 0.01 264);">
              <th style="text-align:left;padding:8px;border:1px solid #d9d9d9;">Variable</th>
              <th style="text-align:left;padding:8px;border:1px solid #d9d9d9;">Default</th>
              <th style="text-align:left;padding:8px;border:1px solid #d9d9d9;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tokens" :key="t.name">
              <td style="padding:8px;border:1px solid #d9d9d9;font-family:monospace;white-space:nowrap;">{{ t.name }}</td>
              <td style="padding:8px;border:1px solid #d9d9d9;font-family:monospace;white-space:nowrap;">{{ t.def }}</td>
              <td style="padding:8px;border:1px solid #d9d9d9;">{{ t.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
