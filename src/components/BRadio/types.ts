import type { InjectionKey, Ref } from 'vue';

export interface BRadioOption {
  /** Display label for the radio */
  label: string;
  /** Value associated with this radio */
  value: string | number;
  /** Whether this specific radio is disabled */
  disabled?: boolean;
}

export interface BRadioGroupContext {
  modelValue: Ref<string | number | undefined>;
  disabled: Ref<boolean>;
  name: Ref<string>;
  size: Ref<'large' | 'middle' | 'small'>;
  optionType: Ref<'default' | 'button'>;
  buttonStyle: Ref<'outline' | 'solid'>;
  setValue: (val: string | number) => void;
}

export const B_RADIO_GROUP_KEY: InjectionKey<BRadioGroupContext> = Symbol('BRadioGroup');
