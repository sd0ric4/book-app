import axios from 'axios';
import type { loginRequest, registerRequest } from '~/types/users';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

export const loginUser = async (
  data: loginRequest
): Promise<successResponse | errorResponse> => {
  try {
    const response = await api.post('/users/login', data);
    return { message: response.data.message };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Failed to login user' };
    }
    return { error: 'Failed to login user' };
  }
};
