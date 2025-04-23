import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = 3001;

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку для загрузок, если её нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Инициализация Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Make sure FIREBASE_SERVICE_ACCOUNT is properly formatted in .env file');
}

// Хранилище FCM токенов
const deviceTokens = new Set();

// Добавляем переменные для отслеживания последних новостей
let lastNewsCheckTime = parseInt(process.env.LAST_NEWS_CHECK_TIME) || 0;
let lastNewsId = null;

// Кэш для новостей
const newsCache = {
  data: null,
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5 минут в миллисекундах
};

// Настройка CORS для React Native
app.use(cors({
  origin: '*',  // Разрешаем запросы с любых источников
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Увеличиваем лимит для загрузки файлов
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Middleware для логирования запросов
app.use((req, res, next) => {
  // Логируем только основную информацию о запросе
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Роут для загрузки файлов
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      console.log('No file received');
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

// Роут для регистрации FCM токена
app.post('/api/notifications/register', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    deviceTokens.add(token);
    console.log('Device token registered:', token);

    res.json({
      success: true,
      message: 'Token registered successfully'
    });
  } catch (error) {
    console.error('Token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register token'
    });
  }
});

// Функция для отправки уведомлений
const sendNotifications = async (title, body, data = {}) => {
  if (deviceTokens.size === 0) {
    console.log('No registered devices');
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens: Array.from(deviceTokens)
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log('Notifications sent successfully:', response);
    
    // Удаляем недействительные токены
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = Array.from(deviceTokens)[idx];
          console.log('Removing failed token:', failedToken);
          deviceTokens.delete(failedToken);
        }
      });
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

// Функция для проверки новых новостей
const checkForNewNews = async () => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology',
        language: 'ru',
        sortBy: 'publishedAt',
        pageSize: 1, // Получаем только самую свежую новость
        apiKey: process.env.VITE_NEWS_API_KEY
      }
    });

    const latestArticle = response.data.articles[0];
    if (!latestArticle) return;

    // Создаем уникальный идентификатор для статьи
    const articleId = latestArticle.url;

    // Проверяем, является ли статья новой
    if (articleId !== lastNewsId) {
      lastNewsId = articleId;
      
      // Отправляем уведомление только если это не первый запуск
      if (lastNewsCheckTime !== 0) {
        await sendNotifications(
          'Новая статья',
          latestArticle.title,
          {
            articleUrl: latestArticle.url,
            publishedAt: latestArticle.publishedAt
          }
        );
      }
    }

    lastNewsCheckTime = Date.now();
    
    // Сохраняем время последней проверки в файл .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedContent = envContent.replace(
      /LAST_NEWS_CHECK_TIME=\d+/,
      `LAST_NEWS_CHECK_TIME=${lastNewsCheckTime}`
    );
    fs.writeFileSync('.env', updatedContent);

  } catch (error) {
    console.error('Error checking for new news:', error);
  }
};

// Запускаем первичную проверку новостей
checkForNewNews();

// Устанавливаем интервал проверки новостей (5 минут)
const newsCheckInterval = parseInt(process.env.NEWS_CHECK_INTERVAL) || 300000;
setInterval(checkForNewNews, newsCheckInterval);

// Прокси для новостей
app.get('/api/news', async (req, res) => {
  try {
    const { page, query } = req.query;
    const cacheKey = `${query || 'technology'}-${page || 1}`;
    
    // Проверяем кэш
    const now = Date.now();
    if (newsCache.data && 
        newsCache.timestamp + newsCache.CACHE_DURATION > now && 
        newsCache.key === cacheKey) {
      console.log('Returning cached news data');
      return res.json(newsCache.data);
    }

    // Проверяем наличие API ключа
    if (!process.env.VITE_NEWS_API_KEY) {
      throw new Error('News API key is not configured');
    }

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

    // Проверяем статус ответа
    if (response.status !== 200) {
      throw new Error(`News API returned status ${response.status}`);
    }

    // Проверяем наличие данных
    if (!response.data || !response.data.articles) {
      throw new Error('Invalid response format from News API');
    }

    // Обновляем кэш
    newsCache.data = response.data;
    newsCache.timestamp = now;
    newsCache.key = cacheKey;

    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.message);
    
    // Если есть кэшированные данные и произошла ошибка 429, возвращаем кэш
    if (error.response?.status === 429 && newsCache.data) {
      console.log('Rate limit exceeded, returning cached data');
      return res.json(newsCache.data);
    }
    
    // Определяем тип ошибки и отправляем соответствующий статус
    if (error.response) {
      // Ошибка от News API
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      if (status === 429) {
        // Too Many Requests
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Please try again later',
          details: message
        });
      } else if (status === 401) {
        // Unauthorized
        res.status(401).json({
          error: 'Invalid API key',
          message: 'News API key is invalid or expired',
          details: message
        });
      } else {
        // Другие ошибки от API
        res.status(status).json({
          error: 'News API error',
          message: message,
          details: error.response.data
        });
      }
    } else if (error.request) {
      // Ошибка сети
      res.status(503).json({
        error: 'Network error',
        message: 'Could not connect to News API',
        details: error.message
      });
    } else {
      // Другие ошибки
      res.status(500).json({
        error: 'Server error',
        message: 'Failed to fetch news',
        details: error.message
      });
    }
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

// Настройка статических файлов с заголовками для скачивания
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadDir, req.path);
  
  // Проверяем существование файла
  if (fs.existsSync(filePath)) {
    // Устанавливаем заголовки для скачивания
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  next();
}, express.static(uploadDir));

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
}); 