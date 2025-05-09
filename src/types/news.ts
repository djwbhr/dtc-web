export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  author: string;
  source: {
    name: string;
  };
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  status: string;
}
