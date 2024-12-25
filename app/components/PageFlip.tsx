import React, { useState, useRef, useEffect } from 'react';

interface PageFlipProps {
  currentPages: React.ReactNode[];
  nextPages: React.ReactNode[];
  onAnimationComplete: () => void;
  direction: 'next' | 'prev';
  isFlipping: boolean;
  currentThemeStyle: {
    text: string;
    border: string;
    card: string;
  };
}

const PageFlip: React.FC<PageFlipProps> = ({
  currentPages,
  nextPages,
  onAnimationComplete,
  direction,
  isFlipping,
  currentThemeStyle,
}) => {
  const [animationClass, setAnimationClass] = useState('');
  const flipContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFlipping) {
      setAnimationClass(
        direction === 'next' ? 'animate-flip-next' : 'animate-flip-prev'
      );

      const timer = setTimeout(() => {
        setAnimationClass('');
        onAnimationComplete();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isFlipping, direction, onAnimationComplete]);

  return (
    <div className='relative w-full h-full overflow-hidden [perspective:1000px]'>
      <div
        ref={flipContainerRef}
        className={`relative w-full h-full ${currentThemeStyle.card}
          ${animationClass} transition-transform duration-500
          transform-gpu [transform-style:preserve-3d]`}
      >
        <div
          className={`absolute inset-0 grid grid-cols-2 gap-8 ${currentThemeStyle.border}
          [backface-visibility:hidden]`}
        >
          {currentPages.map((content, index) => (
            <div
              key={`current-${index}`}
              className={`h-full [transform-origin:center_left] ${currentThemeStyle.text}`}
            >
              {content}
            </div>
          ))}
        </div>

        <div
          className={`absolute inset-0 grid grid-cols-2 gap-8 ${currentThemeStyle.border}
            [backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          {nextPages.map((content, index) => (
            <div
              key={`next-${index}`}
              className={`h-full [transform-origin:center_left] ${currentThemeStyle.text}`}
            >
              {content}
            </div>
          ))}
        </div>

        <div
          className={`absolute inset-0 pointer-events-none 
            transition-opacity duration-500 bg-gradient-to-r 
            from-black/20 to-transparent
            ${isFlipping ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <style>
        {`
          .animate-flip-next {
            animation: flipNext 500ms ease-in-out forwards;
          }
          
          .animate-flip-prev {
            animation: flipPrev 500ms ease-in-out forwards;
          }
          
          @keyframes flipNext {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(-180deg); }
          }
          
          @keyframes flipPrev {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(180deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PageFlip;
