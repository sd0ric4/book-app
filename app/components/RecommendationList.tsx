import { BookOpen, Star, Trophy, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '~/hooks/useTheme';

const BookRecommendations = () => {
  const { currentTheme, mounted } = useTheme();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({}); // 定义为一个number键和boolean值的记录类型
  const recommendations = [
    {
      id: 2,
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description:
        'A masterpiece of wit and social observation, following the Bennet family and their five unmarried daughters.',
      tags: 'romance drama',
      score: 0.7445643285097712,
    },
    {
      id: 32,
      title: '解忧杂货店',
      author: '东野圭吾',
      description:
        '一个神奇的杂货店，能给来客们带来解开心结的答案，温暖而治愈的故事。',
      tags: 'fiction mystery drama',
      score: 0.5337263608613662,
    },
    {
      id: 5,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description:
        'A powerful story of racial injustice and the loss of innocence in the American South.',
      tags: 'fiction drama mystery',
      score: 0.5337263608613662,
    },
    {
      id: 1,
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      description:
        'A timeless collection of detective stories featuring the brilliant Sherlock Holmes and his loyal companion Dr. Watson.',
      tags: 'fiction adventure mystery',
      score: 0.400658848376359,
    },
    {
      id: 34,
      title: '盗墓笔记',
      author: '南派三叔',
      description:
        '一部关于地下世界探险的小说，融合了考古、历史与神秘主义元素。',
      tags: 'fiction adventure mystery',
      score: 0.400658848376359,
    },
  ];

  const getRankGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400/80 to-yellow-300/80 dark:from-yellow-500/40 dark:to-yellow-400/40';
      case 1:
        return 'from-gray-300/80 to-gray-200/80 dark:from-gray-400/40 dark:to-gray-300/40';
      case 2:
        return 'from-amber-500/80 to-amber-400/80 dark:from-amber-600/40 dark:to-amber-500/40';
      default:
        return 'from-gray-200/50 to-gray-100/50 dark:from-gray-700/40 dark:to-gray-600/40';
    }
  };

  if (!mounted) return null;

  return (
    <div className='flex flex-col min-h-screen'>
      <div
        className={`flex-1 w-full p-4 sm:p-6 md:p-8 lg:p-12 ${currentTheme?.background} ${currentTheme?.text}`}
      >
        {/* Header section */}
        <div className='max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-12'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div
                className={`${currentTheme?.card} backdrop-blur-sm p-2 sm:p-3 rounded-xl border ${currentTheme?.border}`}
              >
                <Trophy className='w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 dark:text-yellow-400' />
              </div>
              <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold'>
                推荐书籍排行榜
              </h1>
            </div>
            <div
              className={`flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${currentTheme?.subtext}`}
            >
              <BookOpen className='w-4 h-4 sm:w-5 sm:h-5' />
              <span>共 {recommendations.length} 本好书</span>
            </div>
          </div>
        </div>

        {/* Book list */}
        <div className='max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8'>
          {recommendations.map((book, index) => (
            <div
              key={book.id}
              className={`group ${currentTheme?.card} backdrop-blur-sm rounded-xl sm:rounded-2xl border ${currentTheme?.border} 
                         hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              <div className='flex flex-col sm:flex-row items-stretch'>
                {/* Rank indicator */}
                <div
                  className={`flex items-center justify-center h-12 sm:h-auto sm:w-20 md:w-24 
                                bg-gradient-to-r ${getRankGradient(
                                  index
                                )} backdrop-blur-sm`}
                >
                  <span className='text-2xl sm:text-3xl md:text-4xl font-bold'>
                    {index + 1}
                  </span>
                </div>

                {/* Book content */}
                <div className='flex-1 p-4 sm:p-6 md:p-8'>
                  <div className='flex flex-col sm:flex-row gap-4 sm:gap-8'>
                    {/* Book cover */}
                    <div className='flex-none mx-auto sm:mx-0'>
                      <div
                        className={`w-24 sm:w-32 md:w-40 h-36 sm:h-48 md:h-56 ${currentTheme?.card} 
                                     rounded-lg sm:rounded-xl shadow-lg transform group-hover:scale-105 
                                     transition-transform duration-300 overflow-hidden border ${currentTheme?.border} 
                                     backdrop-blur-sm flex items-center justify-center`}
                      >
                        {!imageErrors[book.id] ? (
                          <img
                            src='/api/placeholder/160/224'
                            alt={book.title}
                            className='w-full h-full object-cover'
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [book.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <BookOpen className='w-12 h-12 text-gray-400 dark:text-gray-500' />
                        )}
                      </div>
                    </div>

                    {/* Book details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4'>
                        <h3 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3'>
                          {book.title}
                        </h3>
                        <div
                          className={`flex items-center gap-2 ${currentTheme?.buttonSecondary} backdrop-blur-sm 
                                       px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${currentTheme?.border}`}
                        >
                          <Star className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current' />
                          <span className='text-base sm:text-lg font-semibold'>
                            {(book.score * 10).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-base sm:text-lg ${currentTheme?.subtext} mb-2 sm:mb-4`}
                      >
                        <span className='font-medium'>{book.author}</span>
                      </p>

                      <p
                        className={`text-sm sm:text-base ${currentTheme?.subtext} mb-4 sm:mb-6 
                                   line-clamp-2 sm:line-clamp-3`}
                      >
                        {book.description}
                      </p>

                      {/* Tags */}
                      <div className='flex flex-wrap gap-2 sm:gap-3'>
                        {book.tags.split(' ').map((tag) => (
                          <span
                            key={tag}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full 
                                      ${currentTheme?.buttonSecondary} ${currentTheme?.hover} 
                                      border ${currentTheme?.border} backdrop-blur-sm transition-colors 
                                      duration-200 cursor-pointer`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator - Hidden on mobile */}
                <div className='hidden sm:flex items-center pr-6 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <ChevronRight
                    className={`w-6 h-6 ${currentTheme?.subtext}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookRecommendations;
