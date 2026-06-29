import { useState, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function usePersistentState<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        // If the initial value was a Set, assume we stored an Array and convert back
        if (initialValue instanceof Set) {
          return new Set(parsed) as T;
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
      localStorage.removeItem(key); // Clear the corrupted data
    }
    return initialValue;
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      setState((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        // Serialize Set as Array
        const serializedValue = valueToStore instanceof Set ? Array.from(valueToStore) : valueToStore;
        localStorage.setItem(key, JSON.stringify(serializedValue));
        return valueToStore;
      });
    },
    [key]
  );

  return [state, setValue];
}
