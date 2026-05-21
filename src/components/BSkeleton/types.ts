export type BSkeletonAvatarShape = 'circle' | 'square';
export type BSkeletonAvatarSize = 'small' | 'default' | 'large' | number;
export type BSkeletonButtonShape = 'circle' | 'round' | 'square' | 'default';
export type BSkeletonButtonSize = 'small' | 'default' | 'large';
export type BSkeletonInputSize = 'small' | 'default' | 'large';

/** Props shape for the inline-configured `avatar` field on BSkeleton. */
export interface BSkeletonAvatarConfig {
  active?: boolean;
  shape?: BSkeletonAvatarShape;
  size?: BSkeletonAvatarSize;
}

/** Props shape for the inline-configured `title` field on BSkeleton. */
export interface BSkeletonTitleConfig {
  width?: number | string;
}

/** Props shape for the inline-configured `paragraph` field on BSkeleton. */
export interface BSkeletonParagraphConfig {
  rows?: number;
  width?: number | string | (number | string)[];
}
