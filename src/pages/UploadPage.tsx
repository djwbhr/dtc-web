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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
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
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  "& .MuiListItemText-primary": {
                    width: "100%",
                    maxWidth: "calc(100% - 80px)", // Оставляем место для кнопки
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={truncateFileName(
                    file.data?.filename || `Файл ${index + 1}`
                  )}
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
