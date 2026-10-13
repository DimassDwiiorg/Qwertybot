import { useState, useEffect } from 'react';
import { ThemePreference } from '../types/index.js';

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem('qwertybot-theme');
      return (saved as ThemePreference) || 'system';
    } catch {
      return 'system';
    }
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let activeIsDark = false;

      if (preference === 'system') {
        activeIsDark = mediaQuery.matches;
      } else if (preference === 'dark') {
        activeIsDark = true;
      } else {
        activeIsDark = false;
      }

      setIsDark(activeIsDark);

      if (activeIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (preference === 'system') {
        applyTheme();
      }
    };

    // Dengarkan perubahan mode sistem perangkat secara dinamis
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const updatePreference = (newPref: ThemePreference) => {
    setPreference(newPref);
    try {
      localStorage.setItem('qwertybot-theme', newPref);
    } catch {}
  };

  return {
    preference,
    isDark,
    setPreference: updatePreference
  };
}
