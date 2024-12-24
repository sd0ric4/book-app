import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import { Check } from 'lucide-react';
interface TextPaginationProps {
  initialText?: string;
}

const TextPagination: React.FC<TextPaginationProps> = ({
  initialText = '# Pride and Prejudice\n## By Jane Austen\n\n这是正文的第一行\n### 第一章\n这是第一章的内容\n#### 小节\n这是最后一行',
}) => {
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [text, setText] = useState<string>(initialText);
  const [lineWidth, setLineWidth] = useState<number>(40);
  const [pageHeight, setPageHeight] = useState<number>(5);
  const [pages, setPages] = useState<
    Array<{ text: string; isHeader: boolean; headerLevel?: number }[]>
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const [maxLineWidth, setMaxLineWidth] = useState<number>(40);
  const [fontFamily, setFontFamily] = useState<string>('mono');
  const [fontSize, setFontSize] = useState<number>(14);
  const [needMaxWidth, setNeedMaxWidth] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // 字体选项保持不变
  const fontOptions = [
    { value: 'mono', label: '等宽字体' },
    { value: 'sans', label: '无衬线字体' },
    { value: 'serif', label: '衬线字体' },
  ];

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
    const testChars = '测试Hello123.,';
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
  useEffect(() => {
    const updateMaxWidth = () => {
      if (containerRef.current && measureRef.current) {
        const calculatedMaxWidth = calculateMaxWidth(
          containerRef.current,
          measureRef,
          showLineNumbers
        );
        setMaxLineWidth(calculatedMaxWidth);
        if (needMaxWidth) {
          // 自动设置为最大字符数
          setLineWidth(calculatedMaxWidth);
        }
      }
    };

    // 添加一个小延时以确保字体已经完全加载
    const timeoutId = setTimeout(updateMaxWidth, 50);
    window.addEventListener('resize', updateMaxWidth);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMaxWidth);
    };
  }, [showLineNumbers, fontSize, fontFamily, calculateMaxWidth]);

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
      className={`min-h-screen ${currentTheme.background} ${currentTheme.text} transition-all duration-500`}
    >
      <div className='p-4 max-w-4xl mx-auto'>
        <div className='flex justify-end mb-4'>
          <ThemeMenu
            theme={theme}
            setTheme={setTheme}
            currentThemeStyle={currentTheme}
          />
        </div>

        <div
          className={`${currentTheme.card} rounded-lg p-6 shadow-lg border ${currentTheme.border}`}
        >
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2'>
              输入文本：
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full h-32 p-2 rounded font-mono mt-2 ${currentTheme.card} ${currentTheme.border}`}
                placeholder='输入要分页的文本，使用 # 表示标题...'
              />
            </label>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                每行字符数：
                <input
                  type='number'
                  value={lineWidth}
                  onChange={(e) => {
                    const value = Math.min(
                      Number(e.target.value),
                      maxLineWidth
                    );
                    setLineWidth(value);
                  }}
                  max={maxLineWidth}
                  className={`w-full p-2 rounded mt-2 ${currentTheme.card} ${currentTheme.border}`}
                  min='1'
                  aria-label='每行字符数'
                />
              </label>
              <div className={`text-sm mt-1 ${currentTheme.subtext}`}>
                最大可用宽度：{maxLineWidth} 字符
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                每页行数：
                <input
                  type='number'
                  value={pageHeight}
                  onChange={(e) => setPageHeight(Number(e.target.value))}
                  className={`w-full p-2 rounded mt-2 ${currentTheme.card} ${currentTheme.border}`}
                  min='1'
                  aria-label='每页行数'
                />
              </label>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                字体：
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={`w-full p-2 rounded mt-2 ${currentTheme.card} ${currentTheme.border}`}
                >
                  {fontOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                字体大小：
                <div className='flex items-center gap-2 mt-2'>
                  <input
                    type='range'
                    min='12'
                    max='24'
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className='flex-1'
                  />
                  <span className={`text-sm w-12 ${currentTheme.text}`}>
                    {fontSize}px
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className='flex gap-6 mb-4'>
            {/* 显示行号复选框 */}
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input
                  type='checkbox'
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className='w-4 h-4 border rounded appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors peer'
                />
                <Check className='absolute top-0 left-0 w-4 h-4 stroke-2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity' />
              </div>
              <span className='text-sm select-none group-hover:text-blue-500 transition-colors'>
                显示行号
              </span>
            </label>

            {/* 自动设置最大宽度复选框 */}
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input
                  type='checkbox'
                  checked={needMaxWidth}
                  onChange={(e) => {
                    setNeedMaxWidth(e.target.checked);
                    if (
                      e.target.checked &&
                      containerRef.current &&
                      measureRef.current
                    ) {
                      const calculatedMaxWidth = calculateMaxWidth(
                        containerRef.current,
                        measureRef,
                        showLineNumbers
                      );
                      setLineWidth(calculatedMaxWidth);
                    }
                  }}
                  className='w-4 h-4 border rounded appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors peer'
                />
                <Check className='absolute top-0 left-0 w-4 h-4 stroke-2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity' />
              </div>
              <span className='text-sm select-none group-hover:text-blue-500 transition-colors'>
                自动设置最大宽度
              </span>
            </label>
          </div>

          <div className='mb-4 flex justify-between items-center'>
            <h2 className='text-lg font-medium'>预览效果</h2>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className={`px-3 py-1 rounded ${currentTheme.button} disabled:opacity-50`}
              >
                上一页
              </button>
              <span className='text-sm'>
                {pages.length > 0
                  ? `${currentPage + 1} / ${pages.length}`
                  : '0 / 0'}
              </span>
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
          </div>

          <div
            ref={containerRef}
            className={`rounded p-4 ${currentTheme.card} ${getFontFamilyClass(
              fontFamily
            )} relative border ${currentTheme.border}`}
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
                {showLineNumbers && (
                  <span
                    className={`w-8 text-right pr-6 ${currentTheme.subtext}`}
                  >
                    {index + 1 + currentPage * pageHeight}.
                  </span>
                )}
                <div
                  className={`whitespace-pre flex-1 min-h-6 pl-4 ${
                    line.isHeader ? getHeaderStyle(line.headerLevel || 1) : ''
                  }`}
                >
                  {line.text || '\u00A0'}
                </div>
              </div>
            )) || <div className={currentTheme.subtext}>无内容</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextPagination;
