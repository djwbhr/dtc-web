import { useRef, useCallback } from "react";
import { CircularProgress, Box } from "@mui/material";
import { NewsCard } from "./NewsCard";
import { NewsArticle } from "../types/news";

interface NewsListProps {
  articles: NewsArticle[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const NewsList = ({
  articles,
  loading,
  onLoadMore,
  hasMore,
}: NewsListProps) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastArticleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current && loading) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(5, 1fr)",
        },
        gap: 3,
        width: "100%",
      }}
    >
      {articles.map((article, index) => {
        const isLastArticle = index === articles.length - 1;
        return (
          <Box
            key={`${article.url}-${index}`}
            ref={isLastArticle ? lastArticleRef : null} // вот тут прикрепляем ref к последнему элементу
          >
            <NewsCard article={article} />
          </Box>
        );
      })}

      {loading && (
        <Box
          sx={{
            gridColumn: "1/-1",
            display: "flex",
            justifyContent: "center",
            py: 3,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};
