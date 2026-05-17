import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import BCollapse from './BCollapse.vue';
import BCollapsePanel from './BCollapsePanel.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountCollapse(
  props: Record<string, unknown> = {},
  panels: {
    key: string | number;
    header: string;
    content: string;
    panelProps?: Record<string, unknown>;
  }[] = [
    { key: '1', header: 'Panel 1', content: 'Content 1' },
    { key: '2', header: 'Panel 2', content: 'Content 2' },
    { key: '3', header: 'Panel 3', content: 'Content 3' },
  ],
) {
  return mount(BCollapse, {
    props,
    slots: {
      default: panels
        .map(
          (p) =>
            `<BCollapsePanel panel-key="${p.key}" header="${p.header}" ${Object.entries(
              p.panelProps ?? {},
            )
              .map(([k, v]) => `${k}="${v}"`)
              .join(' ')}>${p.content}</BCollapsePanel>`,
        )
        .join('\n'),
    },
    global: {
      components: { BCollapsePanel },
    },
  });
}

function mountStandalonePanel(props: Record<string, unknown> = {}, slotContent = 'Panel content') {
  return mount(BCollapsePanel, {
    props: { panelKey: 'test', header: 'Test Panel', ...props },
    slots: { default: slotContent },
  });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BCollapse – defaults and variants', () => {
  it('renders root .b-collapse element with bordered class by default', () => {
    const wrapper = mountCollapse();
    expect(wrapper.find('.b-collapse').exists()).toBe(true);
    expect(wrapper.find('.b-collapse--bordered').exists()).toBe(true);
  });

  it('renders all panels', () => {
    const wrapper = mountCollapse();
    expect(wrapper.findAll('.b-collapse-panel')).toHaveLength(3);
  });

  it('all panels are collapsed by default', () => {
    const wrapper = mountCollapse();
    const headers = wrapper.findAll('.b-collapse-panel__header');
    headers.forEach((h) => {
      expect(h.attributes('aria-expanded')).toBe('false');
    });
  });

  it('renders borderless variant', () => {
    const wrapper = mountCollapse({ bordered: false });
    expect(wrapper.find('.b-collapse--borderless').exists()).toBe(true);
    expect(wrapper.find('.b-collapse--bordered').exists()).toBe(false);
  });

  it('renders ghost variant', () => {
    const wrapper = mountCollapse({ ghost: true });
    expect(wrapper.find('.b-collapse--ghost').exists()).toBe(true);
  });

  it('renders small size', () => {
    const wrapper = mountCollapse({ size: 'small' });
    expect(wrapper.find('.b-collapse--small').exists()).toBe(true);
  });

  it('renders with role="presentation" on the group', () => {
    const wrapper = mountCollapse();
    expect(wrapper.find('.b-collapse').attributes('role')).toBe('presentation');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BCollapse – props map to DOM', () => {
  it('defaultActiveKey opens specified panels on mount', () => {
    const wrapper = mountCollapse({ defaultActiveKey: ['1', '3'] });
    const panels = wrapper.findAll('.b-collapse-panel');
    expect(panels[0].classes()).toContain('b-collapse-panel--active');
    expect(panels[1].classes()).not.toContain('b-collapse-panel--active');
    expect(panels[2].classes()).toContain('b-collapse-panel--active');
  });

  it('clicking a header toggles the panel', async () => {
    const wrapper = mountCollapse();
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');

    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).not.toContain(
      'b-collapse-panel--active',
    );
  });

  it('multiple panels can be open simultaneously (non-accordion)', async () => {
    const wrapper = mountCollapse();
    const headers = wrapper.findAll('.b-collapse-panel__header');

    await headers[0].trigger('click');
    await headers[1].trigger('click');

    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).toContain('b-collapse-panel--active');
  });

  it('accordion mode allows only one panel open at a time', async () => {
    const wrapper = mountCollapse({ accordion: true });
    const headers = wrapper.findAll('.b-collapse-panel__header');

    await headers[0].trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');

    await headers[1].trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).not.toContain(
      'b-collapse-panel--active',
    );
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).toContain('b-collapse-panel--active');
  });

  it('accordion mode closes panel when clicking the same panel', async () => {
    const wrapper = mountCollapse({ accordion: true });
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');

    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).not.toContain(
      'b-collapse-panel--active',
    );
  });

  it('expand icon position end flips header layout', () => {
    const wrapper = mountCollapse({ expandIconPosition: 'end' });
    expect(wrapper.find('.b-collapse-panel__header--icon-end').exists()).toBe(true);
  });

  it('collapsible="icon" prevents header click from toggling', async () => {
    const wrapper = mountCollapse({ collapsible: 'icon' });
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).not.toContain(
      'b-collapse-panel--active',
    );
  });

  it('collapsible="icon" allows icon click to toggle', async () => {
    const wrapper = mountCollapse({ collapsible: 'icon' });
    const arrow = wrapper.findAll('.b-collapse-panel__arrow')[0];

    await arrow.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
  });

  it('panel shows arrow by default', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__arrow').exists()).toBe(true);
  });

  it('panel hides arrow when showArrow=false', () => {
    const wrapper = mountStandalonePanel({ showArrow: false });
    expect(wrapper.find('.b-collapse-panel__arrow').exists()).toBe(false);
  });

  it('panel renders header text from prop', () => {
    const wrapper = mountStandalonePanel({ header: 'My Header' });
    expect(wrapper.find('.b-collapse-panel__header-text').text()).toBe('My Header');
  });

  it('panel renders extra content', () => {
    const wrapper = mountStandalonePanel({ extra: 'Extra text' });
    expect(wrapper.find('.b-collapse-panel__extra').text()).toBe('Extra text');
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BCollapse – events', () => {
  it('emits change with active keys when panel is toggled', async () => {
    const wrapper = mountCollapse();
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([['1']]);
  });

  it('emits update:modelValue for v-model binding', async () => {
    const wrapper = mountCollapse();
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['1']]);
  });

  it('emits correct keys when closing a panel', async () => {
    const wrapper = mountCollapse({ defaultActiveKey: ['1', '2'] });
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    const lastChange = wrapper.emitted('change')!.at(-1);
    expect(lastChange).toEqual([['2']]);
  });

  it('emits empty array when accordion panel is closed', async () => {
    const wrapper = mountCollapse({ accordion: true, defaultActiveKey: ['1'] });
    const header = wrapper.findAll('.b-collapse-panel__header')[0];

    await header.trigger('click');
    const lastChange = wrapper.emitted('change')!.at(-1);
    expect(lastChange).toEqual([[]]);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BCollapse – keyboard', () => {
  it('Enter key toggles panel', async () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');

    await header.trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.b-collapse-panel').classes()).toContain('b-collapse-panel--active');

    await header.trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.b-collapse-panel').classes()).not.toContain('b-collapse-panel--active');
  });

  it('Space key toggles panel', async () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');

    await header.trigger('keydown', { key: ' ' });
    expect(wrapper.find('.b-collapse-panel').classes()).toContain('b-collapse-panel--active');
  });

  it('other keys do not toggle panel', async () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');

    await header.trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.b-collapse-panel').classes()).not.toContain('b-collapse-panel--active');
  });

  it('disabled panel ignores keyboard', async () => {
    const wrapper = mountStandalonePanel({ disabled: true });
    const header = wrapper.find('.b-collapse-panel__header');

    await header.trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.b-collapse-panel').classes()).not.toContain('b-collapse-panel--active');
  });

  it('header has tabindex="0" by default', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__header').attributes('tabindex')).toBe('0');
  });

  it('disabled header has tabindex="-1"', () => {
    const wrapper = mountStandalonePanel({ disabled: true });
    expect(wrapper.find('.b-collapse-panel__header').attributes('tabindex')).toBe('-1');
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BCollapse – accessibility', () => {
  it('header has role="button"', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__header').attributes('role')).toBe('button');
  });

  it('header has aria-expanded reflecting state', async () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');

    expect(header.attributes('aria-expanded')).toBe('false');

    await header.trigger('click');
    expect(header.attributes('aria-expanded')).toBe('true');
  });

  it('header has aria-controls pointing to content id', () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');
    const contentWrapper = wrapper.find('.b-collapse-panel__content-wrapper');

    expect(header.attributes('aria-controls')).toBe(contentWrapper.attributes('id'));
  });

  it('content region has aria-labelledby pointing to header id', () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');
    const contentWrapper = wrapper.find('.b-collapse-panel__content-wrapper');

    expect(contentWrapper.attributes('aria-labelledby')).toBe(header.attributes('id'));
  });

  it('content has role="region"', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__content-wrapper').attributes('role')).toBe('region');
  });

  it('content has aria-hidden="true" when collapsed', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__content-wrapper').attributes('aria-hidden')).toBe(
      'true',
    );
  });

  it('content has aria-hidden="false" when expanded', async () => {
    const wrapper = mountStandalonePanel();
    await wrapper.find('.b-collapse-panel__header').trigger('click');
    expect(wrapper.find('.b-collapse-panel__content-wrapper').attributes('aria-hidden')).toBe(
      'false',
    );
  });

  it('disabled panel has aria-disabled="true"', () => {
    const wrapper = mountStandalonePanel({ disabled: true });
    expect(wrapper.find('.b-collapse-panel__header').attributes('aria-disabled')).toBe('true');
  });

  it('arrow icon is aria-hidden', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__arrow').attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 6. Controlled vs uncontrolled
// ─────────────────────────────────────────────
describe('BCollapse – controlled vs uncontrolled', () => {
  it('uncontrolled: manages own state with defaultActiveKey', async () => {
    const wrapper = mountCollapse({ defaultActiveKey: ['2'] });
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).toContain('b-collapse-panel--active');

    // Click toggles without needing external state
    const header = wrapper.findAll('.b-collapse-panel__header')[0];
    await header.trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
  });

  it('controlled: reflects modelValue', async () => {
    const TestHost = defineComponent({
      components: { BCollapse, BCollapsePanel },
      setup() {
        const activeKeys = ref<(string | number)[]>(['1']);
        return { activeKeys };
      },
      template: `
        <BCollapse v-model="activeKeys">
          <BCollapsePanel panel-key="1" header="Panel 1">Content 1</BCollapsePanel>
          <BCollapsePanel panel-key="2" header="Panel 2">Content 2</BCollapsePanel>
        </BCollapse>
      `,
    });

    const wrapper = mount(TestHost);
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).not.toContain(
      'b-collapse-panel--active',
    );

    // Click panel 2
    await wrapper.findAll('.b-collapse-panel__header')[1].trigger('click');
    await nextTick();
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).toContain('b-collapse-panel--active');
  });

  it('standalone panel works without group parent', async () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel--active').exists()).toBe(false);

    await wrapper.find('.b-collapse-panel__header').trigger('click');
    expect(wrapper.find('.b-collapse-panel--active').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. Edge cases
// ─────────────────────────────────────────────
describe('BCollapse – edge cases', () => {
  it('disabled panel cannot be toggled by click', async () => {
    const wrapper = mountStandalonePanel({ disabled: true });
    await wrapper.find('.b-collapse-panel__header').trigger('click');
    expect(wrapper.find('.b-collapse-panel--active').exists()).toBe(false);
  });

  it('collapsible="disabled" at group level disables all panels', async () => {
    const wrapper = mountCollapse({ collapsible: 'disabled' });
    await wrapper.findAll('.b-collapse-panel__header')[0].trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).not.toContain(
      'b-collapse-panel--active',
    );
  });

  it('panel-level collapsible overrides group-level', async () => {
    const TestHost = defineComponent({
      components: { BCollapse, BCollapsePanel },
      template: `
        <BCollapse collapsible="disabled">
          <BCollapsePanel panel-key="1" header="P1" collapsible="header">Content 1</BCollapsePanel>
          <BCollapsePanel panel-key="2" header="P2">Content 2</BCollapsePanel>
        </BCollapse>
      `,
    });
    const wrapper = mount(TestHost);

    // Panel 1 has its own collapsible="header", should be clickable
    await wrapper.findAll('.b-collapse-panel__header')[0].trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');

    // Panel 2 inherits group disabled
    await wrapper.findAll('.b-collapse-panel__header')[1].trigger('click');
    expect(wrapper.findAll('.b-collapse-panel')[1].classes()).not.toContain(
      'b-collapse-panel--active',
    );
  });

  it('forceRender renders content even when collapsed', () => {
    const wrapper = mountStandalonePanel({ forceRender: true });
    expect(wrapper.find('.b-collapse-panel__content').exists()).toBe(true);
    expect(wrapper.find('.b-collapse-panel--active').exists()).toBe(false);
  });

  it('content is lazy-rendered by default (not in DOM when collapsed)', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__content').exists()).toBe(false);
  });

  it('content stays rendered once opened (not destroyed on close)', async () => {
    const wrapper = mountStandalonePanel();
    const header = wrapper.find('.b-collapse-panel__header');

    await header.trigger('click');
    expect(wrapper.find('.b-collapse-panel__content').exists()).toBe(true);

    await header.trigger('click');
    // Content should still be in DOM after close (has been rendered once)
    expect(wrapper.find('.b-collapse-panel__content').exists()).toBe(true);
  });

  it('numeric keys work', async () => {
    const TestHost = defineComponent({
      components: { BCollapse, BCollapsePanel },
      template: `
        <BCollapse :default-active-key="[1]">
          <BCollapsePanel :panel-key="1" header="One">C1</BCollapsePanel>
          <BCollapsePanel :panel-key="2" header="Two">C2</BCollapsePanel>
        </BCollapse>
      `,
    });
    const wrapper = mount(TestHost);
    expect(wrapper.findAll('.b-collapse-panel')[0].classes()).toContain('b-collapse-panel--active');
  });

  it('header slot overrides header prop', () => {
    const wrapper = mount(BCollapsePanel, {
      props: { panelKey: '1', header: 'Prop Header' },
      slots: {
        header: 'Slot Header',
        default: 'Content',
      },
    });
    expect(wrapper.find('.b-collapse-panel__header-text').text()).toBe('Slot Header');
  });

  it('extra slot overrides extra prop', () => {
    const wrapper = mount(BCollapsePanel, {
      props: { panelKey: '1', header: 'Header', extra: 'Prop Extra' },
      slots: {
        extra: 'Slot Extra',
        default: 'Content',
      },
    });
    expect(wrapper.find('.b-collapse-panel__extra').text()).toBe('Slot Extra');
  });
});

