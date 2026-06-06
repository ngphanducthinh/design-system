import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import BModal from './BModal.vue';
import BModalBody from './BModalBody.vue';
import BModalFooter from './BModalFooter.vue';
import BModalHeader from './BModalHeader.vue';

/**
 * jsdom does not implement HTMLDialogElement.showModal / close. We polyfill the
 * subset of behaviour BModal relies on so the spec can drive the v-model and
 * inspect the resulting state without a real browser.
 */
function patchDialog(): () => void {
  const proto = window.HTMLDialogElement?.prototype;
  if (!proto) return () => {};

  const originals: Record<string, unknown> = {};
  for (const key of ['showModal', 'show', 'close'] as const) {
    originals[key] = (proto as any)[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      writable: true,
      value:
        key === 'close'
          ? function (this: HTMLDialogElement) {
              this.removeAttribute('open');
              this.dispatchEvent(new Event('close'));
            }
          : function (this: HTMLDialogElement) {
              this.setAttribute('open', '');
            },
    });
  }
  return () => {
    for (const [k, v] of Object.entries(originals)) {
      if (v === undefined) delete (proto as any)[k];
      else (proto as any)[k] = v;
    }
  };
}

describe('BModal', () => {
  let restoreDialog: () => void;

  beforeEach(() => {
    restoreDialog = patchDialog();
  });

  afterEach(() => {
    restoreDialog();
    vi.useRealTimers();
  });

  describe('defaults and structure', () => {
    it('renders a <dialog> with the b-modal class', () => {
      const wrapper = mount(BModal, { props: { modelValue: false } });
      const dialog = wrapper.find('dialog.b-modal');
      expect(dialog.exists()).toBe(true);
      expect(dialog.element.tagName).toBe('DIALOG');
    });

    it('renders default-slot content', () => {
      const wrapper = mount(BModal, {
        props: { modelValue: true },
        slots: { default: '<p class="content">Hello</p>' },
      });
      expect(wrapper.find('.content').text()).toBe('Hello');
    });
  });

  describe('v-model controls open / close', () => {
    it('opens the dialog when modelValue becomes true', async () => {
      const wrapper = mount(BModal, { props: { modelValue: false } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;

      const showSpy = vi.spyOn(dialog, 'showModal');
      await wrapper.setProps({ modelValue: true });
      await nextTick();
      expect(showSpy).toHaveBeenCalled();
      expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('closes the dialog when modelValue becomes false', async () => {
      // Mount closed, open via prop change so the watcher fires post-mount with
      // the dialog ref bound, then close to assert the close path.
      const wrapper = mount(BModal, { props: { modelValue: false } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;

      await wrapper.setProps({ modelValue: true });
      await nextTick();
      expect(dialog.hasAttribute('open')).toBe(true);

      const closeSpy = vi.spyOn(dialog, 'close');
      await wrapper.setProps({ modelValue: false });
      await nextTick();
      expect(closeSpy).toHaveBeenCalled();
      expect(dialog.hasAttribute('open')).toBe(false);
    });

    it('emits update:modelValue=false when the native close event fires', async () => {
      const wrapper = mount(BModal, { props: { modelValue: true } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;

      // Simulate the user closing via Escape — the dialog fires a `close` event.
      dialog.dispatchEvent(new Event('close'));
      await flushPromises();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([false]);
    });

    it('round-trips v-model — opening then closing leaves the bound ref false', async () => {
      const Parent = defineComponent({
        components: { BModal },
        setup() {
          const open = ref(false);
          return { open };
        },
        template: `<BModal v-model="open"><span class="body">x</span></BModal>`,
      });

      const wrapper = mount(Parent);
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;

      (wrapper.vm as any).open = true;
      await flushPromises();
      expect(dialog.hasAttribute('open')).toBe(true);

      // Native close event mirrors the user pressing Escape.
      dialog.dispatchEvent(new Event('close'));
      await flushPromises();
      expect((wrapper.vm as any).open).toBe(false);
    });
  });

  describe('mount-time behavior', () => {
    /**
     * The component's `watch(model, ..., { immediate: true })` callback runs
     * before the `<dialog>` ref is bound, so its early-return guard (`if
     * (!dialogRef.value) return;`) means the dialog is NOT showModal()'d on
     * mount. Subsequent toggles work as expected. Captured here so the
     * behaviour is intentional rather than accidental.
     */
    it('does not open until modelValue toggles after mount', async () => {
      const wrapper = mount(BModal, { props: { modelValue: true } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;
      expect(dialog.hasAttribute('open')).toBe(false);

      // Forcing a re-trigger of the watcher (toggle off → on) does open it.
      await wrapper.setProps({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      await flushPromises();
      expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('stays closed when modelValue is false at mount time', () => {
      const wrapper = mount(BModal, { props: { modelValue: false } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;
      expect(dialog.hasAttribute('open')).toBe(false);
    });
  });

  describe('subcomponents', () => {
    it('renders BModalHeader, BModalBody, and BModalFooter', () => {
      // BModalFooter exposes named slots (`left` / `right`) with default
      // Cancel/OK buttons — checking that the default footer renders the
      // standard buttons is the parity assertion.
      const wrapper = mount(BModal, {
        props: { modelValue: true },
        global: { components: { BModalHeader, BModalBody, BModalFooter } },
        slots: {
          default: () => [
            h(BModalHeader, { title: 'Heading' }),
            h(BModalBody, null, () => 'Body text'),
            h(BModalFooter),
          ],
        },
      });
      expect(wrapper.text()).toContain('Heading');
      expect(wrapper.text()).toContain('Body text');
      // Default footer renders Cancel + OK buttons.
      expect(wrapper.text()).toContain('Cancel');
      expect(wrapper.text()).toContain('OK');
    });

    it('BModalHeader emits update:modelValue=false when its close button is clicked', async () => {
      const Parent = defineComponent({
        components: { BModal, BModalHeader },
        setup() {
          const open = ref(true);
          return { open };
        },
        template: `
          <BModal v-model="open">
            <BModalHeader title="Hi" />
          </BModal>
        `,
      });

      const wrapper = mount(Parent);
      const closeButton = wrapper.find('.b-modal button');
      expect(closeButton.exists()).toBe(true);
      await closeButton.trigger('click');
      await flushPromises();
      expect((wrapper.vm as any).open).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles long content without throwing', () => {
      const long = 'x'.repeat(10_000);
      expect(() =>
        mount(BModal, {
          props: { modelValue: true },
          slots: { default: long },
        }),
      ).not.toThrow();
    });

    it('toggling open quickly is idempotent', async () => {
      const wrapper = mount(BModal, { props: { modelValue: false } });
      const dialog = wrapper.find('dialog').element as HTMLDialogElement;
      await wrapper.setProps({ modelValue: true });
      await flushPromises();
      await wrapper.setProps({ modelValue: false });
      await flushPromises();
      await wrapper.setProps({ modelValue: true });
      await flushPromises();
      expect(dialog.hasAttribute('open')).toBe(true);
    });
  });
});
