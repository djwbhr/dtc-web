import { create } from "zustand";
import { NewsArticle } from "../types/news";

interface NewsStore {
  articles: NewsArticle[];
  favorites: NewsArticle[];
  loading: boolean;
  error: string | null;
  addToFavorites: (article: NewsArticle) => void;
  removeFromFavorites: (articleId: string) => void;
  setArticles: (articles: NewsArticle[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  articles: [],
  favorites: [],
  loading: false,
  error: null,
  addToFavorites: (article) =>
    set((state) => ({
      favorites: [...state.favorites, article],
    })),
  removeFromFavorites: (articleId) =>
    set((state) => ({
      favorites: state.favorites.filter((article) => article.id !== articleId),
    })),
  setArticles: (articles) => set({ articles }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
