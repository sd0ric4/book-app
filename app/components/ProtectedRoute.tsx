import { Outlet, Navigate, redirect, useLoaderData } from 'react-router';
import { checkAuth } from '~/services/users/auth';

// protected/layout.tsx
export function loader({ request }: { request: Request }) {
  if (!checkAuth(request)) {
    return redirect('/register');
  }
  return { auth: true };
}

export default function ProtectedLayout() {
  const { auth } = useLoaderData<typeof loader>();
  if (!auth) {
    return <Navigate to='/register' replace />;
  }
  return <Outlet />;
}
