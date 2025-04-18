import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { NewsArticle } from "../types/news";
import { useNewsStore } from "../store/newsStore";

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const { favorites, addToFavorites, removeFromFavorites } = useNewsStore();
  const isFavorite = favorites.some((fav) => fav.id === article.id);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(article.id);
    } else {
      addToFavorites(article);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={article.urlToImage || "https://via.placeholder.com/345x140"}
        alt={article.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {article.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {article.description}
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {new Date(article.publishedAt).toLocaleDateString()}
          </Typography>
          <IconButton onClick={handleFavoriteClick} size="small">
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
