import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { z } from 'zod';
import { useValidationField, useValidationForm } from './useValidation';

function mountWithForm(setup: () => Record<string, unknown>) {
  const Parent = defineComponent({
    setup() {
      const form = useValidationForm();
      return { form };
    },
    template: '<slot />',
  });

  const Child = defineComponent({ setup, template: '<div />' });

  const wrapper = mount(Parent, {
    slots: { default: () => ({ render: () => null, ...Child }) },
    global: {
      components: { Child },
    },
  });

  return wrapper;
}

describe('useValidationField', () => {
  function mountField<T>(fieldValue: ReturnType<typeof ref<T>>, schema: z.ZodType<T>) {
    let result: ReturnType<typeof useValidationField<T>>;

    const Child = defineComponent({
      setup() {
        result = useValidationField('testField', fieldValue, schema);
        return {};
      },
      template: '<div />',
    });

    const Parent = defineComponent({
      components: { Child },
      setup() {
        useValidationForm();
        return {};
      },
      template: '<Child />',
    });

    const wrapper = mount(Parent);
    return { wrapper, field: result! };
  }

  describe('validation', () => {
    it('returns true for valid input', () => {
      const value = ref('hello');
      const schema = z.string().min(1);
      const { field } = mountField(value, schema);

      const valid = field.validate();

      expect(valid).toBe(true);
      expect(field.isValid.value).toBe(true);
      expect(field.errors.value).toEqual([]);
    });

    it('returns false and populates errors for invalid input', () => {
      const value = ref('');
      const schema = z.string().min(3, 'Too short');
      const { field } = mountField(value, schema);

      const valid = field.validate();

      expect(valid).toBe(false);
      expect(field.isValid.value).toBe(false);
      expect(field.errors.value).toContain('Too short');
    });

    it('returns all error messages from multiple issues', () => {
      const value = ref('');
      const schema = z.string().min(3, 'Too short').email('Invalid email');
      const { field } = mountField(value, schema);

      field.validate();

      expect(field.errors.value.length).toBeGreaterThanOrEqual(1);
      expect(field.errors.value).toContain('Too short');
    });

    it('clears errors on subsequent valid validation', () => {
      const value = ref('');
      const schema = z.string().min(1, 'Required');
      const { field } = mountField(value, schema);

      field.validate();
      expect(field.isValid.value).toBe(false);

      value.value = 'filled';
      field.validate();

      expect(field.isValid.value).toBe(true);
      expect(field.errors.value).toEqual([]);
    });
  });

  describe('dirty state', () => {
    it('starts as not dirty', () => {
      const value = ref('initial');
      const schema = z.string();
      const { field } = mountField(value, schema);

      expect(field.dirty.value).toBe(false);
    });

    it('becomes dirty when value changes', async () => {
      const value = ref('initial');
      const schema = z.string();
      const { field } = mountField(value, schema);

      value.value = 'changed';
      await nextTick();

      expect(field.dirty.value).toBe(true);
    });
  });

  describe('touched state', () => {
    it('starts as not touched', () => {
      const value = ref('');
      const schema = z.string();
      const { field } = mountField(value, schema);

      expect(field.touched.value).toBe(false);
    });

    it('becomes touched after markTouched()', () => {
      const value = ref('');
      const schema = z.string();
      const { field } = mountField(value, schema);

      field.markTouched();

      expect(field.touched.value).toBe(true);
    });
  });

  describe('reset', () => {
    it('clears errors, dirty, and touched', async () => {
      const value = ref('initial');
      const schema = z.string().email('Invalid email');
      const { field } = mountField(value, schema);

      value.value = 'not-an-email';
      await nextTick();
      field.markTouched();
      field.validate();

      expect(field.dirty.value).toBe(true);
      expect(field.touched.value).toBe(true);
      expect(field.isValid.value).toBe(false);

      field.reset();

      expect(field.dirty.value).toBe(false);
      expect(field.touched.value).toBe(false);
      expect(field.isValid.value).toBe(true);
      expect(field.errors.value).toEqual([]);
    });
  });
});

describe('useValidationForm', () => {
  function mountForm() {
    let form: ReturnType<typeof useValidationForm>;
    let field1: ReturnType<typeof useValidationField<string>>;
    let field2: ReturnType<typeof useValidationField<number>>;
    const value1 = ref('');
    const value2 = ref(0);

    const Child1 = defineComponent({
      setup() {
        field1 = useValidationField('email', value1, z.string().email('Invalid email'));
        return {};
      },
      template: '<div />',
    });

    const Child2 = defineComponent({
      setup() {
        field2 = useValidationField('age', value2, z.number().min(18, 'Must be 18+'));
        return {};
      },
      template: '<div />',
    });

    const Parent = defineComponent({
      components: { Child1, Child2 },
      setup() {
        form = useValidationForm();
        return {};
      },
      template: '<Child1 /><Child2 />',
    });

    const wrapper = mount(Parent);
    return { wrapper, form: form!, field1: field1!, field2: field2!, value1, value2 };
  }

  it('validateAll() validates all fields and returns false when any invalid', () => {
    const { form } = mountForm();

    const result = form.validateAll();

    expect(result).toBe(false);
  });

  it('validateAll() returns true when all fields are valid', () => {
    const { form, value1, value2 } = mountForm();

    value1.value = 'test@example.com';
    value2.value = 25;

    const result = form.validateAll();

    expect(result).toBe(true);
  });

  it('resetAll() resets all fields', async () => {
    const { form, field1, field2, value1 } = mountForm();

    value1.value = 'bad';
    await nextTick();
    field1.markTouched();
    form.validateAll();

    expect(field1.isValid.value).toBe(false);
    expect(field1.touched.value).toBe(true);

    form.resetAll();

    expect(field1.isValid.value).toBe(true);
    expect(field1.errors.value).toEqual([]);
    expect(field1.touched.value).toBe(false);
    expect(field2.isValid.value).toBe(true);
  });

  it('isValid computed reflects all fields validity', () => {
    const { form, value1, value2 } = mountForm();

    form.validateAll();
    expect(form.isValid.value).toBe(false);

    value1.value = 'test@example.com';
    value2.value = 25;
    form.validateAll();

    expect(form.isValid.value).toBe(true);
  });

  it('unregisters field on unmount', async () => {
    let field: ReturnType<typeof useValidationField<string>>;
    const value = ref('');
    const show = ref(true);

    const Child = defineComponent({
      setup() {
        field = useValidationField('dynamic', value, z.string().min(1, 'Required'));
        return {};
      },
      template: '<div />',
    });

    let form: ReturnType<typeof useValidationForm>;

    const Parent = defineComponent({
      components: { Child },
      setup() {
        form = useValidationForm();
        return { show };
      },
      template: '<Child v-if="show" />',
    });

    const wrapper = mount(Parent);

    expect(form!.fields['dynamic']).toBeDefined();

    show.value = false;
    await nextTick();

    expect(form!.fields['dynamic']).toBeUndefined();
  });
});
