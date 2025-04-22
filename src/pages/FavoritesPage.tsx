import { Container, Typography, Box } from "@mui/material";
import { useNewsStore } from "../store/newsStore";
import { NewsList } from "../components/NewsList";

export const FavoritesPage = () => {
  const { favorites } = useNewsStore();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Избранные новости
        </Typography>
        {favorites.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            У вас пока нет избранных новостей
          </Typography>
        ) : (
          <NewsList
            articles={favorites}
            loading={false}
            onLoadMore={() => {}}
            hasMore={false}
          />
        )}
      </Box>
    </Container>
  );
};
