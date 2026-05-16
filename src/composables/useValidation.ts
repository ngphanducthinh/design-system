import {
  computed,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue';
import type { ZodType } from 'zod';

/**
 * Types
 */
export interface ValidationFieldState<T = unknown> {
  fieldValue: Ref<T>;
  errors: string[];
  isValid: boolean;
  dirty: boolean;
  touched: boolean;
  validate: () => boolean;
  reset: () => void;
  markTouched: () => void;
}

export const PIKey = {
  FormValidation: Symbol() as InjectionKey<
    Record<string, Ref<ValidationFieldState>>
  >,
};

/**
 * Form-level validation composable.
 * Creates or injects a shared validation registry, providing
 * methods to validate/reset all registered fields.
 */
export function useValidationForm() {
  let fields = inject(PIKey.FormValidation, undefined);
  if (!fields) {
    fields = {};
    provide(PIKey.FormValidation, fields);
  }

  const validateAll = (): boolean => {
    if (!fields) return false;
    return Object.values(fields)
      .map((field) => field.value.validate())
      .every((valid) => valid);
  };

  const resetAll = () => {
    if (!fields) return;
    Object.values(fields).forEach((field) => field.value.reset());
  };

  const isValid = computed(() => {
    if (!fields) return true;
    return Object.values(fields).every((field) => field.value.isValid);
  });

  return {
    fields,
    validateAll,
    resetAll,
    isValid,
  };
}

/**
 * Field-level validation composable.
 * Registers the field into the form's validation registry,
 * validates using the provided Zod schema, and tracks dirty/touched state.
 */
export function useValidationField<T>(
  key: string,
  fieldValue: Ref<T>,
  schema: ZodType<T>,
) {
  const initialValue = structuredClone(fieldValue.value);

  const fieldState = ref<ValidationFieldState<T>>({
    fieldValue,
    errors: [],
    isValid: true,
    dirty: false,
    touched: false,
    validate,
    reset,
    markTouched,
  });

  watch(
    fieldValue,
    (newVal) => {
      fieldState.value.dirty = !Object.is(newVal, initialValue);
    },
    { deep: true },
  );

  function validate(): boolean {
    const result = schema.safeParse(fieldValue.value);

    if (result.success) {
      fieldState.value.errors = [];
      fieldState.value.isValid = true;
    } else {
      fieldState.value.errors = result.error.issues.map(
        (issue) => issue.message,
      );
      fieldState.value.isValid = false;
    }

    return fieldState.value.isValid;
  }

  function reset() {
    fieldState.value.errors = [];
    fieldState.value.isValid = true;
    fieldState.value.dirty = false;
    fieldState.value.touched = false;
  }

  function markTouched() {
    fieldState.value.touched = true;
  }

  // Register into form
  const formFields = inject(PIKey.FormValidation, undefined);
  if (formFields) {
    formFields[key] = fieldState as Ref<ValidationFieldState>;
  }

  onBeforeUnmount(() => {
    if (formFields) {
      delete formFields[key];
    }
  });

  const errors = computed(() => fieldState.value.errors);
  const isValid = computed(() => fieldState.value.isValid);
  const dirty = computed(() => fieldState.value.dirty);
  const touched = computed(() => fieldState.value.touched);

  return {
    errors,
    isValid,
    dirty,
    touched,
    validate,
    reset,
    markTouched,
  } as {
    errors: ComputedRef<string[]>;
    isValid: ComputedRef<boolean>;
    dirty: ComputedRef<boolean>;
    touched: ComputedRef<boolean>;
    validate: () => boolean;
    reset: () => void;
    markTouched: () => void;
  };
}
