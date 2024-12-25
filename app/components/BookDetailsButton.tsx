import { Info } from 'lucide-react';
import { Link } from 'react-router';
import { useRouteTransition } from '~/hooks/useRouteTransition';

interface BookDetailButtonProps {
  bookId: number;
  currentTheme: {
    button: string;
    buttonText: string;
  };
}

const BookDetailButton = ({ bookId, currentTheme }: BookDetailButtonProps) => {
  const navigateWithTransition = useRouteTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition(`/books/info/${bookId}`);
  };

  return (
    <Link
      to={`/books/info/${bookId}`}
      onClick={handleClick}
      className={`
        ${currentTheme.button} 
        ${currentTheme.buttonText}
        px-4 py-2 rounded-full
        transform translate-y-4 group-hover:translate-y-0 
        transition-all duration-300 
        flex items-center gap-2
        shadow-lg hover:shadow-xl
      `}
    >
      <Info className='w-4 h-4' />
      查看详情
    </Link>
  );
};
export default BookDetailButton;
