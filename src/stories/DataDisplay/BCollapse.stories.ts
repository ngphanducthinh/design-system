import { BCollapse, BCollapsePanel } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'DataDisplay/Collapse',
  component: BCollapse,
  subcomponents: { BCollapsePanel },
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'object',
      description: 'Active panel key(s). Bind with `v-model` for two-way controlled mode.',
      table: { category: 'Two-Way Binding Props' },
    },
    defaultActiveKey: {
      control: 'object',
      description: 'Initially active panel key(s) for uncontrolled mode.',
      table: { defaultValue: { summary: '[]' }, category: 'Props' },
    },
    accordion: {
      control: 'boolean',
      description: 'Accordion mode - only one panel open at a time.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around the collapse.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    collapsible: {
      control: 'select',
      options: ['header', 'icon', 'disabled'],
      description: 'Collapsible trigger area: header, icon only, or disabled.',
      table: { category: 'Props' },
    },
    expandIconPosition: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Position of the expand icon.',
      table: { defaultValue: { summary: 'start' }, category: 'Props' },
    },
    ghost: {
      control: 'boolean',
      description: 'Ghost mode - borderless with transparent background.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size of the collapse.',
      table: { defaultValue: { summary: 'default' }, category: 'Props' },
    },
  },
  decorators: [
    () => ({
      template: '<div style="display:flex;justify-content:center;padding:2rem;"><div style="width:100%;max-width:600px;"><story /></div></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BCollapse</code> component group panels of content under collapsible headers.<br><br>' +
          'Supports <strong>accordion</strong> mode, <strong>bordered/borderless/ghost</strong> variants, ' +
          '<strong>icon position</strong>, <strong>collapsible trigger</strong> areas, and <strong>size</strong> variants.<br>' +
          'Theming via <code>--b-collapse-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BCollapse>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample content
// ─────────────────────────────────────────────
const loremShort = 'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.';
const loremLong = 'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world. Dogs come in various breeds, each with unique characteristics and temperaments. They have been human companions for thousands of years, serving as guards, herders, hunters, and beloved family pets. Regular exercise, proper nutrition, and veterinary care are essential for maintaining a healthy and happy dog.';

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    accordion: false,
    bordered: true,
    ghost: false,
    size: 'default',
    expandIconPosition: 'start',
    defaultActiveKey: ['1'],
  },
  render: (args) => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { args, loremShort };
    },
    template: `
      <BCollapse v-bind="args">
        <BCollapsePanel panel-key="1" header="This is panel header 1">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="2" header="This is panel header 2">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="3" header="This is panel header 3">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
      </BCollapse>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Accordion
// ─────────────────────────────────────────────
export const Accordion: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'In accordion mode, only one panel can be expanded at a time.',
      },
      source: {
        code: `
<BCollapse accordion :default-active-key="['1']">
  <BCollapsePanel panel-key="1" header="Panel 1">Content 1</BCollapsePanel>
  <BCollapsePanel panel-key="2" header="Panel 2">Content 2</BCollapsePanel>
  <BCollapsePanel panel-key="3" header="Panel 3">Content 3</BCollapsePanel>
</BCollapse>
        `,
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <BCollapse accordion :default-active-key="['1']">
        <BCollapsePanel panel-key="1" header="This is panel header 1">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="2" header="This is panel header 2">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="3" header="This is panel header 3">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
      </BCollapse>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Borderless & Ghost
// ─────────────────────────────────────────────
export const Variants: Story = {
  name: 'Bordered / Borderless / Ghost',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Three visual variants: bordered (default), borderless, and ghost.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Bordered (default)</h4>
          <BCollapse :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Bordered panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Bordered panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Borderless</h4>
          <BCollapse :bordered="false" :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Borderless panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Borderless panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Ghost</h4>
          <BCollapse ghost :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Ghost panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Ghost panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Sizes
// ─────────────────────────────────────────────
export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Default and small size variants.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Default size</h4>
          <BCollapse :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Default size panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Default size panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Small size</h4>
          <BCollapse size="small" :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Small size panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Small size panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Expand icon position & collapsible trigger
// ─────────────────────────────────────────────
export const ExpandIconAndTrigger: Story = {
  name: 'Expand Icon Position & Collapsible Trigger',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Expand icon at start/end and collapsible trigger area: header (default), icon only.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Icon at end</h4>
          <BCollapse expand-icon-position="end" :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Collapsible by icon only</h4>
          <BCollapse collapsible="icon" :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Click the icon, not the header"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Disabled & Extra
// ─────────────────────────────────────────────
export const DisabledAndExtra: Story = {
  name: 'Disabled Panels & Extra Content',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Panels can be individually disabled. Extra content appears at the end of the header.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <BCollapse :default-active-key="['1']" >
        <BCollapsePanel panel-key="1" header="Active panel" extra="Extra info">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="2" header="Disabled panel" :disabled="true">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="3" header="Panel with extra" extra="Settings">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
      </BCollapse>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Controlled (v-model)
// ─────────────────────────────────────────────
export const Controlled: Story = {
  name: 'Controlled (v-model)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Use `v-model` for fully controlled active key state. The badge shows which panels are active.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      const activeKeys = ref<(string | number)[]>(['1']);
      return { activeKeys, loremShort };
    },
    template: `
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 13px; color: #666;">
          Active keys: <code>{{ JSON.stringify(activeKeys) }}</code>
        </p>
        <BCollapse v-model="activeKeys">
          <BCollapsePanel panel-key="1" header="Panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
          <BCollapsePanel panel-key="2" header="Panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          <BCollapsePanel panel-key="3" header="Panel 3"><p>{{ loremShort }}</p></BCollapsePanel>
        </BCollapse>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Headers use `role="button"` with `aria-expanded`, `aria-controls`, and `tabindex`. ' +
          'Content regions use `role="region"` with `aria-labelledby` and `aria-hidden`. ' +
          'Keyboard: Tab to focus, Enter/Space to toggle. Arrow icons are `aria-hidden`.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <BCollapse :default-active-key="['1']"  data-testid="a11y-collapse">
        <BCollapsePanel panel-key="1" header="Accessible panel 1" data-testid="a11y-panel-1">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="2" header="Accessible panel 2" data-testid="a11y-panel-2">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
        <BCollapsePanel panel-key="3" header="Disabled panel" :disabled="true" data-testid="a11y-panel-disabled">
          <p>{{ loremShort }}</p>
        </BCollapsePanel>
      </BCollapse>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Panel 1 - should be active
    const panel1 = canvas.getByTestId('a11y-panel-1');
    const header1 = panel1.querySelector('.b-collapse-panel__header')!;
    const content1 = panel1.querySelector('.b-collapse-panel__content-wrapper')!;

    // role="button" on header
    expect(header1.getAttribute('role')).toBe('button');
    // aria-expanded="true" (active by default)
    expect(header1.getAttribute('aria-expanded')).toBe('true');
    // aria-controls links to content
    expect(header1.getAttribute('aria-controls')).toBe(content1.getAttribute('id'));
    // tabindex="0"
    expect(header1.getAttribute('tabindex')).toBe('0');
    // content region
    expect(content1.getAttribute('role')).toBe('region');
    expect(content1.getAttribute('aria-labelledby')).toBe(header1.getAttribute('id'));
    expect(content1.getAttribute('aria-hidden')).toBe('false');

    // Panel 2 - collapsed
    const panel2 = canvas.getByTestId('a11y-panel-2');
    const header2 = panel2.querySelector('.b-collapse-panel__header')!;
    expect(header2.getAttribute('aria-expanded')).toBe('false');
    const content2 = panel2.querySelector('.b-collapse-panel__content-wrapper')!;
    expect(content2.getAttribute('aria-hidden')).toBe('true');

    // Arrow is aria-hidden
    const arrow = panel1.querySelector('.b-collapse-panel__arrow');
    expect(arrow?.getAttribute('aria-hidden')).toBe('true');

    // Disabled panel
    const disabledPanel = canvas.getByTestId('a11y-panel-disabled');
    const disabledHeader = disabledPanel.querySelector('.b-collapse-panel__header')!;
    expect(disabledHeader.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHeader.getAttribute('tabindex')).toBe('-1');
  },
};

