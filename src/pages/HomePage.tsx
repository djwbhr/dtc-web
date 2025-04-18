import { useState, useEffect } from "react";
import { Container, Box, Typography, Alert } from "@mui/material";
import { NewsList } from "../components/NewsList";
import { SearchBar } from "../components/SearchBar";
import { useNewsStore } from "../store/newsStore";
import { getNews } from "../services/newsApi";

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { articles, setArticles, loading, setLoading, setError } =
    useNewsStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const response = await getNews(1, searchQuery || "technology");
        console.log("API Response:", response);
        setArticles(response.articles);
      } catch (error) {
        console.error("Error fetching news:", error);
        setErrorMessage(
          "Ошибка при загрузке новостей. Пожалуйста, попробуйте позже."
        );
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery, setArticles, setLoading, setError]);

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
            Новости технологий
          </Typography>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {!loading && !errorMessage && articles.length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Новости не найдены. Попробуйте изменить параметры поиска.
            </Alert>
          )}

          <NewsList articles={articles} loading={loading} />
        </Box>
      </Container>
    </Box>
  );
};
