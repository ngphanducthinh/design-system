import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import BSplitter from './BSplitter.vue';
import BSplitterPanel from './BSplitterPanel.vue';

/**
 * Fakes JSDOM layout so the splitter has a measurable container.
 */
function mockLayout(width = 1000, height = 600) {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => width,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => height,
  });
}
function unmockLayout() {
  // @ts-expect-error - reset to default
  delete HTMLElement.prototype.clientWidth;
  // @ts-expect-error - reset to default
  delete HTMLElement.prototype.clientHeight;
}

const TwoPanelSplitter = defineComponent({
  components: { BSplitter, BSplitterPanel },
  template: `
    <BSplitter v-bind="$attrs">
      <BSplitterPanel data-testid="panel-a">A</BSplitterPanel>
      <BSplitterPanel data-testid="panel-b">B</BSplitterPanel>
    </BSplitter>
  `,
});

const ThreePanelSplitter = defineComponent({
  components: { BSplitter, BSplitterPanel },
  template: `
    <BSplitter v-bind="$attrs">
      <BSplitterPanel>A</BSplitterPanel>
      <BSplitterPanel>B</BSplitterPanel>
      <BSplitterPanel>C</BSplitterPanel>
    </BSplitter>
  `,
});

function getDragger(wrapper: VueWrapper, idx = 0) {
  return wrapper.findAll('.b-splitter__dragger')[idx];
}

async function settle() {
  await nextTick();
  await nextTick();
}

