import { useState } from 'react';
import {
  Book,
  Bookmark,
  Users,
  BookOpen,
  Lock,
  ChevronDown,
} from 'lucide-react';
import type { BookReviewProps, Character } from '~/types/review';

export default function BookReview({ summary, currentTheme }: BookReviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`max-w-2xl mx-auto cursor-pointer transition-all duration-500 ${
        isExpanded ? 'scale-100' : 'scale-95'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* 未展开状态的预览 */}
      <div
        className={`${isExpanded ? 'hidden' : 'block'} ${
          currentTheme.card
        } backdrop-blur-sm rounded-2xl border ${
          currentTheme.border
        } shadow-lg overflow-hidden`}
      >
        <div className='p-6 relative'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='flex flex-col items-center'>
              <Lock className={`w-6 h-6 ${currentTheme.subtext} mb-2`} />
              <span className={`text-sm ${currentTheme.subtext}`}>
                点击查看详情
              </span>
            </div>
          </div>
          <div className='opacity-40'>
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-2`}>
              {summary.title}
            </h3>
            <p className={currentTheme.subtext}>{summary.author}</p>
          </div>
        </div>
      </div>
      {/* 展开后的完整内容 */}
      <div
        className={`${!isExpanded ? 'hidden' : 'block'} overflow-hidden ${
          currentTheme.card
        } rounded-2xl border ${currentTheme.border} shadow-xl`}
      >
        {/* 顶部区域 */}
        <div
          className={`relative overflow-hidden p-6 border-b ${currentTheme.border}`}
        >
          <div
            className={`absolute top-4 right-4 w-20 h-20 ${currentTheme.subtext} opacity-10`}
          >
            <Book className='w-full h-full' />
          </div>
          <div className='flex items-center gap-3 mb-2'>
            <Bookmark className='w-5 h-5 text-blue-500' />
            <h3 className={`text-xl font-bold ${currentTheme.text}`}>
              {summary.title}
            </h3>
          </div>
          <p className={`text-base ${currentTheme.subtext} pl-8`}>
            {summary.author}
          </p>
        </div>

        {/* 主要人物列表 */}
        <div
          className={`p-6 ${currentTheme.card} border-b ${currentTheme.border}`}
        >
          <div
            className={`flex items-center gap-3 text-lg font-bold ${currentTheme.text} mb-4`}
          >
            <Users className={'w-5 h-5 text-blue-500'} />
            <h4>主要人物</h4>
          </div>
          <div className='grid gap-3'>
            {summary.characters.map((character: Character, index: number) => (
              <div
                key={index}
                className={`flex gap-3 items-start p-3 rounded-xl ${currentTheme.hover}`}
              >
                <div className='flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-blue-500 opacity-60'></div>
                <div className='flex-1'>
                  <span
                    className={`inline-block font-semibold ${currentTheme.text} mb-0.5`}
                  >
                    {character.name}
                  </span>
                  <p
                    className={`${currentTheme.subtext} text-sm leading-relaxed`}
                  >
                    {character.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 内容概述 */}
        <div className={`p-6 ${currentTheme.card}`}>
          <div
            className={`flex items-center gap-3 text-lg font-bold ${currentTheme.text} mb-4`}
          >
            <BookOpen className='w-5 h-5 text-blue-500' />
            <h4>内容概述</h4>
          </div>
          <div className='relative'>
            <p className={`${currentTheme.subtext} leading-relaxed`}>
              {summary.synopsis}
            </p>
          </div>
        </div>

        {/* 收起按钮 */}
        <div
          className={`p-4 ${currentTheme.card} border-t ${currentTheme.border}`}
        >
          <div
            className={`flex items-center justify-center ${currentTheme.subtext} gap-1`}
          >
            <ChevronDown className='w-4 h-4' />
            <span className='text-sm'>点击收起</span>
          </div>
        </div>
      </div>
    </div>
  );
}
