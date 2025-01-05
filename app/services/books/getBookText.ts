import axios from 'axios';
interface TextResponse {
  text: string;
}
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getText = async (): Promise<TextResponse> => {
  try {
    const response = await api.get<TextResponse>(`/text`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
    throw error;
  }
};
