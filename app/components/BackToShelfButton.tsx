import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useRouteTransition } from '~/hooks/useRouteTransition';
interface BackButtonProps {
  currentThemeStyle: {
    text: string;
    button: string;
    activeButton: string;
    card: string;
    border: string;
    hover: string;
  };
}

const BackButton = ({ currentThemeStyle }: BackButtonProps) => {
  const navigateWithTransition = useRouteTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition(`/books/shelf`);
  };
  return (
    <Link
      to='/books/shelf'
      onClick={handleClick}
      className={`
        p-2 rounded-lg 
        ${currentThemeStyle.button} 
        ${currentThemeStyle.text} 
        transition-colors duration-200
        flex items-center gap-2
      `}
      aria-label='返回书架'
    >
      <ArrowLeft className='w-5 h-5' />
    </Link>
  );
};

export default BackButton;
