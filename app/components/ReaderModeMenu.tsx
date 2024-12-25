import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, ScrollText } from 'lucide-react';

interface ReaderModeMenuProps {
  isVerticalMode: boolean;
  setIsVerticalMode: (mode: boolean) => void;
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

const ReaderModeMenu: React.FC<ReaderModeMenuProps> = ({
  isVerticalMode,
  setIsVerticalMode,
  currentThemeStyle,
}) => {
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

  const modeOptions = [
    { value: false, label: '翻页模式', icon: BookOpen },
    { value: true, label: '滚动模式', icon: ScrollText },
  ];

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${currentThemeStyle.button} ${currentThemeStyle.text} transition-colors duration-200`}
        aria-label='阅读模式'
      >
        {isVerticalMode ? (
          <ScrollText className='w-5 h-5' />
        ) : (
          <BookOpen className='w-5 h-5' />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-48 rounded-lg ${currentThemeStyle.card} 
          ${currentThemeStyle.border} border backdrop-blur-sm shadow-lg z-50`}
        >
          <div className='py-1'>
            <div className='px-3 py-2 text-sm font-medium'>阅读模式</div>
            {modeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value.toString()}
                onClick={() => {
                  setIsVerticalMode(value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center gap-2 ${
                  currentThemeStyle.text
                } ${currentThemeStyle.hover} ${
                  isVerticalMode === value ? 'font-medium' : ''
                } transition-colors duration-200`}
              >
                <Icon className='w-4 h-4' />
                <span>{label}</span>
                {isVerticalMode === value && (
                  <span className='ml-auto w-1 h-1 rounded-full bg-current' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderModeMenu;
