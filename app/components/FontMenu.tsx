import { useState, useRef, useEffect } from 'react';
import { Type } from 'lucide-react';

interface FontMenuProps {
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  currentThemeStyle: {
    text: string;
    button: string;
    activeButton: string;
    card: string;
    border: string;
    hover: string;
    subtext: string;
  };
}
const fontSizeOptions = [
  { value: 16, label: 'XS' },
  { value: 20, label: 'S' },
  { value: 24, label: 'M' },
  { value: 32, label: 'L' },
  { value: 40, label: 'XL' },
] as const;

const fontItems = [
  { value: 'mono', label: '等宽字体' },
  { value: 'sans', label: '无衬线字体' },
  { value: 'serif', label: '衬线字体' },
] as const;

export function FontMenu({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  currentThemeStyle,
}: FontMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${currentThemeStyle.button} ${currentThemeStyle.text} transition-colors duration-200`}
        aria-label='更改字体'
      >
        <Type className='w-5 h-5' />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 rounded-lg ${currentThemeStyle.card} 
          ${currentThemeStyle.border} border backdrop-blur-sm shadow-lg z-50`}
        >
          <div className='p-3 border-b border-gray-200 dark:border-gray-700'>
            <div className='mb-2 text-sm font-medium'>字体大小</div>
            <div className='grid grid-cols-5 gap-1'>
              {fontSizeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={`px-2 py-1.5 rounded text-sm transition-all
                    ${
                      fontSize === value
                        ? `${currentThemeStyle.activeButton} font-medium`
                        : currentThemeStyle.button
                    }
                    hover:opacity-80`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className='py-1'>
            <div className='px-3 py-2 text-sm font-medium'>字体选择</div>
            {fontItems.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setFontFamily(value);
                }}
                className={`w-full px-3 py-2 flex items-center gap-2 ${
                  currentThemeStyle.text
                } 
                  ${currentThemeStyle.hover} ${
                  fontFamily === value ? 'font-medium' : ''
                } 
                  transition-colors duration-200`}
              >
                <span
                  className={`${
                    value === 'mono'
                      ? 'font-mono'
                      : value === 'sans'
                      ? 'font-sans'
                      : 'font-serif'
                  }`}
                >
                  {label}
                </span>
                {fontFamily === value && (
                  <span className='ml-auto w-1 h-1 rounded-full bg-current' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FontMenu;
