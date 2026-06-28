import { useState, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function usePersistentState<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
    }
    return initialValue;
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      setState((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    },
    [key]
  );

  return [state, setValue];
}
