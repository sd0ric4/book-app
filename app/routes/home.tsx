import { useEffect, useState } from 'react';
import { useTheme } from '../lib/theme/useTheme';
import { Book, Library, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

export function meta() {
  return [
    { title: 'Library Of Ruina' },
    { name: 'description', content: 'Welcome to Library Of Ruina' },
  ];
}

export function HomePage() {
  const { currentTheme, mounted } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    document.title = 'Library Of Ruina';
    // 添加一个小延迟来触发动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${currentTheme.background} ${currentTheme.text} transition-all duration-500`}
      role='main'
      aria-label='主页'
    >
      <div className='max-w-6xl mx-auto p-4 md:p-6 min-h-screen flex items-center justify-center'>
        {/* 添加主卡片容器 */}
        <div
          className={`${currentTheme.card} rounded-3xl p-8 md:p-12 shadow-xl 
            border ${
              currentTheme.border
            } w-full max-w-4xl transform transition-all 
            duration-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
        >
          <div
            className={`text-center mb-12 transition-all duration-700 delay-500 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-5'
            }`}
          >
            <Library className='mx-auto mb-6' size={64} />
            <h1 className='text-4xl font-bold mb-4'>
              欢迎来到 Library Of Ruina
            </h1>
            <p className={`text-lg ${currentTheme.subtext} mb-8`}>
              探索无尽的知识海洋，发现属于你的故事
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 gap-8 mb-12 transition-all duration-700 delay-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-5'
            }`}
          >
            <div
              className={`p-6 rounded-xl border ${currentTheme.border} text-center`}
            >
              <Book className='mx-auto mb-4' size={32} />
              <h2 className='text-xl font-semibold mb-2'>海量藏书</h2>
              <p className={`${currentTheme.subtext}`}>
                数万册精选图书，任你探索
              </p>
            </div>
            <div
              className={`p-6 rounded-xl border ${currentTheme.border} text-center`}
            >
              <Users className='mx-auto mb-4' size={32} />
              <h2 className='text-xl font-semibold mb-2'>读者社区</h2>
              <p className={`${currentTheme.subtext}`}>与书友分享阅读体验</p>
            </div>
          </div>

          <div
            className={`text-center transition-all duration-700 delay-900 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-5'
            }`}
          >
            <button
              onClick={() => navigate('/register')}
              className={`${currentTheme.activeButton} ${currentTheme.border} px-12 py-4 rounded-xl text-lg font-medium hover:scale-105 transition-transform`}
              aria-label='前往登录页面'
            >
              开始你的阅读之旅
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
