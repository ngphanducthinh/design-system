// ─────────────────────────────────────────────
// BCarousel types
// ─────────────────────────────────────────────

/** Position of the dots / page indicators relative to the carousel viewport. */
export type BCarouselDotPlacement = 'top' | 'bottom' | 'start' | 'end';

/** Transition effect when changing slides. */
export type BCarouselEffect = 'scrollx' | 'fade';

/** Object form of `autoplay`. Pass `true` for plain autoplay, or this object to
 *  enable extra features (such as the dotDuration progress indicator). */
export interface BCarouselAutoplayConfig {
  /** When true, dots show a filling progress bar tied to autoplaySpeed. */
  dotDuration?: boolean;
}

/** Argument shape of the `beforeChange` event. */
export interface BCarouselBeforeChangePayload {
  current: number;
  next: number;
}
