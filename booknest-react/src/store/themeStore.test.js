import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset Zustand state
    useThemeStore.getState().setDarkMode(false);
  });

  it('starts with default light mode if nothing in localStorage', () => {
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('toggles dark mode', () => {
    useThemeStore.getState().toggleDarkMode();
    expect(useThemeStore.getState().isDarkMode).toBe(true);
    expect(localStorage.getItem('bn_theme')).toBe('dark');

    useThemeStore.getState().toggleDarkMode();
    expect(useThemeStore.getState().isDarkMode).toBe(false);
    expect(localStorage.getItem('bn_theme')).toBe('light');
  });

  it('sets dark mode directly', () => {
    useThemeStore.getState().setDarkMode(true);
    expect(useThemeStore.getState().isDarkMode).toBe(true);
    expect(localStorage.getItem('bn_theme')).toBe('dark');
  });
});
