import { useState, useEffect } from 'react';

interface FontSettings {
  family: string;
  size: number;
}

const DEFAULT_FONT: FontSettings = {
  family: 'sans',
  size: 16,
};

// 获取系统默认字体
const getSystemFont = () => {
  const computedStyle = window.getComputedStyle(document.body);
  return computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '');
};

export function useFont() {
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT.family);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT.size);
  const [systemFont, setSystemFont] = useState<string>(getSystemFont());
  const [mounted, setMounted] = useState(false);

  // 初始化字体设置和系统字体监听
  useEffect(() => {
    const savedFont = localStorage.getItem('fontSettings');
    if (savedFont) {
      const { family, size } = JSON.parse(savedFont);
      setFontFamily(family);
      setFontSize(size);
    }

    // 监听系统字体变化
    const observer = new MutationObserver(() => {
      setSystemFont(getSystemFont());
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    setMounted(true);

    return () => observer.disconnect();
  }, []);

  // 字体设置变化时保存到 localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        'fontSettings',
        JSON.stringify({
          family: fontFamily,
          size: fontSize,
        })
      );

      // 应用字体设置
      document.documentElement.style.setProperty(
        'font-family',
        fontFamily === 'system' ? systemFont : fontFamily
      );
      document.documentElement.style.setProperty('font-size', `${fontSize}px`);
    }
  }, [fontFamily, fontSize, systemFont, mounted]);

  return {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    systemFont,
    mounted,
  };
}
