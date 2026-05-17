import type { InjectionKey } from 'vue';
import type { BFormItemContext } from './types.ts';

export const BFormContextKey = Symbol('BFormContext') as InjectionKey<BFormItemContext>;
