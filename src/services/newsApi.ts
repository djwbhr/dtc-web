import axios from "axios";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

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
    console.log('Fetching news with params:', { page, query });
    
    const response = await axios.get<NewsResponse>(`${BASE_URL}/top-headlines`, {
      params: {
        country: 'ru',
        category: 'technology',
        page,
        pageSize: 12,
        apiKey: API_KEY,
      },
    });

    console.log('API Response:', {
      status: response.data.status,
      totalResults: response.data.totalResults,
      articlesCount: response.data.articles?.length || 0
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Failed to fetch news');
    }

    const articles = response.data.articles.map((article: NewsArticle, index: number) => ({
      ...article,
      id: article.id || `${Date.now()}-${index}`,
    }));

    return {
      ...response.data,
      articles,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
