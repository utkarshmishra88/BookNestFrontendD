import { create } from 'zustand';

export const useThemeStore = create((set) => {
  // Read initial state from localStorage safely
  const getInitialState = () => {
    try {
      const stored = localStorage.getItem('bn_theme');
      return stored === 'dark';
    } catch {
      return false;
    }
  };

  return {
    isDarkMode: getInitialState(),
    
    toggleDarkMode: () => set((state) => {
      const nextState = !state.isDarkMode;
      try { localStorage.setItem('bn_theme', nextState ? 'dark' : 'light'); } catch {}
      return { isDarkMode: nextState };
    }),
    
    setDarkMode: (isDark) => set(() => {
      try { localStorage.setItem('bn_theme', isDark ? 'dark' : 'light'); } catch {}
      return { isDarkMode: isDark };
    }),
  };
});
