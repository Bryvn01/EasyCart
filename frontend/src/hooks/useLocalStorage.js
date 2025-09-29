import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
};

// Hook for session storage
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing multiple localStorage keys with a prefix
export const useLocalStorageState = (prefix = 'app') => {
  const getItem = (key) => {
    try {
      const item = window.localStorage.getItem(`${prefix}:${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${prefix}:${key}":`, error);
      return null;
    }
  };

  const setItem = (key, value) => {
    try {
      if (value === undefined || value === null) {
        window.localStorage.removeItem(`${prefix}:${key}`);
      } else {
        window.localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${prefix}:${key}":`, error);
    }
  };

  const removeItem = (key) => {
    try {
      window.localStorage.removeItem(`${prefix}:${key}`);
    } catch (error) {
      console.error(`Error removing localStorage key "${prefix}:${key}":`, error);
    }
  };

  const clear = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${prefix}:`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(`Error clearing localStorage with prefix "${prefix}":`, error);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    clear
  };
};