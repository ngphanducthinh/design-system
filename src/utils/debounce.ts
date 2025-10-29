/**
 * Creates a debounced version of a function that delays invoking until after
 * the specified delay has elapsed since the last time it was invoked.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns A debounced version of the function
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 500);
 *
 * debouncedSearch('hello'); // Will only execute after 500ms of no more calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 150,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}
