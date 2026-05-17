import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { z } from 'zod';
import BForm from './BForm.vue';
import BFormItem from './BFormItem.vue';

describe('BForm', () => {
  describe('rendering defaults', () => {
    it('renders a form element with default classes', () => {
      const wrapper = mount(BForm);
      const form = wrapper.find('form');
      expect(form.exists()).toBe(true);
      expect(form.classes()).toContain('b-form');
      expect(form.classes()).toContain('b-form--horizontal');
      expect(form.classes()).toContain('b-form--label-left');
    });

    it('renders with role="form"', () => {
      const wrapper = mount(BForm);
      expect(wrapper.find('form').attributes('role')).toBe('form');
    });

    it('renders slot content', () => {
      const wrapper = mount(BForm, {
        slots: { default: '<div class="form-content">Hello</div>' },
      });
      expect(wrapper.find('.form-content').exists()).toBe(true);
    });
  });

  describe('props', () => {
    it('applies layout class', () => {
      const wrapper = mount(BForm, { props: { layout: 'vertical' } });
      expect(wrapper.find('form').classes()).toContain('b-form--vertical');
    });

    it('applies inline layout class', () => {
      const wrapper = mount(BForm, { props: { layout: 'inline' } });
      expect(wrapper.find('form').classes()).toContain('b-form--inline');
    });

    it('applies labelAlign class', () => {
      const wrapper = mount(BForm, { props: { labelAlign: 'left' } });
      expect(wrapper.find('form').classes()).toContain('b-form--label-left');
    });

    it('sets name attribute', () => {
      const wrapper = mount(BForm, { props: { name: 'loginForm' } });
      expect(wrapper.find('form').attributes('name')).toBe('loginForm');
    });

    it('sets aria-label from name', () => {
      const wrapper = mount(BForm, { props: { name: 'loginForm' } });
      expect(wrapper.find('form').attributes('aria-label')).toBe('loginForm');
    });

    it('applies disabled class', () => {
      const wrapper = mount(BForm, { props: { disabled: true } });
      expect(wrapper.find('form').classes()).toContain('b-form--disabled');
    });

    it('sets novalidate attribute', () => {
      const wrapper = mount(BForm, { props: { noHtml5Validate: true } });
      expect(wrapper.find('form').attributes('novalidate')).toBeDefined();
    });
  });

  describe('submit and validation', () => {
    it('emits finish on successful validation', async () => {
      const wrapper = mount(BForm, {
        slots: { default: '<button type="submit">Submit</button>' },
      });

      await wrapper.find('form').trigger('submit');
      expect(wrapper.emitted('finish')).toBeTruthy();
    });

    it('emits finishFailed on failed validation', async () => {
      const TestForm = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().min(1, 'Name is required');
          const formModel = ref({ username: '' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="username" :schema="schema" label="Name">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.username" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestForm);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      const formWrapper = wrapper.findComponent(BForm);
      expect(formWrapper.emitted('finishFailed')).toBeTruthy();
    });

    it('prevents default form submission', async () => {
      const wrapper = mount(BForm, {
        slots: { default: '<button type="submit">Submit</button>' },
      });
      const event = new Event('submit', { cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      wrapper.find('form').element.dispatchEvent(event);
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('exposed methods', () => {
    it('exposes validate method', () => {
      const wrapper = mount(BForm);
      expect(typeof wrapper.vm.validate).toBe('function');
    });

    it('exposes resetFields method', () => {
      const wrapper = mount(BForm);
      expect(typeof wrapper.vm.resetFields).toBe('function');
    });

    it('exposes scrollToField method', () => {
      const wrapper = mount(BForm);
      expect(typeof wrapper.vm.scrollToField).toBe('function');
    });
  });
});

describe('BFormItem', () => {
  const mountWithForm = (itemProps: Record<string, unknown> = {}, itemSlots: Record<string, string> = {}) => {
    const TestComp = defineComponent({
      components: { BForm, BFormItem },
      setup() {
        return { itemProps };
      },
      template: `
        <BForm>
          <BFormItem v-bind="itemProps">
            ${itemSlots.default ?? '<input />'}
          </BFormItem>
        </BForm>
      `,
    });
    return mount(TestComp);
  };

  describe('rendering defaults', () => {
    it('renders with b-form-item class', () => {
      const wrapper = mountWithForm();
      expect(wrapper.find('.b-form-item').exists()).toBe(true);
    });

    it('renders horizontal layout by default', () => {
      const wrapper = mountWithForm();
      expect(wrapper.find('.b-form-item--horizontal').exists()).toBe(true);
    });

    it('renders label when provided', () => {
      const wrapper = mountWithForm({ label: 'Username' });
      expect(wrapper.find('.b-form-item__label').exists()).toBe(true);
      expect(wrapper.text()).toContain('Username');
    });

    it('does not render label wrapper when no label', () => {
      const wrapper = mountWithForm();
      expect(wrapper.find('.b-form-item__label').exists()).toBe(false);
    });
  });

  describe('props mapping to DOM', () => {
    it('shows colon in horizontal layout when label exists', () => {
      const wrapper = mountWithForm({ label: 'Name', name: 'name' });
      expect(wrapper.find('.b-form-item__colon').exists()).toBe(true);
    });

    it('hides colon when colon=false', () => {
      const wrapper = mountWithForm({ label: 'Name', colon: false });
      expect(wrapper.find('.b-form-item__colon').exists()).toBe(false);
    });

    it('shows required mark when required prop is true', () => {
      const wrapper = mountWithForm({ label: 'Name', required: true });
      expect(wrapper.find('.b-form-item__required-mark').exists()).toBe(true);
    });

    it('shows required mark when schema rejects undefined', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ name: '' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="name" label="Name" :schema="schema">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item__required-mark').exists()).toBe(true);
    });

    it('hides form item when hidden=true', () => {
      const wrapper = mountWithForm({ label: 'Name', hidden: true });
      expect(wrapper.find('.b-form-item--hidden').exists()).toBe(true);
    });

    it('renders noStyle without wrapper', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm>
            <BFormItem no-style>
              <input class="bare-input" />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item').exists()).toBe(false);
      expect(wrapper.find('.bare-input').exists()).toBe(true);
    });

    it('renders extra text', () => {
      const wrapper = mountWithForm({ label: 'Name', extra: 'Some hint' });
      expect(wrapper.find('.b-form-item__extra').exists()).toBe(true);
      expect(wrapper.text()).toContain('Some hint');
    });

    it('renders help text', () => {
      const wrapper = mountWithForm({ label: 'Name', help: 'Help message' });
      expect(wrapper.find('.b-form-item__help').exists()).toBe(true);
      expect(wrapper.text()).toContain('Help message');
    });

    it('shows tooltip icon when tooltip is set', () => {
      const wrapper = mountWithForm({ label: 'Name', tooltip: 'Helpful info' });
      expect(wrapper.find('.b-form-item__tooltip').exists()).toBe(true);
    });

    it('applies vertical layout per-item', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm layout="horizontal">
            <BFormItem label="Name" layout="vertical">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item--vertical').exists()).toBe(true);
    });
  });

  describe('validation with Zod schemas', () => {
    it('shows error message on required field fail via form submit', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().min(1, 'Name is required');
          const formModel = ref({ name: '' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="name" label="Name" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.name" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.find('.b-form-item__help--error').exists()).toBe(true);
      expect(wrapper.text()).toContain('Name is required');
    });

    it('validates email format via Zod', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().email('Invalid email');
          const formModel = ref({ email: 'not-an-email' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="email" label="Email" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.email" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.find('.b-form-item__help--error').exists()).toBe(true);
      expect(wrapper.text()).toContain('Invalid email');
    });

    it('validates regex pattern via Zod', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().regex(/^[A-Z]+$/, 'Uppercase only');
          const formModel = ref({ code: 'abc' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="code" label="Code" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.code" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.text()).toContain('Uppercase only');
    });

    it('validates min length via Zod', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().min(5, 'Too short');
          const formModel = ref({ pw: 'ab' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="pw" label="Password" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.pw" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.text()).toContain('Too short');
    });

    it('validates max length via Zod', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().max(3, 'Too long');
          const formModel = ref({ tag: 'abcdef' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="tag" label="Tag" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.tag" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.text()).toContain('Too long');
    });

    it('supports custom refinement validator', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().refine((val) => val === 'valid', { message: 'Must be "valid"' });
          const formModel = ref({ custom: 'nope' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="custom" label="Custom" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.custom" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.text()).toContain('Must be "valid"');
    });

    it('resets field validation state via form', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const formRef = ref<InstanceType<typeof BForm> | null>(null);
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ field: '' });
          return { formRef, schema, formModel };
        },
        template: `
          <BForm ref="formRef" :model="formModel">
            <BFormItem name="field" label="Field" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.field" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();
      expect(wrapper.find('.b-form-item__help--error').exists()).toBe(true);

      wrapper.vm.formRef!.resetFields();
      await nextTick();
      expect(wrapper.find('.b-form-item__help--error').exists()).toBe(false);
    });

    it('passes validation when value is valid', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ name: 'Alice' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="name" label="Name" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.name" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      const formWrapper = wrapper.findComponent(BForm);
      expect(formWrapper.emitted('finish')).toBeTruthy();
      expect(wrapper.find('.b-form-item__help--error').exists()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('has role="group" on form item', () => {
      const wrapper = mountWithForm({ label: 'Name', name: 'name' });
      expect(wrapper.find('.b-form-item').attributes('role')).toBe('group');
    });

    it('has aria-labelledby pointing to label', () => {
      const wrapper = mountWithForm({ label: 'Name', name: 'name' });
      const item = wrapper.find('.b-form-item');
      const labelId = wrapper.find('.b-form-item__label label').attributes('id');
      expect(item.attributes('aria-labelledby')).toBe(labelId);
    });

    it('help message has role="alert" and aria-live', () => {
      const wrapper = mountWithForm({ label: 'Name', help: 'Help text' });
      const help = wrapper.find('.b-form-item__help');
      expect(help.attributes('role')).toBe('alert');
      expect(help.attributes('aria-live')).toBe('polite');
    });

    it('required mark has aria-hidden', () => {
      const wrapper = mountWithForm({ label: 'Name', required: true });
      expect(wrapper.find('.b-form-item__required-mark').attributes('aria-hidden')).toBe('true');
    });

    it('colon has aria-hidden', () => {
      const wrapper = mountWithForm({ label: 'Name', name: 'name' });
      const colonEl = wrapper.find('.b-form-item__colon');
      expect(colonEl.exists()).toBe(true);
      expect(colonEl.attributes('aria-hidden')).toBe('true');
    });
  });

  describe('validate status', () => {
    it('applies has-error class on error', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm>
            <BFormItem name="x" label="X" validate-status="error">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item--has-error').exists()).toBe(true);
    });

    it('applies has-warning class on warning', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm>
            <BFormItem name="x" label="X" validate-status="warning">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item--has-warning').exists()).toBe(true);
    });

    it('applies has-success class on success', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm>
            <BFormItem name="x" label="X" validate-status="success">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item--has-success').exists()).toBe(true);
    });

    it('shows feedback icon when hasFeedback is true', () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        template: `
          <BForm>
            <BFormItem name="x" label="X" validate-status="success" :has-feedback="true">
              <input />
            </BFormItem>
          </BForm>
        `,
      });
      const wrapper = mount(TestComp);
      expect(wrapper.find('.b-form-item__feedback-icon').exists()).toBe(true);
    });
  });

  describe('form-level validation', () => {
    it('validates all registered fields via form ref', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const formRef = ref<InstanceType<typeof BForm> | null>(null);
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ a: '', b: '' });
          return { formRef, schema, formModel };
        },
        template: `
          <BForm ref="formRef" :model="formModel">
            <BFormItem name="a" label="A" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.a" />
              </template>
            </BFormItem>
            <BFormItem name="b" label="B" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.b" />
              </template>
            </BFormItem>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      const formRef = wrapper.vm.formRef!;
      const result = formRef.validate();
      expect(result).toBe(false);
      await nextTick();
      expect(wrapper.findAll('.b-form-item--has-error')).toHaveLength(2);
    });

    it('resetFields resets all field errors', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const formRef = ref<InstanceType<typeof BForm> | null>(null);
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ a: '' });
          return { formRef, schema, formModel };
        },
        template: `
          <BForm ref="formRef" :model="formModel">
            <BFormItem name="a" label="A" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.a" />
              </template>
            </BFormItem>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      const formRef = wrapper.vm.formRef!;
      formRef.validate();
      await nextTick();
      expect(wrapper.find('.b-form-item--has-error').exists()).toBe(true);

      formRef.resetFields();
      await nextTick();
      expect(wrapper.find('.b-form-item--has-error').exists()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('unregisters field on unmount', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const showField = ref(true);
          const formRef = ref<InstanceType<typeof BForm> | null>(null);
          const schema = z.string().min(1, 'Required');
          const formModel = ref({ temp: '' });
          return { showField, formRef, schema, formModel };
        },
        template: `
          <BForm ref="formRef" :model="formModel">
            <BFormItem v-if="showField" name="temp" label="Temp" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.temp" />
              </template>
            </BFormItem>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      const formRef = wrapper.vm.formRef!;

      let result = formRef.validate();
      expect(result).toBe(false);

      wrapper.vm.showField = false;
      await nextTick();

      result = formRef.validate();
      expect(result).toBe(true);
    });

    it('validates number schema', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.number({ coerce: true }).min(10, 'Must be at least 10');
          const formModel = ref({ age: 5 });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="age" label="Age" :schema="schema">
              <template #default="{ id }">
                <input :id="id" type="number" />
              </template>
            </BFormItem>
            <button type="submit">Submit</button>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      await wrapper.find('form').trigger('submit');
      await nextTick();

      expect(wrapper.text()).toContain('Must be at least 10');
    });

    it('tracks dirty state after value change', async () => {
      const TestComp = defineComponent({
        components: { BForm, BFormItem },
        setup() {
          const schema = z.string();
          const formModel = ref({ name: 'initial' });
          return { schema, formModel };
        },
        template: `
          <BForm :model="formModel">
            <BFormItem name="name" label="Name" :schema="schema">
              <template #default="{ id }">
                <input :id="id" v-model="formModel.name" />
              </template>
            </BFormItem>
          </BForm>
        `,
      });

      const wrapper = mount(TestComp);
      const formItem = wrapper.findComponent(BFormItem);
      const exposed = formItem.vm.$.exposed!;

      expect(exposed.dirty.value).toBe(false);

      wrapper.vm.formModel.name = 'changed';
      await nextTick();
      await nextTick();

      expect(exposed.dirty.value).toBe(true);
    });
  });
});
