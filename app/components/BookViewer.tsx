import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../lib/theme/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import type { ThemeStyle } from '~/types/theme';
import { FontSettings } from './FontSettings';
import _ from 'lodash';
const FONT_SIZE_KEY = 'ebook-reader-font-size';
const DEFAULT_FONT_SIZE = 18;
// 定义可聚焦元素的类型
type FocusableElement = {
  id: string; // 元素唯一标识
  ref: React.RefObject<HTMLButtonElement>; // 按钮元素引用
  row: number; // 元素所在行
  col: number; // 元素所在列
};

export function EbookReader() {
  // 状态管理
  const content = `
  测试
  测试段落
  测试故事:
  第一章:
  从前有座山，山上有座庙，庙里有个老和尚和小和尚住在一起。    
  `.repeat(999);
  const getSavedFontSize = (): number => {
    if (typeof window === 'undefined') {
      return DEFAULT_FONT_SIZE;
    }

    try {
      const savedFontSize = window.localStorage.getItem(FONT_SIZE_KEY);
      return savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_FONT_SIZE;
    } catch (error) {
      console.warn('Failed to get font size from localStorage:', error);
      return DEFAULT_FONT_SIZE;
    }
  };
  // 添加一个保存字体大小的函数
  const saveFontSize = (size: number): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(FONT_SIZE_KEY, size.toString());
    } catch (error) {
      console.warn('Failed to save font size to localStorage:', error);
    }
  };
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [pages, setPages] = useState<string[]>([]); // 分页后的内容
  const [currentPage, setCurrentPage] = useState(0); // 当前页码
  const [fontSize, setFontSize] = useState(getSavedFontSize());
  const [focusedElementId, setFocusedElementId] = useState<string>(''); // 当前焦点元素ID

  // 创建引用
  const contentRef = useRef<HTMLDivElement>(null); // 内容容器引用
  const prevRef = useRef<HTMLButtonElement>(null); // 上一页按钮引用
  const nextRef = useRef<HTMLButtonElement>(null); // 下一页按钮引用

  // 获取可聚焦元素列表
  const getFocusableElements = (): FocusableElement[] => {
    return [
      {
        id: 'prev',
        ref: prevRef as React.RefObject<HTMLButtonElement>,
        row: 1,
        col: 0,
      },
      {
        id: 'next',
        ref: nextRef as React.RefObject<HTMLButtonElement>,
        row: 1,
        col: 2,
      },
    ];
  };

  // 计算分页
  const calculatePages = () => {
    if (!contentRef.current) return;

    const contentArea = contentRef.current;
    const availableWidth = contentArea.clientWidth;
    const availableHeight = contentArea.clientHeight;

    // 创建临时元素用于计算
    const temp = document.createElement('div');
    temp.style.cssText = `
      width: ${availableWidth}px;
      position: absolute;
      visibility: hidden;
      word-wrap: break-word;
      font-size: ${fontSize}px;
      line-height: 1.75;
      font-family: serif;
      white-space: pre-wrap;
    `;

    temp.innerHTML = content;
    document.body.appendChild(temp);

    const newPages = [];
    let remainingContent = content;

    // 分页循环
    while (remainingContent.length > 0) {
      temp.textContent = remainingContent;

      if (temp.clientHeight <= availableHeight) {
        newPages.push(remainingContent);
        break;
      }

      let estimatedLength = Math.floor(
        remainingContent.length * (availableHeight / temp.clientHeight)
      );
      let found = false;

      // 断句点优先级
      const breakPoints = {
        paragraph: ['\n'],
        sentence: ['。', '！', '？'],
        clause: ['；', '：'],
        phrase: ['，'],
      };

      const searchRange = 200;
      const maxPos = Math.min(
        remainingContent.length,
        estimatedLength + searchRange
      );

      // 寻找合适的断句点
      for (const [_, puncts] of Object.entries(breakPoints)) {
        if (found) break;

        for (let i = estimatedLength; i < maxPos; i++) {
          if (puncts.includes(remainingContent[i])) {
            temp.textContent = remainingContent.slice(0, i + 1);

            if (temp.clientHeight <= availableHeight) {
              estimatedLength = i + 1;
              found = true;
            } else {
              break;
            }
          }
        }
      }

      if (found) {
        newPages.push(remainingContent.slice(0, estimatedLength));
        remainingContent = remainingContent.slice(estimatedLength);
      } else {
        // 如果没找到合适的断句点，使用二分查找
        let left = 0;
        let right = estimatedLength;
        while (left < right) {
          const mid = Math.floor((left + right + 1) / 2);
          temp.textContent = remainingContent.slice(0, mid);
          if (temp.clientHeight <= availableHeight) {
            left = mid;
          } else {
            right = mid - 1;
          }
        }
        newPages.push(remainingContent.slice(0, left));
        remainingContent = remainingContent.slice(left);
      }
    }

    document.body.removeChild(temp);
    setPages(newPages);
  };

  // 处理分页计算的时机
  useEffect(() => {
    if (!mounted) return;

    calculatePages();

    const handleResize = () => {
      calculatePages();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, fontSize, content]);

  // 键盘导航处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const elements = getFocusableElements();
      const currentElement = elements.find((el) => el.id === focusedElementId);

      if (!currentElement) return;

      const currentRow = currentElement.row;
      const currentCol = currentElement.col;

      let nextElement: FocusableElement | undefined;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow && el.col === currentCol - 1
          );
          if (!nextElement) {
            prevPage();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow && el.col === currentCol + 1
          );
          if (!nextElement) {
            nextPage();
          }
          break;
        case 'Escape':
          // FontSettings 组件内部会处理自己的 Escape 键逻辑
          break;
      }

      if (nextElement) {
        nextElement.ref.current?.focus();
        setFocusedElementId(nextElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedElementId]);

  // 页面导航
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 添加一个新的 useEffect 来保存字体大小
  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  // 修改 adjustFontSize 函数
  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, fontSize + delta));
    setFontSize(newSize);
  };

  // 直接修改 setFontSize 的调用处
  const handleFontSizeChange = (newSize: number) => {
    const clampedSize = Math.max(12, Math.min(32, newSize));
    setFontSize(clampedSize);
  };

  // 焦点处理
  const handleFocus = (elementId: string) => {
    setFocusedElementId(elementId);
  };

  const getFocusClass = (elementId: string) => {
    return focusedElementId === elementId ? 'ring-2 ring-primary' : '';
  };

  // 样式对象
  const contentStyle = {
    fontSize: `${fontSize}px`,
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 w-screen h-screen ${
        (currentTheme as ThemeStyle).background
      } ${(currentTheme as ThemeStyle).text} transition-all duration-300`}
      role='main'
      aria-label='电子书阅读器'
    >
      {/* 右上角控制按钮组 */}
      <div className='absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-4'>
        <FontSettings
          fontSize={fontSize}
          setFontSize={setFontSize}
          currentThemeStyle={currentTheme as ThemeStyle}
          onFocus={handleFocus}
          focusedElementId={focusedElementId}
        />
        <ThemeMenu
          theme={theme}
          setTheme={setTheme}
          currentThemeStyle={currentTheme as ThemeStyle}
        />
      </div>

      {/* 内容区域 */}
      <div className='relative w-full h-full max-w-6xl mx-auto'>
        <div className='absolute inset-10'>
          <div ref={contentRef} className='relative w-full h-full'>
            <div
              className={`font-serif leading-relaxed whitespace-pre-wrap ${
                (currentTheme as ThemeStyle).text
              }`}
              style={contentStyle}
            >
              {pages[currentPage]}
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className='fixed inset-x-32 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10'>
          <button
            ref={prevRef}
            onClick={prevPage}
            onFocus={() => handleFocus('prev')}
            disabled={currentPage === 0}
            className={`p-2 rounded-full pointer-events-auto transition-opacity ${
              currentPage === 0 ? 'opacity-0' : 'opacity-50 hover:opacity-100'
            } ${getFocusClass('prev')}`}
            aria-label='上一页'
          >
            <ChevronLeft
              className={`w-8 h-8 ${(currentTheme as ThemeStyle).text}`}
            />
          </button>

          <button
            ref={nextRef}
            onClick={nextPage}
            onFocus={() => handleFocus('next')}
            disabled={currentPage === pages.length - 1}
            className={`p-2 rounded-full pointer-events-auto transition-opacity ${
              currentPage === pages.length - 1
                ? 'opacity-0'
                : 'opacity-50 hover:opacity-100'
            } ${getFocusClass('next')}`}
            aria-label='下一页'
          >
            <ChevronRight
              className={`w-8 h-8 ${(currentTheme as ThemeStyle).text}`}
            />
          </button>
        </div>

        {/* 页码指示器 */}
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 ${
            (currentTheme as ThemeStyle).buttonSecondary
          } rounded-full text-sm opacity-50 hover:opacity-100 transition-opacity z-10`}
        >
          {currentPage + 1} / {pages.length}
        </div>

        {/* 键盘导航提示 */}
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-xs opacity-50'>
          <p className={`${(currentTheme as ThemeStyle).subtext}`}>
            使用方向键导航，空格或回车键确认
          </p>
        </div>
      </div>
    </div>
  );
}

export default EbookReader;
