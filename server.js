import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = 3001;

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка CORS для React Native
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Создаем папку для загрузок, если её нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Прокси для новостей
app.get('/api/news', async (req, res) => {
  try {
    console.log('News API request params:', req.query);
    const { page, query } = req.query;
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query || 'technology',
        language: 'ru',
        sortBy: 'publishedAt',
        pageSize: 10,
        page: page || 1,
        apiKey: process.env.VITE_NEWS_API_KEY
      },
      timeout: 10000
    });
    
    console.log('News API response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.message 
    });
  }
});

// Роут для загрузки файлов
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Файл не был загружен' 
      });
    }

    console.log('File uploaded:', {
      filename: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    res.json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке файла',
      error: error.message
    });
  }
});

// Роут для удаления файлов
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    console.log('Attempting to delete file:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Файл не найден'
      });
    }

    fs.unlinkSync(filePath);
    console.log('File deleted successfully');

    res.json({
      success: true,
      message: 'Файл успешно удален'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении файла',
      error: error.message
    });
  }
});

// Роут для получения списка файлов
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir)
      .filter(file => {
        const filePath = path.join(uploadDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size
        };
      });

    res.json({
      success: true,
      message: 'Список файлов получен',
      files
    });
  } catch (error) {
    console.error('Error getting files list:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка файлов',
      error: error.message
    });
  }
});

// Роут для статических файлов
app.use('/uploads', express.static(uploadDir));

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/news`);
  console.log(`- POST http://localhost:${PORT}/api/upload`);
  console.log(`- DELETE http://localhost:${PORT}/api/upload/:filename`);
  console.log(`- GET http://localhost:${PORT}/uploads/:filename`);
  console.log(`- GET http://localhost:${PORT}/api/files`);
}); 