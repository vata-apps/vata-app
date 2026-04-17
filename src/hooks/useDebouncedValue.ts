import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the given value that only updates after
 * the value has been stable for `delay` milliseconds.
 *
 * Useful for decoupling a fast-updating input (e.g. a controlled text field)
 * from an expensive downstream computation (e.g. filtering a large dataset).
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
