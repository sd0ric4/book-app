import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

// 扩展 RequestInit 类型
interface ExtendedRequestInit extends RequestInit {
  duplex?: 'half';
}

export async function loader({ request }: LoaderFunctionArgs) {
  const apiUrl = process.env.PROXY_TARGET || 'http://192.168.0.118:8080';
  const url = new URL(request.url);
  const targetUrl = `${apiUrl}${url.pathname.replace('/api', '')}${url.search}`;

  const options: ExtendedRequestInit = {
    headers: request.headers,
    method: request.method,
    duplex: 'half',
  };

  return fetch(targetUrl, options);
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.PROXY_TARGET || 'http://192.168.0.118:8080';
  const url = new URL(request.url);
  const targetUrl = `${apiUrl}${url.pathname.replace('/api', '')}${url.search}`;

  const options: ExtendedRequestInit = {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: 'half',
  };

  return fetch(targetUrl, options);
}
