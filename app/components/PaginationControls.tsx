// components/Pagination.tsx
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
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
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
