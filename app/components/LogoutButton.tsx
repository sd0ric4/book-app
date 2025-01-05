import { LogOut } from 'lucide-react';
import { useRouteTransition } from '~/hooks/useRouteTransition';

interface LogoutButtonProps {
  currentThemeStyle: {
    text: string;
    button: string;
    activeButton: string;
    card: string;
    border: string;
    hover: string;
  };
}

const LogoutButton = ({ currentThemeStyle }: LogoutButtonProps) => {
  const navigateWithTransition = useRouteTransition();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // 清除 cookie
    document.cookie =
      'auth_token==; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // 跳转到登录页
    navigateWithTransition('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        p-2 rounded-lg 
        ${currentThemeStyle.button} 
        ${currentThemeStyle.text} 
        transition-colors duration-200
        flex items-center gap-2
      `}
      aria-label='退出登录'
    >
      <LogOut className='w-5 h-5' />
    </button>
  );
};

export default LogoutButton;