// ─────────────────────────────────────────────
// 8. Animation (deterministic with CSS grid)
// ─────────────────────────────────────────────
describe('BCollapse – animation classes', () => {
  it('collapsed panel has grid-rows 0fr class', () => {
    const wrapper = mountStandalonePanel();
    const contentWrapper = wrapper.find('.b-collapse-panel__content-wrapper');
    expect(contentWrapper.classes()).not.toContain('b-collapse-panel__content-wrapper--active');
  });

  it('expanded panel has grid-rows 1fr class', async () => {
    const wrapper = mountStandalonePanel();
    await wrapper.find('.b-collapse-panel__header').trigger('click');
    const contentWrapper = wrapper.find('.b-collapse-panel__content-wrapper');
    expect(contentWrapper.classes()).toContain('b-collapse-panel__content-wrapper--active');
  });

  it('arrow rotates when panel is active', async () => {
    const wrapper = mountStandalonePanel();
    await wrapper.find('.b-collapse-panel__header').trigger('click');
    expect(wrapper.find('.b-collapse-panel__arrow--active').exists()).toBe(true);
  });

  it('arrow does not rotate when panel is collapsed', () => {
    const wrapper = mountStandalonePanel();
    expect(wrapper.find('.b-collapse-panel__arrow--active').exists()).toBe(false);
  });
});
