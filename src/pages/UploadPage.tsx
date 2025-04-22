import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { FileUpload } from "../components/FileUpload";
import {
  UploadResponse,
  deleteFile,
  getUploadedFiles,
} from "../services/uploadService";

export const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const truncateFileName = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split(".").pop();
    const name = filename.substring(0, maxLength - 3);
    return `${name}...${extension ? `.${extension}` : ""}`;
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const files = await getUploadedFiles();
      setUploadedFiles(files);
      setError(null);
    } catch (error) {
      console.error("Error loading files:", error);
      setError("Ошибка при загрузке списка файлов");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (response: UploadResponse) => {
    if (!response.data) {
      setError("Ошибка при загрузке файла: нет данных о файле");
      return;
    }

    const fileResponse: UploadResponse = {
      success: true,
      message: response.message,
      data: {
        url: response.data.url,
        filename: response.data.filename,
        size: response.data.size,
      },
    };

    setUploadedFiles((prev) => [...prev, fileResponse]);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeleteFile = async (index: number) => {
    const file = uploadedFiles[index];
    if (!file.data?.filename) {
      console.error("File data:", file);
      setError("Не удалось удалить файл: имя файла не найдено");
      return;
    }

    try {
      const response = await deleteFile(file.data.filename);
      if (response.success) {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Произошла ошибка при удалении файла");
    }
  };

  const handleDownload = (filename: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const cleanBaseUrl = baseUrl.endsWith("/api")
      ? baseUrl.slice(0, -4)
      : baseUrl;

    const downloadUrl = `${cleanBaseUrl}/uploads/${filename}`;
    console.log("Download URL:", downloadUrl);

    // Открываем файл напрямую в новом окне/вкладке
    window.open(downloadUrl, "_blank");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Загрузка файлов
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Загрузите файлы
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Поддерживаются файлы изображений, PDF и документы. Максимальный размер
          файла: 5MB.
        </Typography>
        <FileUpload
          multiple={true}
          accept="image/*,.pdf,.doc,.docx"
          maxSize={5 * 1024 * 1024}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : uploadedFiles.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Загруженные файлы
          </Typography>
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() =>
                        file.data?.filename &&
                        handleDownload(file.data.filename)
                      }
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteFile(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  "& .MuiListItemText-primary": {
                    width: "100%",
                    maxWidth: "calc(100% - 120px)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link
                      component="span"
                      onClick={() =>
                        file.data?.filename &&
                        handleDownload(file.data.filename)
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      {truncateFileName(
                        file.data?.filename || `Файл ${index + 1}`
                      )}
                    </Link>
                  }
                  secondary={`Размер: ${((file.data?.size || 0) / 1024).toFixed(
                    2
                  )} KB`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          Нет загруженных файлов
        </Alert>
      )}
    </Box>
  );
};
