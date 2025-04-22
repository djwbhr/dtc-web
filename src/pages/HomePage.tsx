import { useState, useEffect, useCallback } from "react";
import { Container, Box, Typography, Alert, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { NewsList } from "../components/NewsList";
import { SearchBar } from "../components/SearchBar";
import { useNewsStore } from "../store/newsStore";
import { getNews } from "../services/newsApi";

const MAX_RESULTS = 100; // Максимальное количество результатов
const PAGE_SIZE = 10; // Статей на странице

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    articles,
    setArticles,
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

        setArticles(response.articles, !isNewSearch);

        // Проверяем, есть ли еще статьи для загрузки
        const totalLoaded = page * PAGE_SIZE;
        const hasMoreItems =
          response.articles.length === PAGE_SIZE &&
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
    [searchQuery, setArticles, setLoading, setHasMore, setCurrentPage]
  );

  // Начальная загрузка
  useEffect(() => {
    fetchNews(1, true);
  }, [searchQuery]);

  // Функция для загрузки следующей страницы
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && currentPage * PAGE_SIZE < MAX_RESULTS) {
      fetchNews(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, fetchNews]);

  const handleRetry = () => {
    fetchNews(1, true);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        margin: 0,
        padding: 0,
      }}
    >
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          p: 0,
        }}
      >
        <Box sx={{ width: "100%", p: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              py: 3,
              textAlign: "center",
              bgcolor: "white",
              borderBottom: "1px solid #eaeaea",
            }}
          >
            Новости технологий
          </Typography>

          <Box sx={{ maxWidth: 800, mx: "auto", my: 3, px: 2 }}>
            <SearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
            />
          </Box>

          {errorMessage && (
            <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
              <Alert
                severity="error"
                sx={{ mb: 3 }}
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
            <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Новости не найдены. Попробуйте изменить параметры поиска.
              </Alert>
            </Box>
          )}

          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
            <NewsList
              articles={articles}
              loading={loading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </Box>
          {articles.length >= MAX_RESULTS && (
            <Box sx={{ maxWidth: 800, mx: "auto", px: 2, mt: 3 }}>
              <Alert severity="info">
                Достигнут лимит отображаемых новостей (100). Попробуйте уточнить
                поисковый запрос.
              </Alert>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
