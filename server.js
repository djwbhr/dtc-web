import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = 3001;

// Настройка CORS для React Native
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
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

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/news`);
}); 