import axios from 'axios';
import type { Book } from '~/types/book';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getBookInfo = async (id: number): Promise<Book> => {
  try {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
    throw error;
  }
};

export const getBookList = async (): Promise<Book[]> => {
  try {
    const response = await api.get<Book[]>('/books/list');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
    throw error;
  }
};
