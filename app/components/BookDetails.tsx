import { useState } from 'react';
import type { Route } from './+types/BookDetails';
import { Book as BookIcon } from 'lucide-react';
import { getBook } from '../services/api';
import type { Book } from '../types/book';
import { useTheme } from '../hooks/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import BookReviewDemo from './BookReview';
import { getSummary } from '../services/api';
import type { BookReviewData } from '~/types/review';
import { Link, useLoaderData } from 'react-router';
import BackButton from './BackToShelfButton';
import { useRouteTransition } from '~/hooks/useRouteTransition';
export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id;

  try {
    // 获取书籍数据
    const book = await getBook(Number(id));

    // 处理tags字段
    const parsedTags =
      typeof book.tags === 'string'
        ? JSON.parse(book.tags)
        : Array.isArray(book.tags)
        ? book.tags
        : [];

    // 获取书籍摘要
    const summaryData = await getSummary({
      book_title: book.title,
      author: book.author,
    });

    // 返回组合的数据
    return {
      book: { ...book, tags: parsedTags },
      summary: summaryData.summary,
    };
  } catch (error) {
    throw new Response('Book not found', { status: 404 });
  }
}

// Loader类型定义
type LoaderData = {
  book: Book & { tags: string[] };
  summary: BookReviewData;
};

export function RouteComponent({ params }: Route.ComponentProps) {
  const navigateWithTransition = useRouteTransition();

  const handleReadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition('/test');
  };
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [imageError, setImageError] = useState(false);
  const { book, summary } = useLoaderData<LoaderData>();

  const defaultSummary: BookReviewData = {
    title: 'null',
    author: 'null',
    characters: [],
    synopsis: 'null',
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${currentTheme.background} ${currentTheme.text} transition-colors duration-300`}
    >
      {/* Main content with padding bottom for fixed navigation */}
      <div className='pb-32 md:pb-24'>
        <div className='max-w-4xl mx-auto p-4 md:p-6'>
          {/* Navigation and theme controls */}
          <div className='flex justify-between items-center mb-4 md:mb-6'>
            <BackButton currentThemeStyle={currentTheme} />
            <ThemeMenu
              theme={theme}
              setTheme={setTheme}
              currentThemeStyle={currentTheme}
            />
          </div>

          {/* Book header section */}
          <div className='flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8'>
            {/* Book cover */}
            <div className='relative w-24 md:w-32 h-36 md:h-44 mx-auto md:mx-0'>
              <div
                className={`absolute inset-0 ${currentTheme.card} backdrop-blur-xl rounded-lg transform -rotate-6`}
              ></div>
              <div
                className={`relative w-full h-full ${currentTheme.card} rounded-lg border ${currentTheme.border} backdrop-blur-sm flex items-center justify-center shadow-lg`}
              >
                {book?.cover_url && !imageError ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className='w-full h-full object-cover rounded-lg'
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <BookIcon className='w-12 h-12 md:w-16 md:h-16 text-gray-600' />
                )}
              </div>
            </div>

            {/* Book details */}
            <div className='flex-1 text-center md:text-left'>
              <h1 className='text-xl md:text-2xl font-bold mb-2'>
                {book?.title}
              </h1>
              <p
                className={`text-base md:text-lg ${currentTheme.subtext} mb-3 md:mb-4 font-medium`}
              >
                {book?.author}
              </p>
              <p className={`${currentTheme.subtext} text-sm leading-relaxed`}>
                {book?.description}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className='grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8'>
            <div
              className={`${currentTheme.card} backdrop-blur-sm border ${currentTheme.border} rounded-xl p-3 md:p-4 text-center`}
            >
              <div className='text-lg md:text-xl font-bold'>
                {book?.format || 'Digital'}
              </div>
              <div
                className={`text-xs md:text-sm ${currentTheme.subtext} mt-1`}
              >
                格式
              </div>
            </div>
            <div
              className={`${currentTheme.card} backdrop-blur-sm border ${currentTheme.border} rounded-xl p-3 md:p-4 text-center`}
            >
              <div className='text-lg md:text-xl font-bold'>
                {book?.tags.length}
              </div>
              <div
                className={`text-xs md:text-sm ${currentTheme.subtext} mt-1`}
              >
                标签
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className='flex flex-wrap gap-2 mb-6 md:mb-8'>
            {book?.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 md:px-4 py-1 md:py-1.5 ${currentTheme.card} ${currentTheme.hover} border ${currentTheme.border} rounded-full text-xs md:text-sm backdrop-blur-sm transition-colors duration-200 cursor-pointer`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Book review section */}
          <BookReviewDemo
            currentTheme={currentTheme}
            summary={summary ?? defaultSummary} // 需要定义 defaultSummary
          />
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <div className='fixed bottom-0 left-0 right-0 w-full'>
        <div
          className={`${currentTheme.card} backdrop-blur-xl border-t ${currentTheme.border} shadow-lg`}
        >
          <div className='max-w-4xl mx-auto grid grid-cols-2 gap-2 md:gap-4 p-3 md:p-4'>
            <button
              className={`px-4 md:px-6 py-2.5 md:py-3 w-full ${currentTheme.button} ${currentTheme.text} rounded-xl 
                       transition-all duration-200 backdrop-blur-sm border ${currentTheme.border} 
                       text-sm md:text-base shadow-sm hover:shadow-md 
                       hover:scale-[1.02] active:scale-95`}
            >
              加入书架
            </button>
            <Link
              to='/test'
              onClick={handleReadClick}
              className={`px-4 md:px-6 py-2.5 md:py-3 w-full ${currentTheme.activeButton} ${currentTheme.text} 
                   rounded-xl transition-all duration-200 backdrop-blur-sm border ${currentTheme.border} 
                   text-sm md:text-base shadow-sm hover:shadow-md 
                   hover:scale-[1.02] active:scale-95
                   flex justify-center items-center text-center`}
            >
              阅读此书
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteComponent;
