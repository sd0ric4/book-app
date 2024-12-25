import axios from 'axios';
import type { loginRequest, registerRequest } from '~/types/users';

const api = axios.create({
  baseURL: '/api',
});

interface errorResponse {
  error: string;
}

interface successResponse {
  message: string;
}

export const registerUser = async (
  data: registerRequest
): Promise<successResponse | errorResponse> => {
  try {
    console.log('Registering user with data:', data); // 添加日志
    const response = await api.post('/users/register', data);
    return { message: response.data.message };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.error || 'Failed to register user',
      };
    }
    return { error: 'Failed to register user' };
  }
};

export const loginUser = async (data: loginRequest) => {
  try {
    const response = await api.post('/users/login', data);
    if (response.data.token) {
      document.cookie = `auth_token=${response.data.token};path=/`;
    }
    return { message: response.data.message };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Failed to login' };
    }
    return { error: 'Failed to login' };
  }
};

export function checkAuth(request: Request) {
  // 从 cookie 中读取 token
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie
    .split(';')
    .find((c) => c.trim().startsWith('auth_token='));
  return !!token;
}
