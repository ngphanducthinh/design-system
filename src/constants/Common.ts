import type { InjectionKey, Ref } from 'vue';
import type { ValidationResult } from '@/composables/Validation';

export const DateDelimiter = '/';
export const RequiredSymbol = '*';
export const PIKey = {
  FormValidation: Symbol() as InjectionKey<
    Record<string, Ref<ValidationResult>>
  >,
  CloseDropdown: Symbol() as InjectionKey<() => void>,
  Carousel: Symbol() as InjectionKey<Ref<HTMLDivElement[]>>,
};
export const FileImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
