import { Outlet, redirect } from 'react-router';
import { checkAuth } from '~/services/users/auth';

export function loader({ request }: { request: Request }) {
  if (checkAuth(request)) {
    return redirect('/books/shelf');
  }
  return null;
}
export default function LoginCheck() {
  return <Outlet />;
}
