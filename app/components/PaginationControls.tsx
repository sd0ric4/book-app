import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme: {
    button: string;
  };
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  theme,
}: PaginationProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentPage, totalPages, onPageChange]);

  const getPageNumbers = () => {
    const visiblePages = 5; // Number of page buttons to show
    let pages = [];

    if (totalPages <= visiblePages) {
      // Show all pages if total is less than visible limit
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      if (currentPage <= 3) {
        // Near the start
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages = [
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // Middle - show current page with neighbors
        pages = [
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        ];
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex justify-center items-center gap-4 mt-6'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label='上一页'
        title='上一页'
        className={`p-2 rounded-lg flex items-center justify-center ${
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } transition-colors`}
      >
        <ChevronLeft className='w-5 h-5' aria-hidden='true' />
        <span className='sr-only'>上一页</span>
      </button>

      <div className='flex items-center gap-2'>
        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className='w-8 text-center'
                aria-hidden='true'
              >
                ⋯
              </span>
            );
          }

          return (
            <button
              key={`page-${pageNumber}`}
              onClick={() => onPageChange(pageNumber as number)}
              aria-label={`转到第 ${pageNumber} 页`}
              title={`第 ${pageNumber} 页`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentPage === pageNumber
                  ? `${theme.button} text-white`
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label='下一页'
        title='下一页'
        className={`p-2 rounded-lg flex items-center justify-center ${
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } transition-colors`}
      >
        <ChevronRight className='w-5 h-5' aria-hidden='true' />
        <span className='sr-only'>下一页</span>
      </button>
    </div>
  );
};

export default Pagination;
