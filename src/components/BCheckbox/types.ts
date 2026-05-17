import type { InjectionKey, Ref } from 'vue';

export interface BCheckboxOption {
  /** Display label for the checkbox */
  label: string;
  /** Value associated with this checkbox */
  value: string | number;
  /** Whether this specific checkbox is disabled */
  disabled?: boolean;
}

export interface BCheckboxGroupContext {
  modelValue: Ref<Array<string | number>>;
  disabled: Ref<boolean>;
  name: Ref<string>;
  toggleValue: (val: string | number) => void;
}

export const B_CHECKBOX_GROUP_KEY: InjectionKey<BCheckboxGroupContext> = Symbol('BCheckboxGroup');
