import axios from "axios";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";
const MAX_RESULTS = 100; // Максимальное количество результатов от API
const PAGE_SIZE = 10; // Количество статей на странице

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

if (!API_KEY) {
  console.error('API key is missing! Make sure VITE_NEWS_API_KEY is set in your .env file');
}

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  id?: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
  message?: string;
}

export const getNews = async (page: number, query?: string) => {
  try {
    // Проверяем, не превысим ли мы лимит
    if ((page - 1) * PAGE_SIZE >= MAX_RESULTS) {
      return {
        status: 'ok',
        totalResults: MAX_RESULTS,
        articles: [],
      };
    }

    const response = await axios.get<NewsResponse>(`${BASE_URL}/everything`, {
      params: {
        language: 'ru',
        q: query || "technology",
        page,
        pageSize: PAGE_SIZE,
        apiKey: API_KEY,
      },
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    if (!response?.data) {
      throw new Error('No data received from API');
    }

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Failed to fetch news');
    }

    if (!response.data.articles || !Array.isArray(response.data.articles)) {
      throw new Error('Invalid articles data received');
    }

    const articles = response.data.articles.map((article: NewsArticle, index: number) => ({
      ...article,
      id: article.id || `${Date.now()}-${page}-${index}`,
      description: article.description || 'Описание отсутствует',
      urlToImage: article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image',
      author: article.author || 'Автор не указан',
    }));

    return {
      ...response.data,
      articles,
      totalResults: Math.min(response.data.totalResults, MAX_RESULTS), // Ограничиваем общее количество результатов
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: сервер не отвечает, попробуйте позже');
      }
      if (error.response?.status === 401) {
        throw new Error('Ошибка авторизации: проверьте API ключ');
      }
      if (error.response?.status === 429) {
        throw new Error('Превышен лимит запросов к API');
      }
      throw new Error(`Ошибка сети: ${error.message}`);
    }
    throw error;
  }
};
