import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import FontMenu from './FontMenu';
import ReaderModeMenu from './ReaderModeMenu';
interface ReaderProps {
  initialText?: string;
}

const DEFAULT_FONT_SETTINGS = {
  fontFamily: 'mono',
  fontSize: 16,
};
const useIsDualPage = () => {
  const [isDualPage, setIsDualPage] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const checkDualPageMode = (width: number) => {
      setIsDualPage(width >= 1024);
    };

    if (containerRef.current) {
      // 立即检查初始宽度
      checkDualPageMode(containerRef.current.offsetWidth);

      // 使用 ResizeObserver 监听容器大小变化
      observerRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          checkDualPageMode(entry.contentRect.width);
        }
      });

      observerRef.current.observe(containerRef.current);
    }

    // 添加一个短暂延时的额外检查，以应对某些特殊情况
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        checkDualPageMode(containerRef.current.offsetWidth);
      }
    }, 0);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    isDualPage:
      isDualPage ??
      (typeof window !== 'undefined' && window.innerWidth >= 1024),
    containerRef,
    getDualPageClassName: () =>
      `grid ${
        isDualPage ??
        (typeof window !== 'undefined' && window.innerWidth >= 1024)
          ? 'lg:grid-cols-2 gap-8'
          : 'grid-cols-1'
      }`,
  };
};
const Reader: React.FC<ReaderProps> = ({
  initialText = '# Pride and Prejudice\n## By Jane Austen\n\n这是正文的第一行\n### 第一章\n这是第一章的内容\n#### 小节\n这是最后一行',
}) => {
  const [isVerticalMode, setIsVerticalMode] = useState<boolean>(false);
  const { isDualPage, containerRef, getDualPageClassName } = useIsDualPage();
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
  const measureRef = useRef<HTMLSpanElement>(null);
  const renderVerticalContent = () => {
    const lines = text.split('\n').map((line, index) => {
      const headerInfo = getHeaderInfo(line);
      return (
        <div
          key={index}
          className={`py-1 ${
            headerInfo.isHeader
              ? getHeaderStyle(headerInfo.headerLevel || 1)
              : ''
          }`}
        >
          {headerInfo.text || '\u00A0'}
        </div>
      );
    });

    return (
      <div
        className={`px-16 py-8 ${getFontFamilyClass(fontFamily)}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {lines}
      </div>
    );
  };
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
      return 1;
    }
    return 0.8;
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
    const containerGap = isDualPage ? parseFloat(containerStyle.gap || '0') : 0;

    // 计算可用宽度，考虑双页模式
    let availableWidth =
      container.offsetWidth - (containerPaddingLeft + containerPaddingRight);

    if (isDualPage) {
      // 在双页模式下，考虑间隙并将宽度除以2
      availableWidth = (availableWidth - containerGap) / 2;
    }

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
        setPageHeight(calculatedMaxHeight);
      }
    };

    const timeoutId = setTimeout(updateMaxDimensions, 50);
    window.addEventListener('resize', updateMaxDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMaxDimensions);
    };
  }, [showLineNumbers, fontSize, fontFamily, isDualPage]); // 添加 isDualPage 作为依赖
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
  // 渲染单个页面内容
  const renderPage = (pageContent: (typeof pages)[0] | null, index: number) => {
    if (!pageContent) return null;

    return (
      <div key={index} className='h-full flex flex-col'>
        {pageContent.map((line, lineIndex) => (
          <div key={lineIndex} className='flex min-h-6'>
            <div
              className={`whitespace-pre flex-1 min-h-6 ${
                line.isHeader ? getHeaderStyle(line.headerLevel || 1) : ''
              }`}
            >
              {line.text || '\u00A0'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 获取当前显示的页面内容
  const getCurrentPages = () => {
    if (!isDualPage) {
      return [pages[currentPage]];
    }

    // 双页模式下，显示左右两页
    const leftPage = pages[currentPage];
    const rightPage =
      currentPage < pages.length - 1 ? pages[currentPage + 1] : null;
    return [leftPage, rightPage].filter(
      (page): page is (typeof pages)[0] => page !== null
    );
  };

  // 处理翻页
  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentPage((p) => Math.max(0, isDualPage ? p - 2 : p - 1));
    } else {
      setCurrentPage((p) =>
        Math.min(pages.length - 1, isDualPage ? p + 2 : p + 1)
      );
    }
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
        <ReaderModeMenu
          isVerticalMode={isVerticalMode}
          setIsVerticalMode={setIsVerticalMode}
          currentThemeStyle={currentTheme}
        />
        <ThemeMenu
          theme={theme}
          setTheme={setTheme}
          currentThemeStyle={currentTheme}
        />
      </div>

      <div className={`h-screen w-screen p-4 flex flex-col`}>
        <div
          className={`flex-1 ${currentTheme.card} rounded-lg shadow-lg border overflow-hidden ${currentTheme.border} relative`}
        >
          {!isVerticalMode && (
            <div className='absolute top-4 left-4 flex items-center gap-2'>
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
                className={`px-3 py-1 rounded ${currentTheme.button} disabled:opacity-50`}
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange('next')}
                disabled={
                  currentPage >=
                  (isDualPage ? pages.length - 2 : pages.length - 1)
                }
                className={`px-3 py-1 rounded ${currentTheme.button} disabled:opacity-50`}
              >
                下一页
              </button>
            </div>
          )}

          {isVerticalMode ? (
            <div className='h-full overflow-y-auto'>
              {renderVerticalContent()}
            </div>
          ) : (
            <div
              ref={containerRef}
              className={`h-full w-full p-16 ${
                currentTheme.card
              } ${getFontFamilyClass(fontFamily)} overflow-auto grid ${
                isDualPage ? 'lg:grid-cols-2 gap-8' : 'grid-cols-1'
              }`}
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

              {getCurrentPages().map((pageContent, index) => (
                <div
                  key={index}
                  className={`h-full ${
                    isDualPage ? 'border-r last:border-r-0' : ''
                  } ${currentTheme.border}`}
                >
                  {renderPage(pageContent, index)}
                </div>
              ))}
            </div>
          )}

          {!isVerticalMode && (
            <div
              className={`absolute bottom-4 right-4 text-sm ${currentTheme.subtext}`}
            >
              {pages.length > 0
                ? `${currentPage + 1}${
                    isDualPage && currentPage < pages.length - 1
                      ? '-' + (currentPage + 2)
                      : ''
                  } / ${pages.length}`
                : '0 / 0'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 创建一个预设数据的导出版本
export const BookViewerDemo: React.FC = () => {
  const sampleContent = `
毫無價值、俯拾皆是的虛假。
在無數的複製當中，將慘烈的戰役變成一種遊戲，變成一個讓人發噱的「故事」。
巨人族戰役從很久以前就喪失了它的真實性，它僅僅是一個「任務」，再也沒有星座會打從心底對它感到敬畏。
我抬頭仰望黑帝斯。
「富裕夤夜之父啊，您還要放任奧林帕斯將塔爾塔羅斯的巨神當作玩物多久？」
既不隸屬奧林帕斯，又併稱為奧林帕斯三大主神的存在。
我回想起《滅活法》當中關於祂的設定。
黑帝斯雖然為巨人族戰役供應了無數的巨神，但連一次都不曾參加那個任務。
這位蒼老的冥界之王，長久見證著巨神在祂的牢獄中承受的痛苦折磨。
因此，黑帝斯知曉那些囚犯的悲傷，也理解祂們的苦難，恍若被囚犯教化的獄卒。
「上次我造訪冥界，見到塔爾塔羅斯的地底正在積極整備巨神兵。您暗中籌備一切，不都是為了這一刻？」
『那只是你過度臆測。』
那只是為了防範巨神再次引發戰爭　　面對奧林帕斯十二神，黑帝斯便是這樣解釋巨神兵的存在。
然而，關於黑帝斯內心真正的想法，我心下雪亮。
「我知道您對十二神心懷憎恨。雖然號稱三大主神，但對祂們而言，您不過是負責替祂們解決麻煩人物的獄卒罷了。」
世上最古老的獄卒，或許也和身陷囹圄的囚犯沒什麼區別。
黑帝斯安靜地俯視著我。
『巨人族戰役是一場極為殘酷的戰爭。』
「我知道。」
『真正的巨人族戰役一旦爆發，不僅巨神會淪為受到任務操弄的玩物，身在此地的所有人，都將成為浩瀚神話的一部分。』
黑帝斯抬起目光，好似在眺望著遠方的滅亡。
『那將使鬼怪肆意妄為，在星星直播引發劇變，星雲之間長久爭鬥的角力關係，也會一夕傾覆。』
「這些我也明白。」
『你究竟想得到什麼，以致不惜為世界帶來如此令人髮指的苦難？』
出聲回答的人並不是我。
［傳說『無王世界之王』開始講述故事。］
［傳說『異蹟對抗者』開始講述故事。］
    `;

  return <Reader initialText={sampleContent} />;
};
