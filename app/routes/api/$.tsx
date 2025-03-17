import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const apiUrl = process.env.PROXY_TARGET || 'http://192.168.0.118:8080';
  const url = new URL(request.url);
  const targetUrl = `${apiUrl}${url.pathname.replace('/api', '')}${url.search}`;

  return fetch(targetUrl, {
    headers: request.headers,
    method: request.method,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.PROXY_TARGET || 'http://192.168.0.118:8080';
  const url = new URL(request.url);
  const targetUrl = `${apiUrl}${url.pathname.replace('/api', '')}${url.search}`;

  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
