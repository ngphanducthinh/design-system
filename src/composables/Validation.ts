import { inject, onBeforeUnmount, provide, ref, type Ref } from 'vue';
import { PIKey } from '@/constants/Common';

/**
 * Types
 */
// eslint-disable-next-line no-unused-vars
export type ValidationRuleFunction = (val: any) => boolean;
export type ValidationErrorMessageFunction = () => string;
export interface ValidationRule {
  validateRule: ValidationRuleFunction;
  errorMessage: ValidationErrorMessageFunction;
}
export interface ValidationResult {
  validate: () => void;
  fieldValue: Ref<any>;
  valid: boolean;
  errorMessage: ValidationErrorMessageFunction;
}

/**
 * ValidationForm
 * @returns
 */
export function useValidationForm() {
  let validationForm = inject(PIKey.FormValidation, undefined);
  if (!validationForm) {
    validationForm = {};
    provide(PIKey.FormValidation, validationForm);
  }

  const validateAll = (): boolean => {
    if (validationForm) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const vList = Object.entries(validationForm).map(([key, value]) => {
        value.value.validate();
        return value.value.valid;
      });
      return vList.every((v) => v);
    }
    return false;
  };
  const resetAll = () => {
    if (validationForm) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(validationForm).forEach(([key, value]) => {
        value.value.valid = true;
        value.value.errorMessage = () => '';
      });
    }
  };

  return {
    validationForm,
    validateAll,
    resetAll,
  };
}

/**
 * Validation Field
 * @param key
 * @param fieldValue
 * @param validationRules
 * @returns
 */
export function useValidationField(
  key: string,
  fieldValue: Ref<any>,
  validationRules: ValidationRule[] | undefined,
) {
  const validationResult = ref<ValidationResult>({
    validate: () => {},
    fieldValue,
    valid: true,
    errorMessage: () => '',
  });

  const formValidations = inject(PIKey.FormValidation, undefined);
  if (formValidations) {
    formValidations[key] = validationResult;
  }

  onBeforeUnmount(() => {
    if (formValidations) {
      delete formValidations[key];
    }
  });

  /**
   * Validate field value by a list of rules
   * @returns
   */
  const validate = () => {
    if (!validationRules) {
      return;
    }

    validationResult.value.valid = true;
    validationResult.value.errorMessage = () => '';

    for (let i = 0; i < validationRules.length; i++) {
      const result = validationRules[i].validateRule(fieldValue.value);

      if (!result) {
        validationResult.value.valid = false;
        validationResult.value.errorMessage = validationRules[i].errorMessage;
        return;
      }
    }
  };

  validationResult.value.validate = validate;

  return {
    validate,
    validationResult,
  };
}
