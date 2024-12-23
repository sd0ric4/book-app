import { useState, useEffect } from 'react';
import type { Theme } from '../../types/theme';
import { getSystemTheme, themeStyles } from './constants';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    getSystemTheme()
  );
  const [mounted, setMounted] = useState(false);

  // 初始化主题和系统主题监听
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
    };

    // 从 localStorage 获取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    mediaQuery.addEventListener('change', handleChange);
    setMounted(true);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 主题变化时保存到 localStorage
  useEffect(() => {
    if (mounted && theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.className =
        theme === 'system' ? systemTheme : theme;
    }
  }, [theme, systemTheme, mounted]);

  // 获取当前主题样式
  const getCurrentThemeStyle = () => {
    if (theme === 'system') {
      return themeStyles[systemTheme];
    }
    return themeStyles[theme];
  };

  return {
    theme,
    setTheme,
    currentTheme: getCurrentThemeStyle(),
    mounted,
    systemTheme,
  };
}
