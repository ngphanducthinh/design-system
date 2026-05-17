import { BCheckbox } from '@/components/BCheckbox';
import { BDatePicker } from '@/components/BDatePicker';
import { BForm, BFormItem } from '@/components/BForm';
import { BFormLayout, BFormLabelAlign, BFormRequiredMark } from '@/components/BForm/types.ts';
import { BInput } from '@/components/BInput';
import { BRadioGroup } from '@/components/BRadio';
import { BSelect } from '@/components/BSelect';
import { BSwitch } from '@/components/BSwitch';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import { z } from 'zod';

const meta = {
  title: 'Data Entry/Form',
  component: BForm,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: Object.values(BFormLayout),
      description: 'Form layout mode.',
      table: { defaultValue: { summary: BFormLayout.Horizontal } },
    },
    labelAlign: {
      control: 'select',
      options: Object.values(BFormLabelAlign),
      description: 'Label text alignment.',
      table: { defaultValue: { summary: BFormLabelAlign.Right } },
    },
    labelWidth: {
      control: 'text',
      description: 'Fixed width for all labels.',
    },
    colon: {
      control: 'boolean',
      description: 'Display colon after label (horizontal layout only).',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all form controls.',
      table: { defaultValue: { summary: 'false' } },
    },
    requiredMark: {
      control: 'select',
      options: [true, false, BFormRequiredMark.Optional],
      description: 'How required/optional marks are displayed.',
      table: { defaultValue: { summary: 'true' } },
    },
    model: {
      control: 'object',
      description: 'Form data model object.',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BForm</code> provides form layout, validation (via Zod schemas), and submission handling. ' +
          'Use with <code>BFormItem</code> for field-level labels, validation status, ' +
          'and error messaging. Supports horizontal, vertical, and inline layouts.',
      },
    },
  },
} satisfies Meta<typeof BForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    layout: 'horizontal',
    labelAlign: 'right',
    colon: true,
    disabled: false,
  },
  render: (args) => ({
    components: { BForm, BFormItem, BInput, BSelect, BRadioGroup, BSwitch, BDatePicker, BCheckbox },
    setup: () => {
      const formModel = ref({
        username: '',
        email: '',
        password: '',
        role: '',
        gender: '',
        birthDate: '',
        notifications: true,
        bio: '',
        agree: false,
      });
      const schemas = {
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Please enter a valid email'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.string().min(1, 'Please select a role'),
        gender: z.string().min(1, 'Please select a gender'),
        birthDate: z.string().min(1, 'Please select a date'),
        bio: z.string().max(200, 'Bio cannot exceed 200 characters'),
        agree: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
      };
      const roleOptions = [
        { label: 'Developer', value: 'developer' },
        { label: 'Designer', value: 'designer' },
        { label: 'Product Manager', value: 'pm' },
        { label: 'QA Engineer', value: 'qa' },
      ];
      const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ];
      const onFinish = (values: Record<string, unknown>) => {
        alert(`Form submitted:\n${JSON.stringify(values, null, 2)}`);
      };
      return { args, formModel, schemas, roleOptions, genderOptions, onFinish };
    },
    template: `
      <div style="padding: 40px; max-width: 560px;">
        <BForm v-bind="args" :model="formModel" label-width="120px" @finish="onFinish">
          <BFormItem name="username" label="Username" :schema="schemas.username" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.username" :id="id" placeholder="Enter username" />
            </template>
          </BFormItem>
          <BFormItem name="email" label="Email" :schema="schemas.email" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.email" :id="id" placeholder="Enter email" />
            </template>
          </BFormItem>
          <BFormItem name="password" label="Password" :schema="schemas.password" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.password" :id="id" type="password" placeholder="Enter password" />
            </template>
          </BFormItem>
          <BFormItem name="role" label="Role" :schema="schemas.role" :required="true">
            <template #default="{ id }">
              <BSelect v-model="formModel.role" :id="id" :options="roleOptions" placeholder="Select a role" />
            </template>
          </BFormItem>
          <BFormItem name="gender" label="Gender" :schema="schemas.gender" :required="true">
            <BRadioGroup v-model="formModel.gender" :options="genderOptions" />
          </BFormItem>
          <BFormItem name="birthDate" label="Birth Date" :schema="schemas.birthDate">
            <template #default="{ id }">
              <BDatePicker v-model="formModel.birthDate" :id="id" placeholder="Select date" />
            </template>
          </BFormItem>
          <BFormItem name="bio" label="Bio" :schema="schemas.bio">
            <template #default="{ id }">
              <BInput v-model="formModel.bio" :id="id" type="textarea" placeholder="Tell us about yourself" />
            </template>
          </BFormItem>
          <BFormItem name="notifications" label="Notifications">
            <BSwitch v-model="formModel.notifications" aria-label="Enable notifications" />
          </BFormItem>
          <BFormItem name="agree" label=" " :schema="schemas.agree" :colon="false">
            <BCheckbox v-model="formModel.agree">I agree to the terms and conditions</BCheckbox>
          </BFormItem>
          <BFormItem label=" " :colon="false">
            <div style="display: flex; gap: 8px;">
              <button type="submit" style="padding: 6px 16px; background: #0958d9; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Submit
              </button>
              <button type="reset" style="padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer;">
                Reset
              </button>
            </div>
          </BFormItem>
        </BForm>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Layouts
// ─────────────────────────────────────────────
export const Layouts: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const h = ref({ name: '', email: '' });
      const v = ref({ name: '', email: '' });
      const i = ref({ name: '', email: '' });
      return { h, v, i };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 40px; max-width: 600px;">
        <div>
          <h4 style="margin-bottom: 12px;">Horizontal (default)</h4>
          <BForm layout="horizontal" :model="h" label-width="80px">
            <BFormItem name="name" label="Name"><BInput v-model="h.name" placeholder="Name" /></BFormItem>
            <BFormItem name="email" label="Email"><BInput v-model="h.email" placeholder="Email" /></BFormItem>
          </BForm>
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Vertical</h4>
          <BForm layout="vertical" :model="v">
            <BFormItem name="name" label="Name"><BInput v-model="v.name" placeholder="Name" /></BFormItem>
            <BFormItem name="email" label="Email"><BInput v-model="v.email" placeholder="Email" /></BFormItem>
          </BForm>
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Inline</h4>
          <BForm layout="inline" :model="i">
            <BFormItem name="name" label="Name"><BInput v-model="i.name" placeholder="Name" /></BFormItem>
            <BFormItem name="email" label="Email"><BInput v-model="i.email" placeholder="Email" /></BFormItem>
            <BFormItem>
              <button type="submit" style="padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer;">Search</button>
            </BFormItem>
          </BForm>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Validation
// ─────────────────────────────────────────────
export const Validation: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const formModel = ref({ required: '', email: '', minLen: '', pattern: '' });
      const formRef = ref<InstanceType<typeof BForm> | null>(null);
      const schemas = {
        required: z.string().min(1, 'This field is required'),
        email: z.string().email('Not a valid email address'),
        minLen: z.string().min(5, 'Must be at least 5 characters'),
        pattern: z.string().regex(/^[A-Z]*$/, 'Only uppercase letters allowed'),
      };
      return { formModel, formRef, schemas };
    },
    template: `
      <div style="padding: 40px; max-width: 500px;">
        <BForm ref="formRef" :model="formModel" layout="vertical">
          <BFormItem name="required" label="Required Field" :schema="schemas.required" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.required" :id="id" placeholder="Cannot be empty" />
            </template>
          </BFormItem>
          <BFormItem name="email" label="Email" :schema="schemas.email">
            <template #default="{ id }">
              <BInput v-model="formModel.email" :id="id" placeholder="Enter email" />
            </template>
          </BFormItem>
          <BFormItem name="minLen" label="Min Length (5)" :schema="schemas.minLen">
            <template #default="{ id }">
              <BInput v-model="formModel.minLen" :id="id" placeholder="At least 5 chars" />
            </template>
          </BFormItem>
          <BFormItem name="pattern" label="Uppercase Only" :schema="schemas.pattern">
            <template #default="{ id }">
              <BInput v-model="formModel.pattern" :id="id" placeholder="A-Z only" />
            </template>
          </BFormItem>
          <BFormItem>
            <div style="display: flex; gap: 8px;">
              <button type="submit" style="padding: 6px 16px; background: #0958d9; color: white; border: none; border-radius: 6px; cursor: pointer;">Validate</button>
              <button type="button" @click="formRef?.resetFields()" style="padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer;">Reset</button>
            </div>
          </BFormItem>
        </BForm>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Required Mark Variants
// ─────────────────────────────────────────────
export const RequiredMarkVariants: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const m1 = ref({ name: '', email: '' });
      const m2 = ref({ name: '', email: '' });
      const nameSchema = z.string().min(1, 'Required');
      return { m1, m2, nameSchema };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; max-width: 800px;">
        <div style="flex: 1;">
          <h4 style="margin-bottom: 12px;">requiredMark: true (default)</h4>
          <BForm layout="vertical" :model="m1" :required-mark="true">
            <BFormItem name="name" label="Name" :schema="nameSchema" :required="true">
              <BInput v-model="m1.name" placeholder="Required" />
            </BFormItem>
            <BFormItem name="email" label="Email">
              <BInput v-model="m1.email" placeholder="Optional" />
            </BFormItem>
          </BForm>
        </div>
        <div style="flex: 1;">
          <h4 style="margin-bottom: 12px;">requiredMark: "optional"</h4>
          <BForm layout="vertical" :model="m2" required-mark="optional">
            <BFormItem name="name" label="Name" :schema="nameSchema" :required="true">
              <BInput v-model="m2.name" placeholder="Required" />
            </BFormItem>
            <BFormItem name="email" label="Email">
              <BInput v-model="m2.email" placeholder="Optional" />
            </BFormItem>
          </BForm>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Validate Status
// ─────────────────────────────────────────────
export const ValidateStatus: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const m = ref({ success: 'Good', warning: 'Hmm', error: 'Bad', validating: 'Loading...' });
      return { m };
    },
    template: `
      <div style="padding: 40px; max-width: 500px;">
        <BForm layout="vertical" :model="m">
          <BFormItem name="success" label="Success" validate-status="success" :has-feedback="true" help="Looks good!">
            <template #default="{ id }">
              <BInput v-model="m.success" :id="id" />
            </template>
          </BFormItem>
          <BFormItem name="warning" label="Warning" validate-status="warning" :has-feedback="true" help="This might need attention">
            <template #default="{ id }">
              <BInput v-model="m.warning" :id="id" />
            </template>
          </BFormItem>
          <BFormItem name="error" label="Error" validate-status="error" :has-feedback="true" help="Please fix this field">
            <template #default="{ id }">
              <BInput v-model="m.error" :id="id" />
            </template>
          </BFormItem>
          <BFormItem name="validating" label="Validating" validate-status="validating" :has-feedback="true" help="Checking...">
            <template #default="{ id }">
              <BInput v-model="m.validating" :id="id" />
            </template>
          </BFormItem>
        </BForm>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const formModel = ref({ username: '', email: '' });
      const schemas = {
        username: z.string().min(1, 'Username is required'),
        email: z.string().email('Invalid email'),
      };
      return { formModel, schemas };
    },
    template: `
      <div style="padding: 40px; max-width: 500px;">
        <BForm name="accessible-form" :model="formModel" layout="vertical">
          <BFormItem name="username" label="Username" :schema="schemas.username" :required="true" tooltip="Your unique login name">
            <template #default="{ id }">
              <BInput v-model="formModel.username" :id="id" placeholder="Enter username" />
            </template>
          </BFormItem>
          <BFormItem name="email" label="Email" :schema="schemas.email" extra="We will never share your email">
            <template #default="{ id }">
              <BInput v-model="formModel.email" :id="id" placeholder="Enter email" />
            </template>
          </BFormItem>
          <BFormItem>
            <button type="submit" style="padding: 6px 16px; background: #0958d9; color: white; border: none; border-radius: 6px; cursor: pointer;">Submit</button>
          </BFormItem>
        </BForm>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const form = canvasElement.querySelector('form');
    expect(form).toBeTruthy();
    expect(form!.getAttribute('role')).toBe('form');
    expect(form!.getAttribute('aria-label')).toBe('accessible-form');

    const formItems = canvasElement.querySelectorAll('.b-form-item');
    expect(formItems[0].getAttribute('role')).toBe('group');

    const requiredMark = canvasElement.querySelector('.b-form-item__required-mark');
    expect(requiredMark).toBeTruthy();
    expect(requiredMark!.getAttribute('aria-hidden')).toBe('true');

    const tooltip = canvasElement.querySelector('.b-form-item__tooltip');
    expect(tooltip).toBeTruthy();

    const submitBtn = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      const helpEl = canvasElement.querySelector('.b-form-item__help');
      expect(helpEl).toBeTruthy();
      expect(helpEl!.getAttribute('role')).toBe('alert');
      expect(helpEl!.getAttribute('aria-live')).toBe('polite');
    });

    const inputs = canvasElement.querySelectorAll('input');
    (inputs[0] as HTMLInputElement).focus();
    expect(document.activeElement).toBe(inputs[0]);

    await userEvent.tab();
    expect(document.activeElement).toBe(inputs[1]);
  },
};