describe('BSplitter', () => {
  beforeEach(() => mockLayout(1000, 600));
  afterEach(() => unmockLayout());

  describe('defaults and variants', () => {
    it('renders horizontal by default', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      expect(wrapper.find('.b-splitter').exists()).toBe(true);
      expect(wrapper.find('.b-splitter--horizontal').exists()).toBe(true);
      expect(wrapper.find('.b-splitter--vertical').exists()).toBe(false);
      expect(wrapper.find('[data-orientation="horizontal"]').exists()).toBe(true);
    });

    it('renders vertical when vertical=true', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { vertical: true } });
      await settle();
      expect(wrapper.find('.b-splitter--vertical').exists()).toBe(true);
    });

    it('orientation prop takes precedence over `vertical=false`', async () => {
      const wrapper = mount(TwoPanelSplitter, {
        attrs: { orientation: 'vertical', vertical: false },
      });
      await settle();
      expect(wrapper.find('.b-splitter--vertical').exists()).toBe(true);
    });

    it('renders one fewer dragger than panels', async () => {
      const wrapper = mount(ThreePanelSplitter);
      await settle();
      expect(wrapper.findAll('.b-splitter__panel').length).toBe(3);
      expect(wrapper.findAll('.b-splitter__dragger').length).toBe(2);
    });

    it('renders panel default-slot content', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      expect(wrapper.text()).toContain('A');
      expect(wrapper.text()).toContain('B');
    });

    it('exposes data-orientation attribute', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { vertical: true } });
      await settle();
      expect(wrapper.find('.b-splitter').attributes('data-orientation')).toBe('vertical');
    });
  });

  describe('panel sizing', () => {
    it('respects defaultSize on each panel', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel default-size="300">A</BSplitterPanel>
            <BSplitterPanel default-size="500">B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const panels = wrapper.findAll('.b-splitter__panel');
      // 1000-6=994 avail; 300+500=800; ratio 994/800 ≈ 1.2425 → ~372.75 / 621.25
      expect(panels[0].attributes('style')).toMatch(/372/);
      expect(panels[1].attributes('style')).toMatch(/621/);
    });

    it('distributes remaining size evenly when no defaults given', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      const panels = wrapper.findAll('.b-splitter__panel');
      // (1000 - 6) / 2 = 497
      expect(panels[0].attributes('style')).toContain('497');
      expect(panels[1].attributes('style')).toContain('497');
    });

    it('honors percentage sizes', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel default-size="25%">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const panels = wrapper.findAll('.b-splitter__panel');
      // 25% of 994 = 248.5
      expect(panels[0].attributes('style')).toMatch(/248/);
    });

    it('honors min size during keyboard resize', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel min="400" default-size="500">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const d = getDragger(wrapper);
      // Try to shrink panel A below min repeatedly
      for (let i = 0; i < 30; i++) {
        await d.trigger('keydown', { key: 'ArrowLeft' });
      }
      await nextTick();
      const panels = wrapper.findAll('.b-splitter__panel');
      const styleA = panels[0].attributes('style') ?? '';
      const widthMatch = styleA.match(/width:\s*([\d.]+)px/);
      expect(widthMatch).not.toBeNull();
      expect(parseFloat(widthMatch![1])).toBeGreaterThanOrEqual(399);
    });
  });

  describe('accessibility', () => {
    it('dragger has role=separator and proper aria attributes', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      const d = getDragger(wrapper);
      expect(d.attributes('role')).toBe('separator');
      // Horizontal layout → vertical separator handle
      expect(d.attributes('aria-orientation')).toBe('vertical');
      expect(d.attributes('aria-valuemin')).toBe('0');
      expect(d.attributes('aria-valuemax')).toBe('100');
      expect(d.attributes('aria-valuenow')).toBe('50');
      expect(d.attributes('tabindex')).toBe('0');
      expect(d.attributes('aria-controls')).toMatch(/panel-0 .*panel-1$/);
    });

    it('aria-orientation flips for vertical layout', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { vertical: true } });
      await settle();
      expect(getDragger(wrapper).attributes('aria-orientation')).toBe('horizontal');
    });

    it('non-resizable panel disables the dragger', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :resizable="false">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const d = getDragger(wrapper);
      expect(d.attributes('aria-disabled')).toBe('true');
      expect(d.attributes('tabindex')).toBe('-1');
      expect(d.classes()).toContain('b-splitter__dragger--disabled');
    });

    it('panel has role=group and stable id', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      wrapper.findAll('.b-splitter__panel').forEach((p) => {
        expect(p.attributes('role')).toBe('group');
        expect(p.attributes('id')).toMatch(/^b-splitter-\d+-panel-\d+$/);
      });
    });
  });

  describe('events', () => {
    it('emits resizeStart, resize, resizeEnd in order on drag', async () => {
      const wrapper = mount(TwoPanelSplitter, { attachTo: document.body });
      await settle();
      const d = getDragger(wrapper);

      await d.trigger('mousedown', { clientX: 500, clientY: 0 });
      // mousemove and mouseup are listened on `document`
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 600, clientY: 0, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 600, clientY: 0, bubbles: true }));
      await nextTick();

      // The wrapper is the test root; emit comes from the BSplitter root component.
      const splitter = wrapper.findComponent(BSplitter);
      expect(splitter.emitted('resizeStart')).toBeTruthy();
      expect(splitter.emitted('resize')).toBeTruthy();
      expect(splitter.emitted('resizeEnd')).toBeTruthy();

      wrapper.unmount();
    });

    it('emits draggerDoubleClick with index', async () => {
      const wrapper = mount(ThreePanelSplitter);
      await settle();
      await getDragger(wrapper, 1).trigger('dblclick');
      const splitter = wrapper.findComponent(BSplitter);
      const evs = splitter.emitted('draggerDoubleClick');
      expect(evs).toBeTruthy();
      expect(evs![0]).toEqual([1]);
    });
  });

  describe('keyboard', () => {
    it('ArrowRight increases first panel size in horizontal layout', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      await getDragger(wrapper).trigger('keydown', { key: 'ArrowRight' });
      const panels = wrapper.findAll('.b-splitter__panel');
      // started 497/497; +10 → 507/487
      expect(panels[0].attributes('style')).toContain('507');
      expect(panels[1].attributes('style')).toContain('487');
    });

    it('ArrowLeft decreases first panel size', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      await getDragger(wrapper).trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.findAll('.b-splitter__panel')[0].attributes('style')).toContain('487');
    });

    it('ArrowRight does not move in vertical layout', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { vertical: true } });
      await settle();
      await getDragger(wrapper).trigger('keydown', { key: 'ArrowRight' });
      // Container 600 - 6 = 594; 594/2 = 297 each → unchanged
      expect(wrapper.findAll('.b-splitter__panel')[0].attributes('style')).toContain('297');
    });

    it('keyboard ignored on disabled dragger', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :resizable="false">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      await getDragger(wrapper).trigger('keydown', { key: 'ArrowRight' });
      const splitter = wrapper.findComponent(BSplitter);
      expect(splitter.emitted('resize')).toBeUndefined();
    });

    it('Home key shrinks panel before dragger toward minimum', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      await getDragger(wrapper).trigger('keydown', { key: 'Home' });
      // panel 0 should shrink to 0 (no min defined)
      expect(wrapper.findAll('.b-splitter__panel')[0].attributes('style')).toContain('0px');
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('uses defaultSize for uncontrolled panels', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel default-size="200">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const panels = wrapper.findAll('.b-splitter__panel');
      expect(panels[0].attributes('style')).toContain('200');
      expect(panels[1].attributes('style')).toContain('794');
    });

    it('reflects controlled size prop into DOM', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel size="300">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const panels = wrapper.findAll('.b-splitter__panel');
      expect(panels[0].attributes('style')).toContain('300');
      expect(panels[1].attributes('style')).toContain('694');
    });
  });

  describe('lazy mode', () => {
    it('does not commit sizes during drag in lazy mode', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { lazy: true }, attachTo: document.body });
      await settle();
      const d = getDragger(wrapper);

      await d.trigger('mousedown', { clientX: 500 });
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 600, bubbles: true }));
      await nextTick();

      const splitter = wrapper.findComponent(BSplitter);
      // Lazy: no `resize` emit during move.
      expect(splitter.emitted('resize')).toBeUndefined();

      // Lazy preview indicator visible.
      expect(wrapper.find('.b-splitter__lazy-indicator').exists()).toBe(true);

      // On release the size commits.
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 600, bubbles: true }));
      await nextTick();
      expect(splitter.emitted('resize')).toBeTruthy();
      expect(splitter.emitted('resizeEnd')).toBeTruthy();

      wrapper.unmount();
    });

    it('removes lazy indicator after release', async () => {
      const wrapper = mount(TwoPanelSplitter, { attrs: { lazy: true }, attachTo: document.body });
      await settle();
      const d = getDragger(wrapper);
      await d.trigger('mousedown', { clientX: 500 });
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 600, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 600, bubbles: true }));
      await nextTick();
      expect(wrapper.find('.b-splitter__lazy-indicator').exists()).toBe(false);
      wrapper.unmount();
    });
  });

  describe('collapsible', () => {
    it('renders start collapse button when collapsible.start', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :collapsible="{ start: true }">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      expect(wrapper.find('.b-splitter__collapse-btn--start').exists()).toBe(true);
      expect(wrapper.find('.b-splitter__collapse-btn--end').exists()).toBe(false);
    });

    it('clicking collapse button emits collapse and zeroes panel size', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :collapsible="{ start: true }">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      await wrapper.find('.b-splitter__collapse-btn--start').trigger('click');
      await nextTick();

      const panels = wrapper.findAll('.b-splitter__panel');
      expect(panels[0].classes()).toContain('b-splitter__panel--collapsed');
      expect(panels[0].attributes('style')).toContain('0px');

      const splitter = wrapper.findComponent(BSplitter);
      const collapseEv = splitter.emitted('collapse');
      expect(collapseEv).toBeTruthy();
      expect(collapseEv![0][0]).toEqual([true, false]);
    });

    it('destroyOnHidden removes content when collapsed', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :collapsible="{ start: true }" :destroy-on-hidden="true">
              <span class="needle">Hello</span>
            </BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      expect(wrapper.find('.needle').exists()).toBe(true);
      await wrapper.find('.b-splitter__collapse-btn--start').trigger('click');
      await nextTick();
      expect(wrapper.find('.needle').exists()).toBe(false);
    });

    it('collapsing a panel toward start transfers its size to the next panel', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel :collapsible="{ start: true }" default-size="40%">A</BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const splitter = wrapper.findComponent(BSplitter);
      await wrapper.find('.b-splitter__collapse-btn--start').trigger('click');
      await nextTick();

      const collapseEv = splitter.emitted('collapse');
      expect(collapseEv).toBeTruthy();
      const [collapsedFlags, sizes] = collapseEv![0] as [boolean[], number[]];
      expect(collapsedFlags).toEqual([true, false]);
      // Panel A becomes 0; Panel B absorbs the space (no size lost).
      expect(sizes[0]).toBe(0);
      expect(sizes[1]).toBeGreaterThan(0);
      // Total size is preserved (within rounding).
      const total = sizes.reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThan(0);
    });

    it('collapsing a panel toward end transfers its size to the previous panel', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel>A</BSplitterPanel>
            <BSplitterPanel :collapsible="{ end: true }" default-size="40%">B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      const splitter = wrapper.findComponent(BSplitter);
      await wrapper.find('.b-splitter__collapse-btn--end').trigger('click');
      await nextTick();

      const collapseEv = splitter.emitted('collapse');
      expect(collapseEv).toBeTruthy();
      const [collapsedFlags, sizes] = collapseEv![0] as [boolean[], number[]];
      expect(collapsedFlags).toEqual([false, true]);
      // Panel B becomes 0; Panel A absorbs the space.
      expect(sizes[1]).toBe(0);
      expect(sizes[0]).toBeGreaterThan(0);
    });

    it('toggling the start button restores the panel from the next neighbor', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel collapsible default-size="40%">A</BSplitterPanel>
            <BSplitterPanel collapsible>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      // Collapse via the `<` button.
      await wrapper
        .find('.b-splitter__collapse-btn--start')
        .trigger('click');
      await nextTick();
      // After collapse the `<` is gone; the `>` button now restores.
      await wrapper.find('.b-splitter__collapse-btn--end').trigger('click');
      await nextTick();

      const splitter = wrapper.findComponent(BSplitter);
      const events = splitter.emitted('collapse')!;
      const [restoredFlags, restoredSizes] = events[events.length - 1] as [
        boolean[],
        number[],
      ];
      expect(restoredFlags).toEqual([false, false]);
      expect(restoredSizes[0]).toBeGreaterThan(0);
      expect(restoredSizes[1]).toBeGreaterThan(0);
    });

    it('after clicking the start button the end button takes over for restore', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel collapsible default-size="33%">A</BSplitterPanel>
            <BSplitterPanel collapsible>B</BSplitterPanel>
            <BSplitterPanel collapsible default-size="33%">C</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();

      const firstDivider = wrapper.findAll('.b-splitter__divider')[0];
      // Initial state: both buttons present, chevrons static, aria-expanded=true.
      const startBtn = firstDivider.find('.b-splitter__collapse-btn--start');
      const endBtn = firstDivider.find('.b-splitter__collapse-btn--end');
      expect(startBtn.exists()).toBe(true);
      expect(endBtn.exists()).toBe(true);
      expect(startBtn.attributes('aria-expanded')).toBe('true');
      expect(endBtn.attributes('aria-expanded')).toBe('true');
      expect(
        startBtn.find('.b-splitter__chevron--start').exists(),
      ).toBe(true);
      expect(
        endBtn.find('.b-splitter__chevron--end').exists(),
      ).toBe(true);

      // Click start arrow → panel A collapses; only the end button should remain
      // (now serving as the restore button for A).
      await startBtn.trigger('click');
      await nextTick();

      expect(
        firstDivider.find('.b-splitter__collapse-btn--start').exists(),
      ).toBe(false);
      const restoreBtn = firstDivider.find('.b-splitter__collapse-btn--end');
      expect(restoreBtn.exists()).toBe(true);
      expect(restoreBtn.attributes('aria-expanded')).toBe('false');
      // Chevron stays as `>` (no flipping).
      expect(
        restoreBtn.find('.b-splitter__chevron--end').exists(),
      ).toBe(true);

      // Clicking the restore button brings panel A back.
      await restoreBtn.trigger('click');
      await nextTick();
      const splitter = wrapper.findComponent(BSplitter);
      const events = splitter.emitted('collapse')!;
      const [flags, sizes] = events[events.length - 1] as [
        boolean[],
        number[],
      ];
      expect(flags).toEqual([false, false, false]);
      expect(sizes[0]).toBeGreaterThan(0);
    });

    it('after clicking the end button the start button takes over for restore', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel collapsible default-size="33%">A</BSplitterPanel>
            <BSplitterPanel collapsible>B</BSplitterPanel>
            <BSplitterPanel collapsible default-size="33%">C</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();

      const firstDivider = wrapper.findAll('.b-splitter__divider')[0];
      // Click `>` arrow → panel B collapses; only the `<` button should remain.
      await firstDivider
        .find('.b-splitter__collapse-btn--end')
        .trigger('click');
      await nextTick();

      expect(
        firstDivider.find('.b-splitter__collapse-btn--end').exists(),
      ).toBe(false);
      const restoreBtn = firstDivider.find('.b-splitter__collapse-btn--start');
      expect(restoreBtn.exists()).toBe(true);
      expect(restoreBtn.attributes('aria-expanded')).toBe('false');
      expect(
        restoreBtn.find('.b-splitter__chevron--start').exists(),
      ).toBe(true);

      await restoreBtn.trigger('click');
      await nextTick();
      const splitter = wrapper.findComponent(BSplitter);
      const events = splitter.emitted('collapse')!;
      const [flags] = events[events.length - 1] as [boolean[], number[]];
      expect(flags).toEqual([false, false, false]);
    });
  });

  describe('edge cases', () => {
    it('handles a single panel (no draggers)', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `<BSplitter><BSplitterPanel>Only</BSplitterPanel></BSplitter>`,
      });
      const wrapper = mount(Comp);
      await settle();
      expect(wrapper.findAll('.b-splitter__panel').length).toBe(1);
      expect(wrapper.findAll('.b-splitter__dragger').length).toBe(0);
    });

    it('handles long content without overflow leaks', async () => {
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <BSplitter>
            <BSplitterPanel><div style="width:5000px">long</div></BSplitterPanel>
            <BSplitterPanel>B</BSplitterPanel>
          </BSplitter>
        `,
      });
      const wrapper = mount(Comp);
      await settle();
      expect(wrapper.findAll('.b-splitter__panel')[0].attributes('style')).toMatch(/width:\s*\d+px/);
    });

    it('exposes getSizes/setSizes via component instance', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      const splitter = wrapper.findComponent(BSplitter);
      const exposed = splitter.vm as unknown as {
        getSizes: () => number[];
        setSizes: (s: number[]) => void;
      };
      expect(exposed.getSizes().length).toBe(2);
      exposed.setSizes([200, 794]);
      await nextTick();
      expect(exposed.getSizes()[0]).toBeCloseTo(200, 0);
    });

    it('cleans up document drag listeners on unmount', async () => {
      const wrapper = mount(TwoPanelSplitter);
      await settle();
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      wrapper.unmount();
      expect(removeSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
    });
  });

  describe('animation determinism', () => {
    it('drag updates size synchronously (no rAF queue)', async () => {
      vi.useFakeTimers();
      try {
        const wrapper = mount(TwoPanelSplitter, { attachTo: document.body });
        await nextTick();
        await nextTick();
        const d = getDragger(wrapper);
        await d.trigger('mousedown', { clientX: 500 });
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 550, bubbles: true }));
        await nextTick();
        const panels = wrapper.findAll('.b-splitter__panel');
        // 497 + 50 = 547
        expect(panels[0].attributes('style')).toContain('547');
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 550, bubbles: true }));
        vi.runAllTimers();
        wrapper.unmount();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('teleport / portal scenario', () => {
    it('renders inside a teleport target', async () => {
      const target = document.createElement('div');
      target.id = 'teleport-target';
      document.body.appendChild(target);
      const Comp = defineComponent({
        components: { BSplitter, BSplitterPanel },
        template: `
          <Teleport to="#teleport-target">
            <BSplitter>
              <BSplitterPanel>A</BSplitterPanel>
              <BSplitterPanel>B</BSplitterPanel>
            </BSplitter>
          </Teleport>
        `,
      });
      const wrapper = mount(Comp, { attachTo: document.body });
      await settle();
      expect(target.querySelector('.b-splitter')).not.toBeNull();
      target.remove();
      wrapper.unmount();
    });
  });
});
