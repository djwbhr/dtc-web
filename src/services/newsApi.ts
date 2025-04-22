import axios from "axios";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

const API_URL = "http://192.168.1.161:3001/api/news"; // Замените на ваш IP-адрес

export const getNews = async (page: number, query: string = ""): Promise<NewsResponse> => {
  try {
    console.log(`Fetching news: page=${page}, query=${query}`);
    const response = await axios.get(API_URL, {
      params: {
        page,
        query,
      },
      timeout: 10000, // Увеличиваем таймаут
      validateStatus: (status) => status < 500, // Принимаем все статусы кроме 5xx
    });

    console.log('API Response:', {
      status: response.status,
      data: response.data
    });

    if (!response.data || !Array.isArray(response.data.articles)) {
      console.error('Invalid response format:', response.data);
      throw new Error("Invalid response format from API");
    }

    return {
      articles: response.data.articles.map((article: NewsArticle) => ({
        title: article.title || "Без заголовка",
        description: article.description || "Нет описания",
        url: article.url || "#",
        urlToImage: article.urlToImage || "https://via.placeholder.com/300x200",
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: {
          name: article.source?.name || "Неизвестный источник",
        },
      })),
      totalResults: response.data.totalResults || 0,
    };
  } catch (error) {
    console.error('News API Error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      if (error.code === "ECONNABORTED") {
        throw new Error("Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.");
      }
      if (error.code === "ERR_NETWORK") {
        throw new Error("Ошибка сети. Проверьте подключение к интернету и убедитесь, что прокси-сервер запущен.");
      }
      if (error.response?.status === 401) {
        throw new Error("Ошибка авторизации. Проверьте API ключ.");
      }
      if (error.response?.status === 429) {
        throw new Error("Превышен лимит запросов. Попробуйте позже.");
      }
      if (error.response?.data?.error) {
        throw new Error(`Ошибка сервера: ${error.response.data.error}`);
      }
    }
    throw new Error("Произошла ошибка при загрузке новостей");
  }
};
