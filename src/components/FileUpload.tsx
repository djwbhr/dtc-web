import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import {
  uploadFile,
  uploadMultipleFiles,
  UploadResponse,
} from "../services/uploadService";

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // в байтах
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: string) => void;
}

export const FileUpload = ({
  multiple = false,
  accept = "*",
  maxSize = 5 * 1024 * 1024, // 5MB по умолчанию
  onUploadSuccess,
  onUploadError,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(
        `Файл слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`
      );
      return false;
    }
    return true;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);

      // Проверяем все файлы перед загрузкой
      for (const file of fileArray) {
        if (!validateFile(file)) {
          setIsUploading(false);
          return;
        }
      }

      const responses = multiple
        ? await uploadMultipleFiles(fileArray)
        : [await uploadFile(fileArray[0])];

      responses.forEach((response) => {
        if (response.success) {
          onUploadSuccess?.(response);
        } else {
          setError(response.message);
          onUploadError?.(response.message);
        }
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке";
      setError(message);
      onUploadError?.(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  return (
    <Box
      sx={{
        border: "2px dashed",
        borderColor: isDragging ? "primary.main" : "grey.300",
        borderRadius: 1,
        p: 3,
        textAlign: "center",
        backgroundColor: isDragging ? "action.hover" : "background.paper",
        transition: "all 0.2s",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleUpload(e.target.files)}
        style={{ display: "none" }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          component="span"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? "Загрузка..." : "Выберите файл"}
        </Button>
      </label>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        или перетащите файл сюда
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {isUploading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};
