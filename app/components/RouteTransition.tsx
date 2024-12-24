import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function RouteTransition({ children }: Props) {
  return (
    <div className='transition-opacity duration-300 ease-in-out'>
      {children}
    </div>
  );
}
