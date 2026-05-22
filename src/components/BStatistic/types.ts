/** Value displayed by `<BStatistic>` - number or string. */
export type BStatisticValue = number | string;

/** Function form of the formatter prop - takes a value, returns a display string. */
export type BStatisticFormatter = (value: BStatisticValue) => string;

/** Mode for `<BStatisticTimer>`. */
export type BStatisticTimerType = 'countdown' | 'countup';
