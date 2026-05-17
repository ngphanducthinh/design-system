export enum BFormLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Inline = 'inline',
}

export enum BFormLabelAlign {
  Left = 'left',
  Right = 'right',
}

export enum BFormValidateStatus {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Validating = 'validating',
}

export enum BFormRequiredMark {
  Required = 'required',
  Optional = 'optional',
}

export enum BFormValidateTrigger {
  Change = 'change',
  Blur = 'blur',
  Submit = 'submit',
}

export interface BFormFieldError {
  name: string;
  errors: string[];
}

export interface BFormValidateResult {
  values: Record<string, unknown>;
  errorFields: BFormFieldError[];
}

export interface BFormItemContext {
  layout: `${BFormLayout}`;
  labelAlign: `${BFormLabelAlign}`;
  labelWidth: string | undefined;
  colon: boolean;
  disabled: boolean;
  requiredMark: boolean | `${BFormRequiredMark}`;
  validateTrigger: `${BFormValidateTrigger}` | `${BFormValidateTrigger}`[];
  model: Record<string, unknown> | undefined;
}

export interface BFormInstance {
  validate: () => boolean;
  resetFields: (names?: string[]) => void;
  scrollToField: (name: string, options?: ScrollIntoViewOptions) => void;
  isValid: boolean;
}