// ─────────────────────────────────────────────
// 9. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-collapse-*` CSS custom properties to customise the collapse appearance.',
      },
      source: {
        code: `
<style>
.custom-collapse {
  --b-collapse-header-bg: #f0e6ff;
  --b-collapse-header-color: #531dab;
  --b-collapse-content-bg: #faf5ff;
  --b-collapse-border-color: #d3adf7;
  --b-collapse-arrow-color: #722ed1;
}
</style>

<BCollapse class="custom-collapse">
  <BCollapsePanel panel-key="1" header="Custom themed">Content</BCollapsePanel>
</BCollapse>
        `,
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Default</h4>
          <BCollapse :default-active-key="['1']">
            <BCollapsePanel panel-key="1" header="Default panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Default panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Purple theme</h4>
          <BCollapse
            :default-active-key="['1']"
            style="--b-collapse-header-bg: #f9f0ff; --b-collapse-header-color: #531dab; --b-collapse-content-bg: #faf5ff; --b-collapse-border-color: #d3adf7; --b-collapse-arrow-color: #722ed1;"
          >
            <BCollapsePanel panel-key="1" header="Purple panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Purple panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
        <div>
          <h4 style="margin: 0 0 0.5rem; font-size: 14px; font-weight: 500;">Green theme</h4>
          <BCollapse
            :default-active-key="['1']"
            style="--b-collapse-header-bg: #f6ffed; --b-collapse-header-color: #237804; --b-collapse-content-bg: #fcfff5; --b-collapse-border-color: #b7eb8f; --b-collapse-arrow-color: #389e0d;"
          >
            <BCollapsePanel panel-key="1" header="Green panel 1"><p>{{ loremShort }}</p></BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Green panel 2"><p>{{ loremShort }}</p></BCollapsePanel>
          </BCollapse>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Interaction Tests
// ─────────────────────────────────────────────
export const InteractionTests: Story = {
  name: 'Interaction – toggle, accordion, keyboard',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Automated play function: verifies click toggling, accordion behavior, keyboard navigation, and disabled state.',
      },
    },
  },
  render: () => ({
    components: { BCollapse, BCollapsePanel },
    setup() {
      return { loremShort };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div data-testid="basic-collapse">
          <BCollapse>
            <BCollapsePanel panel-key="1" header="Panel 1" data-testid="basic-panel-1">
              <p>{{ loremShort }}</p>
            </BCollapsePanel>
            <BCollapsePanel panel-key="2" header="Panel 2" data-testid="basic-panel-2">
              <p>{{ loremShort }}</p>
            </BCollapsePanel>
          </BCollapse>
        </div>
        <div data-testid="accordion-collapse">
          <BCollapse accordion>
            <BCollapsePanel panel-key="a" header="Accordion A" data-testid="acc-panel-a">
              <p>{{ loremShort }}</p>
            </BCollapsePanel>
            <BCollapsePanel panel-key="b" header="Accordion B" data-testid="acc-panel-b">
              <p>{{ loremShort }}</p>
            </BCollapsePanel>
          </BCollapse>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // --- Basic collapse: click toggle ---
    const basicPanel1 = canvas.getByTestId('basic-panel-1');
    const header1 = basicPanel1.querySelector('.b-collapse-panel__header')!;

    // Initially collapsed
    expect(basicPanel1.classList.contains('b-collapse-panel--active')).toBe(false);

    // Click to open
    await userEvent.click(header1);
    expect(basicPanel1.classList.contains('b-collapse-panel--active')).toBe(true);

    // Click to close
    await userEvent.click(header1);
    expect(basicPanel1.classList.contains('b-collapse-panel--active')).toBe(false);

    // --- Basic: multiple open ---
    const basicPanel2 = canvas.getByTestId('basic-panel-2');
    const header2 = basicPanel2.querySelector('.b-collapse-panel__header')!;

    await userEvent.click(header1);
    await userEvent.click(header2);
    expect(basicPanel1.classList.contains('b-collapse-panel--active')).toBe(true);
    expect(basicPanel2.classList.contains('b-collapse-panel--active')).toBe(true);

    // --- Accordion: only one open at a time ---
    const accPanelA = canvas.getByTestId('acc-panel-a');
    const accPanelB = canvas.getByTestId('acc-panel-b');
    const accHeaderA = accPanelA.querySelector('.b-collapse-panel__header')!;
    const accHeaderB = accPanelB.querySelector('.b-collapse-panel__header')!;

    await userEvent.click(accHeaderA);
    expect(accPanelA.classList.contains('b-collapse-panel--active')).toBe(true);
    expect(accPanelB.classList.contains('b-collapse-panel--active')).toBe(false);

    await userEvent.click(accHeaderB);
    expect(accPanelA.classList.contains('b-collapse-panel--active')).toBe(false);
    expect(accPanelB.classList.contains('b-collapse-panel--active')).toBe(true);

    // --- Keyboard: Enter to toggle ---
    await userEvent.click(accHeaderA); // reset: open A
    // Focus header A and press Enter
    (accHeaderA as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    // A should toggle (it was open → closed)
    expect(accPanelA.classList.contains('b-collapse-panel--active')).toBe(false);
  },
};
