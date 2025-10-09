import { type BCollapseData, BIconSize, type BTabData } from '@/types.ts';
import type { InjectionKey, Ref } from 'vue';

export const BIconSizeMap: Record<BIconSize, number> = {
  [BIconSize.XSmall]: 0.5, // 8px
  [BIconSize.Small]: 0.75, // 12px
  [BIconSize.Medium]: 1, // 16px
  [BIconSize.Large]: 1.25, // 20px
  [BIconSize.XLarge]: 1.5, // 24px
  [BIconSize.XXLarge]: 2, // 32px
};

export const PIKey = {
  BCollapseGroup: Symbol('Injection key for an array of BCollapseData') as InjectionKey<
    Ref<Array<BCollapseData>>
  >,
  BTabToggleGroup: Symbol('Injection key for the unique id of the BToggles') as InjectionKey<
    Ref<Array<BTabData>>
  >,
  BTabContentGroup: Symbol('Injection key for the unique id of the BTabContents') as InjectionKey<
    Ref<Array<BTabData>>
  >,
};
