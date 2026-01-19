import { useRef, useEffect } from "react";

/**
 * A reusable debounce hook that provides debouncing functionality.
 *
 * @param delay - The delay in milliseconds to wait before executing the debounced callback
 * @returns An object with two functions:
 *   - `debounce`: Debounces a callback function
 *   - `resetDebounce`: Clears any pending debounced call
 *
 * @example
 * ```tsx
 * const { debounce, resetDebounce } = useDebounce(300);
 *
 * const handleChange = (value: string) => {
 *   debounce(() => {
 *     // This will only execute 300ms after the last call
 *     console.log(value);
 *   });
 * };
 * ```
 */
export function useDebounce(delay: number = 300) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetDebounce = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const debounce = <T extends (...args: any[]) => void>(callback: T) => {
    resetDebounce();
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current = null;
    }, delay);
  };

  return { debounce, resetDebounce };
}
