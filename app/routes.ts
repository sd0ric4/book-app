import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('register', './components/RegisterLogin.tsx'),
  route('books/info/:id', './components/BookDetails.tsx'),
] satisfies RouteConfig;
