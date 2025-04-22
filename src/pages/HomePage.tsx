import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { NewsList } from "../components/NewsList";
import { SearchBar } from "../components/SearchBar";
import { useNewsStore } from "../store/newsStore";
import { getNews } from "../services/newsApi";

const MAX_RESULTS = 100; // Максимальное количество результатов
const PAGE_SIZE = 10; // Статей на странице

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    source: "",
  });
  const {
    articles,
    setArticles,
    sources,
    setSources,
    loading,
    setLoading,
    hasMore,
    setHasMore,
    currentPage,
    setCurrentPage,
  } = useNewsStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNews = useCallback(
    async (page: number, isNewSearch = false) => {
      try {
        // Проверяем, не достигли ли мы лимита
        if ((page - 1) * PAGE_SIZE >= MAX_RESULTS) {
          setHasMore(false);
          return;
        }

        setLoading(true);
        setErrorMessage(null);
        const response = await getNews(page, searchQuery);

        // Обновляем список источников
        const uniqueSources = Array.from(
          new Set(response.articles.map((article) => article.source.name))
        ).sort();
        setSources(uniqueSources);

        // Применяем фильтры к полученным статьям
        let filteredArticles = response.articles;
        if (filters.source) {
          filteredArticles = filteredArticles.filter(
            (article) => article.source.name === filters.source
          );
        }
        if (filters.dateFrom) {
          filteredArticles = filteredArticles.filter(
            (article) => new Date(article.publishedAt) >= filters.dateFrom!
          );
        }
        if (filters.dateTo) {
          filteredArticles = filteredArticles.filter(
            (article) => new Date(article.publishedAt) <= filters.dateTo!
          );
        }

        setArticles(filteredArticles, !isNewSearch);

        // Проверяем, есть ли еще статьи для загрузки
        const totalLoaded = page * PAGE_SIZE;
        const hasMoreItems =
          filteredArticles.length === PAGE_SIZE &&
          totalLoaded < Math.min(response.totalResults, MAX_RESULTS);
        setHasMore(hasMoreItems);

        if (isNewSearch) {
          setCurrentPage(1);
        } else {
          setCurrentPage(page);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Произошла неизвестная ошибка";
        setErrorMessage(message);
        if (isNewSearch) {
          setArticles([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      setArticles,
      setSources,
      setLoading,
      setHasMore,
      setCurrentPage,
      filters,
    ]
  );

  // Начальная загрузка
  useEffect(() => {
    fetchNews(1, true);
  }, [searchQuery, filters, fetchNews]);

  // Функция для загрузки следующей страницы
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && currentPage * PAGE_SIZE < MAX_RESULTS) {
      fetchNews(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, fetchNews]);

  const handleRetry = () => {
    fetchNews(1, true);
  };

  const handleFilterChange = (newFilters: {
    dateFrom?: Date | null;
    dateTo?: Date | null;
    source?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        sx={{ mt: 2, mb: 3 }}
      >
        Новости
      </Typography>

      <Box sx={{ maxWidth: 800, mx: "auto", mb: 3 }}>
        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          onFilterChange={handleFilterChange}
          sources={sources}
        />
      </Box>

      {errorMessage && (
        <Box sx={{ maxWidth: 800, mx: "auto", mb: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
              >
                Повторить
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        </Box>
      )}

      {!loading && !errorMessage && articles.length === 0 && (
        <Box sx={{ maxWidth: 800, mx: "auto", mb: 3 }}>
          <Alert severity="info">
            Новости не найдены. Попробуйте изменить параметры поиска.
          </Alert>
        </Box>
      )}

      <NewsList
        articles={articles}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {articles.length >= MAX_RESULTS && (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
          <Alert severity="info">
            Достигнут лимит отображаемых новостей (100). Попробуйте уточнить
            поисковый запрос.
          </Alert>
        </Box>
      )}
    </Box>
  );
};
