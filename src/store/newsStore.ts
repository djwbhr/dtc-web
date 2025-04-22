import { create } from "zustand";
import { NewsArticle } from "../types/news";

interface NewsStore {
  articles: NewsArticle[];
  favorites: NewsArticle[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  addToFavorites: (article: NewsArticle) => void;
  removeFromFavorites: (articleId: string) => void;
  setArticles: (articles: NewsArticle[], append?: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  articles: [],
  favorites: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  addToFavorites: (article) =>
    set((state) => ({
      favorites: [...state.favorites, article],
    })),
  removeFromFavorites: (articleId) =>
    set((state) => ({
      favorites: state.favorites.filter((article) => article.id !== articleId),
    })),
  setArticles: (articles, append = false) =>
    set((state) => ({
      articles: append ? [...state.articles, ...articles] : articles,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
