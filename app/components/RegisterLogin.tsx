import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useTheme } from '../lib/theme/useTheme';
import { ThemeMenu } from '../components/ThemeMenu';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import '../styles/auth.css';

type FocusableElement = {
  id: string;
  ref:
    | React.RefObject<HTMLInputElement | null>
    | React.RefObject<HTMLButtonElement | null>;
  row: number;
  col: number;
};

export function AuthPage() {
  const { theme, setTheme, currentTheme, mounted } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  // Track currently focused element
  const [focusedElementId, setFocusedElementId] = useState<string>('');

  // Refs for all focusable elements
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const showPasswordRef = useRef<HTMLButtonElement>(null);

  // Define focusable elements grid
  const getFocusableElements = (): FocusableElement[] => {
    if (isLogin) {
      return [
        { id: 'email', ref: emailRef, row: 0, col: 0 },
        { id: 'password', ref: passwordRef, row: 1, col: 0 },
        { id: 'showPassword', ref: showPasswordRef, row: 1, col: 1 },
        { id: 'submit', ref: submitRef, row: 2, col: 0 },
        { id: 'toggle', ref: toggleRef, row: 3, col: 0 },
      ];
    } else {
      return [
        { id: 'username', ref: usernameRef, row: 0, col: 0 },
        { id: 'email', ref: emailRef, row: 1, col: 0 },
        { id: 'password', ref: passwordRef, row: 2, col: 0 },
        { id: 'showPassword', ref: showPasswordRef, row: 2, col: 1 },
        { id: 'submit', ref: submitRef, row: 3, col: 0 },
        { id: 'toggle', ref: toggleRef, row: 4, col: 0 },
      ];
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const elements = getFocusableElements();
      const currentElement = elements.find((el) => el.id === focusedElementId);

      if (!currentElement) return;

      const currentRow = currentElement.row;
      const currentCol = currentElement.col;

      let nextElement: FocusableElement | undefined;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow - 1 && el.col === currentCol
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow + 1 && el.col === currentCol
          );
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow && el.col === currentCol - 1
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextElement = elements.find(
            (el) => el.row === currentRow && el.col === currentCol + 1
          );
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (currentElement.id === 'showPassword') {
            setShowPassword(!showPassword);
          } else if (currentElement.id === 'toggle') {
            setIsLogin(!isLogin);
          } else if (currentElement.id === 'submit') {
            submitRef.current?.click();
          }
          break;
      }

      if (nextElement) {
        nextElement.ref.current?.focus();
        setFocusedElementId(nextElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedElementId, isLogin, showPassword]);

  // Update focus when switching modes
  useEffect(() => {
    const firstElement = getFocusableElements()[0];
    firstElement.ref.current?.focus();
    setFocusedElementId(firstElement.id);
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  // Track focus changes
  const handleFocus = (elementId: string) => {
    setFocusedElementId(elementId);
  };

  // Get focus indicator class
  const getFocusClass = (elementId: string) => {
    return focusedElementId === elementId ? 'ring-2 ring-blue-500' : '';
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${currentTheme.background} ${currentTheme.text} transition-all duration-500`}
      role='main'
      aria-label={isLogin ? '登录页面' : '注册页面'}
    >
      <div className='max-w-md mx-auto p-4 md:p-6'>
        <div className='flex justify-end mb-8'>
          <ThemeMenu
            theme={theme}
            setTheme={setTheme}
            currentThemeStyle={currentTheme}
          />
        </div>

        <div
          className={`${currentTheme.card} rounded-2xl p-6 md:p-8 shadow-lg border ${currentTheme.border}`}
        >
          <div className='title-container'>
            <h1
              className={`auth-title ${
                isLogin ? 'auth-text-visible' : 'auth-text-hidden'
              }`}
            >
              欢迎回来
            </h1>
            <h1
              className={`auth-title ${
                !isLogin ? 'auth-text-visible' : 'auth-text-hidden'
              }`}
            >
              创建账号
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='auth-form-container'>
              {!isLogin && (
                <div
                  className={`username-field ${
                    isLogin ? 'username-field-hidden' : 'username-field-visible'
                  }`}
                >
                  <div className={`input-icon ${currentTheme.subtext}`}>
                    <User size={20} />
                  </div>
                  <input
                    ref={usernameRef}
                    type='text'
                    name='username'
                    placeholder='用户名'
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => handleFocus('username')}
                    className={`auth-input ${currentTheme.card} ${
                      currentTheme.border
                    } ${getFocusClass('username')}`}
                    aria-label='用户名输入框'
                  />
                </div>
              )}

              <div className='input-field'>
                <div className={`input-icon ${currentTheme.subtext}`}>
                  <Mail size={20} />
                </div>
                <input
                  ref={emailRef}
                  type='email'
                  name='email'
                  placeholder='电子邮箱'
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  className={`auth-input ${currentTheme.card} ${
                    currentTheme.border
                  } ${getFocusClass('email')}`}
                  aria-label='邮箱输入框'
                />
              </div>

              <div className='input-field'>
                <div className={`input-icon ${currentTheme.subtext}`}>
                  <Lock size={20} />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='密码'
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  className={`auth-input password-input ${currentTheme.card} ${
                    currentTheme.border
                  } ${getFocusClass('password')}`}
                  aria-label='密码输入框'
                />
                <button
                  ref={showPasswordRef}
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  onFocus={() => handleFocus('showPassword')}
                  className={`password-toggle ${
                    currentTheme.subtext
                  } ${getFocusClass('showPassword')}`}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              ref={submitRef}
              type='submit'
              onFocus={() => handleFocus('submit')}
              className={`submit-button ${currentTheme.activeButton} ${
                currentTheme.border
              } ${getFocusClass('submit')}`}
              aria-label={isLogin ? '登录按钮' : '注册按钮'}
            >
              {isLogin ? '登录' : '注册'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <button
              ref={toggleRef}
              onClick={() => setIsLogin(!isLogin)}
              onFocus={() => handleFocus('toggle')}
              className={`auth-toggle-button ${
                currentTheme.subtext
              } ${getFocusClass('toggle')}`}
              aria-label={isLogin ? '切换到注册' : '切换到登录'}
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>

          <div className='mt-4 text-center text-xs text-gray-500'>
            <p>使用方向键导航，空格或回车键确认</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
