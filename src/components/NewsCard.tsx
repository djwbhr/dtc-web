import { memo } from "react";
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

export const NewsCard = memo(({ article }: NewsCardProps) => {
  const { favorites, addToFavorites, removeFromFavorites } = useNewsStore();
  const isFavorite = favorites.some((fav) => fav.id === article.id);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(article.id);
    } else {
      addToFavorites(article);
    }
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={article.urlToImage || "https://via.placeholder.com/400x200"}
        alt={article.title}
        loading="lazy"
        sx={{
          objectFit: "cover",
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 1,
            fontSize: "1.1rem",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {article.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {formattedDate}
          </Typography>
          <IconButton
            onClick={handleFavoriteClick}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
});
