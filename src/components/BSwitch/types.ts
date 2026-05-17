export interface BSwitchProps {
  /** Whether the switch is checked (controlled). */
  modelValue?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Whether to show a loading spinner on the handle. */
  loading?: boolean;
  /** Size of the switch. */
  size?: 'default' | 'small';
}

export interface BSwitchEmits {
  (e: 'update:modelValue', checked: boolean): void;
  (e: 'change', checked: boolean, event: Event): void;
  (e: 'click', checked: boolean, event: MouseEvent): void;
}
