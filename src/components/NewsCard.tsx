import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Button,
  CardActions,
} from "@mui/material";
import { Favorite as FavoriteIcon, FavoriteBorder } from "@mui/icons-material";
import { useNewsStore } from "../store/newsStore";
import { NewsArticle } from "../types/news";

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useNewsStore();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(article);
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "transform 0.2s ease-in-out",
        transform: isHovered ? "translateY(-4px)" : "none",
        boxShadow: isHovered
          ? "0 8px 16px rgba(0,0,0,0.2)"
          : "0 2px 4px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={article.urlToImage}
          alt={article.title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease-in-out",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          }}
          onClick={handleFavoriteClick}
        >
          {isFavorite(article) ? (
            <FavoriteIcon
              sx={{
                color: "red",
                transition: "color 0.2s ease-in-out",
              }}
            />
          ) : (
            <FavoriteBorder
              sx={{
                color: "gray",
                transition: "color 0.2s ease-in-out",
              }}
            />
          )}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {article.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
            {article.source.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(article.publishedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Читать далее
        </Button>
      </CardActions>
    </Card>
  );
};
