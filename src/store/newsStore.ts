import { create } from "zustand";
import { NewsArticle } from "../types/news";

interface NewsState {
  articles: NewsArticle[];
  sources: string[];
  favorites: NewsArticle[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  addToFavorites: (article: NewsArticle) => void;
  removeFromFavorites: (articleId: string) => void;
  toggleFavorite: (article: NewsArticle) => void;
  isFavorite: (article: NewsArticle) => boolean;
  setArticles: (articles: NewsArticle[], append?: boolean) => void;
  setSources: (sources: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  sources: [],
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
      favorites: state.favorites.filter((fav) => fav.id !== articleId),
    })),
  toggleFavorite: (article) => {
    const { favorites } = get();
    const isFav = favorites.some(fav => fav.url === article.url);
    
    if (isFav) {
      set({ favorites: favorites.filter(fav => fav.url !== article.url) });
    } else {
      set({ favorites: [...favorites, article] });
    }
  },
  isFavorite: (article) => {
    const { favorites } = get();
    return favorites.some(fav => fav.url === article.url);
  },
  setArticles: (articles, append = false) =>
    set((state) => ({
      articles: append ? [...state.articles, ...articles] : articles,
    })),
  setSources: (sources) => set({ sources }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
