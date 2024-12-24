import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import FontMenu from './FontMenu';

interface ReaderProps {
  initialText?: string;
}
interface HeightCache {
  standardLineHeight: number;
  headerHeights: Map<number, number>;
}

const DEFAULT_FONT_SETTINGS = {
  fontFamily: 'mono',
  fontSize: 16,
};

const Reader: React.FC<ReaderProps> = ({
  initialText = '# Pride and Prejudice\n## By Jane Austen\n\n这是正文的第一行\n### 第一章\n这是第一章的内容\n#### 小节\n这是最后一行',
}) => {
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [text] = useState<string>(initialText);
  const [lineWidth, setLineWidth] = useState<number>(40);
  const [pageHeight, setPageHeight] = useState<number>(5);
  const [pages, setPages] = useState<
    Array<{ text: string; isHeader: boolean; headerLevel?: number }[]>
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showLineNumbers] = useState<boolean>(false);
  const [maxLineWidth, setMaxLineWidth] = useState<number>(40);
  const [maxPageHeight, setMaxPageHeight] = useState<number>(5);
  const [fontFamily, setFontFamily] = useState<string>(
    DEFAULT_FONT_SETTINGS.fontFamily
  );
  const [fontSize, setFontSize] = useState<number>(
    DEFAULT_FONT_SETTINGS.fontSize
  );
  const lineHeightCache = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // 字符宽度计算保持不变...
  const getCharWidth = (char: string): number => {
    if (/[\u4e00-\u9fa5]|[，。；：！？、]/.test(char)) {
      return 1;
    }
    if (/[""'']/.test(char)) {
      return 0.5;
    }
    if (/[a-zA-Z0-9]/.test(char)) {
      return 0.6;
    }
    if (/[.,!?;:'"()\[\]{}]/.test(char)) {
      return 0.5;
    }
    if (/\s/.test(char)) {
      return 0.5;
    }
    return 0.5;
  };
  // 更新计算最大行高的函数
  const calculateMaxHeight = (container: HTMLDivElement): number => {
    if (!container) return 5;

    // 获取容器样式
    const containerStyle = window.getComputedStyle(container);
    const containerHeight = container.offsetHeight;
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);

    // 测量实际行高
    if (!lineHeightCache.current || fontSize) {
      const testEl = document.createElement('div');
      testEl.style.visibility = 'hidden';
      testEl.style.position = 'absolute';
      testEl.style.fontSize = `${fontSize}px`;
      testEl.className = getFontFamilyClass(fontFamily);
      testEl.textContent = '测试行高';

      container.appendChild(testEl);
      const testElHeight = testEl.offsetHeight;
      container.removeChild(testEl);

      lineHeightCache.current = testElHeight;
    }

    // 计算可用高度内可容纳的行数
    const availableHeight = containerHeight - paddingTop - paddingBottom;
    const maxLines = Math.floor(availableHeight / lineHeightCache.current);

    return Math.max(1, maxLines); // 确保至少返回1
  };
  // 检查是否为标题行并获取标题级别
  const getHeaderInfo = (line: string) => {
    const headerMatch = line.match(/^(#{1,6})\s/);
    if (headerMatch) {
      return {
        isHeader: true,
        headerLevel: headerMatch[1].length,
        text: line.slice(headerMatch[0].length),
      };
    }
    return {
      isHeader: false,
      text: line,
    };
  };

  // 分页逻辑保持不变...
  const paginateText = (
    text: string,
    lineWidth: number,
    pageHeight: number
  ) => {
    // 原有的分页逻辑代码...
    const pages: Array<
      { text: string; isHeader: boolean; headerLevel?: number }[]
    > = [];
    let currentPage: Array<{
      text: string;
      isHeader: boolean;
      headerLevel?: number;
    }> = [];
    let currentLine: string[] = [];
    let currentLineWidth = 0;

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerInfo = getHeaderInfo(line);

      if (line.trim() === '') {
        if (currentLine.length > 0) {
          currentPage.push({
            text: currentLine.join(''),
            isHeader: false,
          });
          currentLine = [];
          currentLineWidth = 0;
        }

        currentPage.push({
          text: '',
          isHeader: false,
        });

        if (currentPage.length >= pageHeight) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        continue;
      }

      if (headerInfo.isHeader) {
        if (currentLine.length > 0) {
          currentPage.push({
            text: currentLine.join(''),
            isHeader: false,
          });
          currentLine = [];
          currentLineWidth = 0;
        }

        currentPage.push({
          text: headerInfo.text,
          isHeader: true,
          headerLevel: headerInfo.headerLevel,
        });

        if (currentPage.length >= pageHeight) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        continue;
      }

      for (let j = 0; j < headerInfo.text.length; j++) {
        const char = headerInfo.text[j];
        const charWidth = getCharWidth(char);

        if (currentLineWidth + charWidth > lineWidth) {
          currentPage.push({
            text: currentLine.join(''),
            isHeader: false,
          });
          currentLine = [];
          currentLineWidth = 0;

          if (currentPage.length >= pageHeight) {
            pages.push([...currentPage]);
            currentPage = [];
          }
        }

        currentLine.push(char);
        currentLineWidth += charWidth;
      }

      if (currentLine.length > 0) {
        currentPage.push({
          text: currentLine.join(''),
          isHeader: false,
        });
        currentLine = [];
        currentLineWidth = 0;

        if (currentPage.length >= pageHeight) {
          pages.push([...currentPage]);
          currentPage = [];
        }
      }
    }

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  // 计算最大宽度的逻辑更新以考虑字体大小
  const calculateMaxWidth = (
    container: HTMLDivElement,
    measureRef: React.RefObject<HTMLSpanElement | null>,
    showLineNumbers: boolean
  ): number => {
    // 创建一个临时的测量元素
    const testEl = document.createElement('div');
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    testEl.style.whiteSpace = 'pre';
    testEl.style.fontSize = `${fontSize}px`;

    // 用一组代表性的字符来测量
    const testChars = '测';
    testEl.textContent = testChars;

    // 分别测量不同字体下的宽度
    const widths = new Map();
    ['mono', 'sans', 'serif'].forEach((font) => {
      testEl.className = getFontFamilyClass(font);
      container.appendChild(testEl);
      widths.set(font, testEl.offsetWidth / testChars.length);
      container.removeChild(testEl);
    });

    // 获取当前字体的相对宽度比例
    const currentWidth = widths.get(fontFamily) || widths.get('mono');
    const monoWidth = widths.get('mono');
    const fontAdjustment = monoWidth / currentWidth;
    if (!container || !measureRef.current) return 40;

    const containerStyle = window.getComputedStyle(container);
    const containerPaddingLeft = parseFloat(containerStyle.paddingLeft);
    const containerPaddingRight = parseFloat(containerStyle.paddingRight);

    let availableWidth =
      container.offsetWidth -
      (containerPaddingLeft + containerPaddingRight) * 2;

    if (showLineNumbers) {
      const lineNumberElement = container.querySelector('.text-gray-400');
      if (lineNumberElement) {
        const lineNumberStyle = window.getComputedStyle(lineNumberElement);
        const lineNumberWidth = parseFloat(lineNumberStyle.width);
        const lineNumberPaddingRight = parseFloat(lineNumberStyle.paddingRight);
        availableWidth -= lineNumberWidth + lineNumberPaddingRight;
      }
    }

    const textLineElement = container.querySelector('.whitespace-pre');
    if (textLineElement) {
      const textLineStyle = window.getComputedStyle(textLineElement);
      const textLinePaddingLeft = parseFloat(textLineStyle.paddingLeft);
      availableWidth -= textLinePaddingLeft;
    }

    // 使用实际测量的宽度来计算
    const charWidth = measureRef.current.offsetWidth;
    return Math.floor((availableWidth / charWidth) * fontAdjustment);
  };

  // Effects 保持不变但需要添加对字体和字体大小的依赖...

  // 更新 useEffect 以包含最大行数计算
  useEffect(() => {
    const updateMaxDimensions = () => {
      if (containerRef.current && measureRef.current) {
        const calculatedMaxWidth = calculateMaxWidth(
          containerRef.current,
          measureRef,
          showLineNumbers
        );
        const calculatedMaxHeight = calculateMaxHeight(containerRef.current);

        setMaxLineWidth(calculatedMaxWidth);
        setMaxPageHeight(calculatedMaxHeight);
        setLineWidth(calculatedMaxWidth);
        setPageHeight(calculatedMaxHeight); // 自动设置为最大行数
      }
    };

    const timeoutId = setTimeout(updateMaxDimensions, 50);
    window.addEventListener('resize', updateMaxDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMaxDimensions);
    };
  }, [showLineNumbers, fontSize, fontFamily]);
  // 在字体或字号变化时重置缓存
  useEffect(() => {
    lineHeightCache.current = null;
  }, [fontSize, fontFamily]);
  useEffect(() => {
    const newPages = paginateText(text, lineWidth, pageHeight);
    setPages(newPages);
  }, [text, lineWidth, pageHeight]);

  // 获取标题的样式

  const getHeaderStyle = (level: number) => {
    const baseStyle = 'font-bold';
    const sizeClasses = {
      1: 'text-2xl',
      2: 'text-xl',
      3: 'text-lg',
      4: 'text-base',
      5: 'text-sm',
      6: 'text-xs',
    };
    return `${baseStyle} ${sizeClasses[level as keyof typeof sizeClasses]}`;
  };

  // Combined font settings effect for both loading and saving
  useEffect(() => {
    const loadFontSettings = () => {
      try {
        const savedFontFamily = localStorage.getItem('fontFamily');
        const savedFontSize = localStorage.getItem('fontSize');

        if (savedFontFamily) {
          setFontFamily(savedFontFamily);
        }

        if (savedFontSize) {
          const parsedSize = parseInt(savedFontSize, 10);
          if (!isNaN(parsedSize)) {
            setFontSize(parsedSize);
          }
        }
      } catch (error) {
        console.warn('Failed to load font settings from localStorage:', error);
        // Use defaults if localStorage fails
        setFontFamily(DEFAULT_FONT_SETTINGS.fontFamily);
        setFontSize(DEFAULT_FONT_SETTINGS.fontSize);
      }
    };

    const saveFontSettings = () => {
      try {
        localStorage.setItem('fontFamily', fontFamily);
        localStorage.setItem('fontSize', fontSize.toString());
      } catch (error) {
        console.warn('Failed to save font settings to localStorage:', error);
      }
    };

    // Load settings only once when component mounts
    if (!mounted) {
      loadFontSettings();
    } else {
      // Save settings when they change and component is mounted
      saveFontSettings();
    }
  }, [fontFamily, fontSize, mounted]);

  // 获取字体类名
  const getFontFamilyClass = (fontFamily: string) => {
    const fontClasses = {
      mono: 'font-mono',
      sans: 'font-sans',
      serif: 'font-serif',
    };
    return fontClasses[fontFamily as keyof typeof fontClasses];
  };
  if (!mounted) return null;

  return (
    <div
      className={`h-full w-full ${currentTheme.background} ${currentTheme.text} transition-all duration-500 overflow-hidden`}
    >
      <div className='fixed top-4 right-4 md:top-6 md:right-6 flex gap-2 z-10'>
        <FontMenu
          fontSize={fontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          currentThemeStyle={currentTheme}
          setFontSize={setFontSize}
        />
        <ThemeMenu
          theme={theme}
          setTheme={setTheme}
          currentThemeStyle={currentTheme}
        />
      </div>

      <div className={`h-screen w-screen p-4 flex flex-col`}>
        <div
          className={`flex-1 ${currentTheme.card} rounded-lg shadow-lg border overflow-auto ${currentTheme.border} relative`}
        >
          <div className='absolute top-4 left-4 flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`px-3 py-1 rounded ${currentTheme.button} disabled:opacity-50`}
            >
              上一页
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pages.length - 1, p + 1))
              }
              disabled={currentPage >= pages.length - 1}
              className={`px-3 py-1 rounded ${currentTheme.button} disabled:opacity-50`}
            >
              下一页
            </button>
          </div>

          <div
            ref={containerRef}
            className={`h-full w-full p-16 ${
              currentTheme.card
            } ${getFontFamilyClass(fontFamily)} overflow-auto`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className='absolute opacity-0 pointer-events-none'>
              <span
                ref={measureRef}
                className={getFontFamilyClass(fontFamily)}
                style={{ fontSize: `${fontSize}px` }}
              >
                测
              </span>
            </div>

            {pages[currentPage]?.map((line, index) => (
              <div key={index} className='flex min-h-6'>
                <div
                  className={`whitespace-pre flex-1 min-h-6 ${
                    line.isHeader ? getHeaderStyle(line.headerLevel || 1) : ''
                  }`}
                >
                  {line.text || '\u00A0'}
                </div>
              </div>
            )) || <div className={currentTheme.subtext}>无内容</div>}
          </div>
          <div
            className={`absolute bottom-4 right-4 text-sm ${currentTheme.subtext}`}
          >
            {pages.length > 0
              ? `${currentPage + 1} / ${pages.length}`
              : '0 / 0'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 创建一个预设数据的导出版本
export const BookViewerDemo: React.FC = () => {
  const sampleContent = `
# 示例标题
这是一段示例文本内容，用于测试 BookViewer 组件。
## 二级标题
更多的示例文本...
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。
此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。此材料可能受版权保护。
“Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with,—
“I hope Mr. Bingley will like it, Lizzy.”
“We are not in a way to know what Mr. Bingley likes,” said her mother, resentfully, “since we are not to visit.”

摘录来自
Pride and Prejudice
Jane Austen
此材料可能受版权保护。
    `;

  return <Reader initialText={sampleContent} />;
};
