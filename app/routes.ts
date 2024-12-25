import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  layout('./components/LoginCheck.tsx', [
    route('register', './components/RegisterLogin.tsx'),
  ]),
  layout('./components/ProtectedRoute.tsx', [
    route('books/recommendations', './components/RecommendationList.tsx'),
    route('books/shelf', './components/Bookshelf.tsx'),
    route('books/info/:id', './components/BookDetails.tsx'),
    route('books/view/demo', './components/BookViewerDemo.tsx'),
  ]),
  route('test', './components/TestPage.tsx'),
] satisfies RouteConfig;