// ─────────────────────────────────────────────
// 7. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const m1 = ref({ name: '' });
      const m2 = ref({ name: '' });
      const m3 = ref({ name: '' });
      const nameSchema = z.string().min(1, 'Required');
      return { m1, m2, m3, nameSchema };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BForm layout="vertical" :model="m1">
            <BFormItem name="name" label="Name" :schema="nameSchema" :required="true">
              <BInput v-model="m1.name" placeholder="Default" />
            </BFormItem>
            <BFormItem><button type="submit" style="padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 6px;">Submit</button></BFormItem>
          </BForm>
        </div>

        <div class="custom-form-theme-purple">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple theme</p>
          <BForm layout="vertical" :model="m2">
            <BFormItem name="name" label="Name" :schema="nameSchema" :required="true">
              <BInput v-model="m2.name" placeholder="Purple" />
            </BFormItem>
            <BFormItem><button type="submit" style="padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 6px;">Submit</button></BFormItem>
          </BForm>
        </div>

        <div class="custom-form-theme-green">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Green theme</p>
          <BForm layout="vertical" :model="m3">
            <BFormItem name="name" label="Name" :schema="nameSchema" :required="true">
              <BInput v-model="m3.name" placeholder="Green" />
            </BFormItem>
            <BFormItem><button type="submit" style="padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 6px;">Submit</button></BFormItem>
          </BForm>
        </div>
      </div>

      <style>
        .custom-form-theme-purple .b-form {
          --b-form-label-color: #7c3aed;
          --b-form-label-required-mark-color: #a855f7;
          --b-form-error-color: #9333ea;
        }
        .custom-form-theme-green .b-form {
          --b-form-label-color: #16a34a;
          --b-form-label-required-mark-color: #22c55e;
          --b-form-error-color: #dc2626;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Interaction Test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput, BSelect },
    setup: () => {
      const formModel = ref({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        website: '',
        role: '',
      });
      const submitted = ref(false);
      const schemas = {
        username: z.string()
          .min(3, 'Username must be at least 3 characters')
          .max(20, 'Username cannot exceed 20 characters')
          .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
        email: z.string().min(1, 'Email is required').email('Invalid email format'),
        password: z.string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
          .regex(/[0-9]/, 'Must contain at least one number')
          .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        phone: z.string()
          .min(1, 'Phone number is required')
          .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
        website: z.string()
          .refine((val) => val === '' || /^https?:\/\/.+\..+/.test(val), { message: 'Must be a valid URL starting with http:// or https://' }),
        role: z.string().min(1, 'Please select a role'),
      };
      const roleOptions = [
        { label: 'Developer', value: 'developer' },
        { label: 'Designer', value: 'designer' },
        { label: 'Product Manager', value: 'pm' },
      ];
      const onFinish = () => { submitted.value = true; };
      return { formModel, submitted, schemas, roleOptions, onFinish };
    },
    template: `
      <div style="padding: 40px; max-width: 520px;">
        <BForm :model="formModel" layout="vertical" @finish="onFinish">
          <BFormItem name="username" label="Username" :schema="schemas.username" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.username" :id="id" placeholder="lowercase letters, numbers, underscores" />
            </template>
          </BFormItem>
          <BFormItem name="email" label="Email" :schema="schemas.email" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.email" :id="id" placeholder="you@example.com" />
            </template>
          </BFormItem>
          <BFormItem name="password" label="Password" :schema="schemas.password" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.password" :id="id" type="password" placeholder="Min 8 chars, uppercase, number, special" />
            </template>
          </BFormItem>
          <BFormItem name="confirmPassword" label="Confirm Password" :schema="schemas.confirmPassword" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.confirmPassword" :id="id" type="password" placeholder="Re-enter password" />
            </template>
          </BFormItem>
          <BFormItem name="phone" label="Phone" :schema="schemas.phone" :required="true">
            <template #default="{ id }">
              <BInput v-model="formModel.phone" :id="id" placeholder="+1234567890" />
            </template>
          </BFormItem>
          <BFormItem name="website" label="Website" :schema="schemas.website">
            <template #default="{ id }">
              <BInput v-model="formModel.website" :id="id" placeholder="https://example.com" />
            </template>
          </BFormItem>
          <BFormItem name="role" label="Role" :schema="schemas.role" :required="true">
            <template #default="{ id }">
              <BSelect v-model="formModel.role" :id="id" :options="roleOptions" placeholder="Select a role" />
            </template>
          </BFormItem>
          <BFormItem>
            <button type="submit" style="padding: 6px 16px; background: #0958d9; color: white; border: none; border-radius: 6px; cursor: pointer;">Register</button>
          </BFormItem>
        </BForm>
        <p data-testid="submitted" style="margin-top: 12px; font-size: 12px;">Submitted: {{ submitted }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitBtn = canvas.getByRole('button', { name: /register/i });

    // Step 1: Submit empty form — should show multiple required errors
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('.b-form-item__help--error').length).toBeGreaterThanOrEqual(5);
      expect(canvasElement.textContent).toContain('Username must be at least 3 characters');
      expect(canvasElement.textContent).toContain('Email is required');
      expect(canvasElement.textContent).toContain('Password must be at least 8 characters');
      expect(canvasElement.textContent).toContain('Phone number is required');
      expect(canvasElement.textContent).toContain('Please select a role');
    });

    // Step 2: Type invalid username (uppercase, spaces) — regex error
    const inputs = canvasElement.querySelectorAll('input');
    await userEvent.type(inputs[0], 'Bad User!');
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(canvasElement.textContent).toContain('Only lowercase letters, numbers, and underscores');
    });

    // Step 3: Fix username, type invalid email
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], 'good_user');
    await userEvent.type(inputs[1], 'not-an-email');
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(canvasElement.textContent).toContain('Invalid email format');
    });

    // Step 4: Fix email, type weak password (no uppercase, no number, no special)
    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], 'user@test.com');
    await userEvent.type(inputs[2], 'weakpass');
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(canvasElement.textContent).toContain('Must contain at least one uppercase letter');
    });

    // Step 5: Fix password with strong one, add confirm, valid phone, select role
    await userEvent.clear(inputs[2]);
    await userEvent.type(inputs[2], 'Str0ng!Pass');
    await userEvent.type(inputs[3], 'Str0ng!Pass');
    await userEvent.type(inputs[4], '+1234567890');

    // Select a role via the BSelect
    const selectTrigger = canvasElement.querySelector('.b-select');
    if (selectTrigger) await userEvent.click(selectTrigger);
    await waitFor(() => {
      const option = canvasElement.querySelector('.b-select__option');
      if (option) userEvent.click(option);
    });

    // Step 6: Submit valid form
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(canvas.getByTestId('submitted').textContent).toContain('true');
    });
  },
};

// ─────────────────────────────────────────────
// 9. Dirty & Touched State
// ─────────────────────────────────────────────
export const DirtyTouchedState: Story = {
  render: () => ({
    components: { BForm, BFormItem, BInput },
    setup: () => {
      const formModel = ref({ name: '', email: '' });
      const formRef = ref<InstanceType<typeof BForm> | null>(null);
      const nameItemRef = ref<InstanceType<typeof BFormItem> | null>(null);
      const emailItemRef = ref<InstanceType<typeof BFormItem> | null>(null);
      const schemas = {
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      };
      return { formModel, formRef, nameItemRef, emailItemRef, schemas };
    },
    template: `
      <div style="padding: 40px; max-width: 500px;">
        <BForm ref="formRef" :model="formModel" layout="vertical">
          <BFormItem ref="nameItemRef" name="name" label="Name" :schema="schemas.name" :required="true">
            <template #default="{ id, onBlur }">
              <BInput v-model="formModel.name" :id="id" placeholder="Type to see dirty state" @blur="onBlur" />
            </template>
          </BFormItem>
          <BFormItem ref="emailItemRef" name="email" label="Email" :schema="schemas.email">
            <template #default="{ id, onBlur }">
              <BInput v-model="formModel.email" :id="id" placeholder="Focus then blur for touched" @blur="onBlur" />
            </template>
          </BFormItem>
          <BFormItem>
            <div style="display: flex; gap: 8px;">
              <button type="submit" style="padding: 6px 16px; background: #0958d9; color: white; border: none; border-radius: 6px; cursor: pointer;">Submit</button>
              <button type="button" @click="formRef?.resetFields()" style="padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer;">Reset</button>
            </div>
          </BFormItem>
        </BForm>
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 12px; font-family: monospace;">
          <p><strong>Name field:</strong> dirty={{ nameItemRef?.dirty?.value ?? false }}, touched={{ nameItemRef?.touched?.value ?? false }}</p>
          <p><strong>Email field:</strong> dirty={{ emailItemRef?.dirty?.value ?? false }}, touched={{ emailItemRef?.touched?.value ?? false }}</p>
          <p><strong>Form valid:</strong> {{ formRef?.isValid }}</p>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Design Tokens (LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 900px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BForm Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-form</code> or an ancestor to customize the component appearance.
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px 12px;">Variable</th>
              <th style="text-align: left; padding: 8px 12px;">Default</th>
              <th style="text-align: left; padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-item-margin-bottom</td>
              <td style="padding: 8px 12px;">24px</td>
              <td style="padding: 8px 12px;">Standard spacing below form items</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-inline-item-margin-bottom</td>
              <td style="padding: 8px 12px;">0</td>
              <td style="padding: 8px 12px;">Spacing below items in inline layout</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-color</td>
              <td style="padding: 8px 12px;">rgba(0, 0, 0, 0.88)</td>
              <td style="padding: 8px 12px;">Text color for labels</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Font size for labels</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-height</td>
              <td style="padding: 8px 12px;">32px</td>
              <td style="padding: 8px 12px;">Height of label elements</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-colon-margin-inline-start</td>
              <td style="padding: 8px 12px;">2px</td>
              <td style="padding: 8px 12px;">Left margin before label colon</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-colon-margin-inline-end</td>
              <td style="padding: 8px 12px;">8px</td>
              <td style="padding: 8px 12px;">Right margin after label colon</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-label-required-mark-color</td>
              <td style="padding: 8px 12px;">#cf1322</td>
              <td style="padding: 8px 12px;">Color of the required asterisk</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-vertical-label-margin</td>
              <td style="padding: 8px 12px;">0</td>
              <td style="padding: 8px 12px;">Margin for labels in vertical layout</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-vertical-label-padding</td>
              <td style="padding: 8px 12px;">0 0 8px</td>
              <td style="padding: 8px 12px;">Padding for labels in vertical layout</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-help-color</td>
              <td style="padding: 8px 12px;">rgba(0, 0, 0, 0.65)</td>
              <td style="padding: 8px 12px;">Color for help/extra text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-error-color</td>
              <td style="padding: 8px 12px;">#cf1322</td>
              <td style="padding: 8px 12px;">Color for error messages</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-form-warning-color</td>
              <td style="padding: 8px 12px;">#874d00</td>
              <td style="padding: 8px 12px;">Color for warning messages</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-form-success-color</td>
              <td style="padding: 8px 12px;">#52c41a</td>
              <td style="padding: 8px 12px;">Color for success feedback</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
