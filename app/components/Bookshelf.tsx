import {
  Book as BookIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import type { Route } from './+types/Bookshelf';
import { getBookList } from '~/services/books/getBook';
import type { Book } from '~/types/book';
import { useLoaderData } from 'react-router';
import BookDetailButton from './BookDetailsButton';
import Pagination from './PaginationControls';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const booklist = await getBookList();
    return {
      booklist,
    };
  } catch (error) {
    throw new Response('Book not found', { status: 404 });
  }
}

type LoaderData = {
  booklist: Book[];
};

const ITEMS_PER_PAGE = 12;

const Bookshelf = ({ params }: Route.ComponentProps) => {
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const { booklist } = useLoaderData<LoaderData>();
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 初始化所有图片为加载状态
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>(
    () => {
      const initialLoadingState: Record<number, boolean> = {};
      booklist.forEach((book) => {
        initialLoadingState[book.id] = true;
      });
      return initialLoadingState;
    }
  );

  const handleImageLoad = (bookId: number) => {
    setLoadingImages((prev) => ({
      ...prev,
      [bookId]: false,
    }));
  };

  const handleImageError = (bookId: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [bookId]: true,
    }));
    setLoadingImages((prev) => ({
      ...prev,
      [bookId]: false,
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      // 获取新页面的图书
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newPageBooks = booklist.slice(startIndex, endIndex);

      // 初始化新页面的加载状态
      const newLoadingState = { ...loadingImages };
      newPageBooks.forEach((book) => {
        newLoadingState[book.id] = true;
      });

      setLoadingImages(newLoadingState);
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(booklist.length / ITEMS_PER_PAGE);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return booklist.slice(startIndex, endIndex);
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${currentTheme.background} ${currentTheme.text} transition-colors duration-300`}
    >
      <div className='relative max-w-6xl mx-auto p-4'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
            我的书架
          </h1>
          <ThemeMenu
            theme={theme}
            setTheme={setTheme}
            currentThemeStyle={currentTheme}
          />
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8'>
          {getCurrentPageBooks().map((book) => (
            <div
              key={book.id}
              className='group relative'
              onMouseEnter={() => setHoveredBook(book.id)}
              onMouseLeave={() => setHoveredBook(null)}
            >
              <div className='relative mb-4 perspective'>
                <div
                  className={`absolute inset-0 ${currentTheme.card} backdrop-blur-xl rounded-lg transform -rotate-6 group-hover:rotate-0 transition-all duration-300 opacity-75 shadow-lg`}
                ></div>

                <div
                  className={`relative aspect-[2/3] ${currentTheme.card} backdrop-blur-sm border ${currentTheme.border} rounded-lg overflow-hidden transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}
                >
                  {/* Loading State */}
                  {loadingImages[book.id] && !imageErrors[book.id] && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm'>
                      <Loader2
                        className={`w-8 h-8 ${currentTheme.text} animate-spin`}
                      />
                    </div>
                  )}

                  {/* Cover Image or Fallback */}
                  {book.cover_url && !imageErrors[book.id] ? (
                    <>
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className={`w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 ${
                          loadingImages[book.id] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(book.id)}
                        onError={() => handleImageError(book.id)}
                        // 预加载图片
                        onLoadStart={() => {
                          if (!loadingImages[book.id]) {
                            setLoadingImages((prev) => ({
                              ...prev,
                              [book.id]: true,
                            }));
                          }
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${currentTheme.card}`}
                    >
                      <BookIcon
                        className={`w-12 h-12 ${currentTheme.subtext} transition-all duration-300 group-hover:scale-110`}
                      />
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}
                  >
                    <BookDetailButton
                      bookId={book.id}
                      currentTheme={{
                        button: `${currentTheme.button} backdrop-blur-sm`,
                        buttonText: currentTheme.text,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-1'>
                <h3
                  className={`text-sm font-medium truncate group-hover:${currentTheme.text} transition-colors`}
                >
                  {book.title}
                </h3>
                <p className={`text-xs ${currentTheme.subtext} truncate`}>
                  {book.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default Bookshelf;
