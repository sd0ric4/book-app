import axios from 'axios';
import type { BookReviewData } from '~/types/review';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

interface SummaryRequest {
  book_title: string;
  author: string;
}

interface SummaryResponse {
  summary: BookReviewData;
}

export const getSummaryByTitle = async (
  params: SummaryRequest
): Promise<SummaryResponse> => {
  try {
    const response = await api.post<SummaryResponse>(
      '/books/summarize',
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch book summary'
      );
    }
    throw error;
  }
};
