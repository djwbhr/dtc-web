import { CircularProgress, Box } from "@mui/material";
import { NewsCard } from "./NewsCard";
import { NewsArticle } from "../types/news";

interface NewsListProps {
  articles: NewsArticle[];
  loading: boolean;
}

export const NewsList = ({ articles, loading }: NewsListProps) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {articles.map((article) => (
        <Box key={article.id}>
          <NewsCard article={article} />
        </Box>
      ))}
    </Box>
  );
};
