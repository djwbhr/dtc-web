import axios from 'axios';

// Используем VITE_ префикс для переменных окружения в Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    filename: string;
    size: number;
  };
}

export interface FormData {
  [key: string]: string | number | boolean | File | null;
}

export const getUploadedFiles = async (): Promise<UploadResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/files`, {
      timeout: 5000,
      withCredentials: false,
    });

    if (!response.data.success || !Array.isArray(response.data.files)) {
      throw new Error('Некорректный ответ сервера');
    }

    return response.data.files.map((file: any) => ({
      success: true,
      message: 'Файл найден',
      data: {
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        size: file.size
      }
    }));
  } catch (error) {
    console.error('Ошибка при получении списка файлов:', error);
    return [];
  }
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    console.log('Начало загрузки файла:', file.name);
    console.log('API URL:', API_URL);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Добавляем таймаут
      timeout: 10000,
      // Отключаем credentials для локальной разработки
      withCredentials: false,
    });

    console.log('Ответ сервера:', response.data);

    // Проверяем структуру ответа
    if (!response.data.success || !response.data.data) {
      throw new Error('Некорректный ответ сервера');
    }

    return {
      success: true,
      message: response.data.message || 'Файл успешно загружен',
      data: {
        url: response.data.data.url,
        filename: response.data.data.filename,
        size: response.data.data.size
      }
    };
  } catch (error) {
    console.error('Подробная информация об ошибке:', {
      error,
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      response: axios.isAxiosError(error) ? {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      } : null,
    });

    let errorMessage = 'Произошла ошибка при загрузке файла';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Превышено время ожидания ответа от сервера';
      } else if (error.response) {
        errorMessage = `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте, запущен ли сервер';
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const deleteFile = async (filename: string): Promise<UploadResponse> => {
  try {
    console.log('Удаление файла:', filename);
    
    const response = await axios.delete(`${API_URL}/upload/${filename}`, {
      timeout: 5000,
      withCredentials: false,
    });

    return {
      success: true,
      message: 'Файл успешно удален',
      data: response.data,
    };
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    
    let errorMessage = 'Произошла ошибка при удалении файла';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Не удалось подключиться к серверу';
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const uploadMultipleFiles = async (files: File[]): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
};

export const uploadFormData = async (formData: FormData): Promise<UploadResponse> => {
  try {
    console.log('Отправка данных формы');
    console.log('API URL:', API_URL);

    const response = await axios.post(`${API_URL}/submit`, formData, {
      timeout: 10000,
      withCredentials: false,
    });

    console.log('Ответ сервера:', response.data);

    return {
      success: true,
      message: 'Данные успешно отправлены',
      data: response.data,
    };
  } catch (error) {
    console.error('Подробная информация об ошибке:', {
      error,
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      response: axios.isAxiosError(error) ? {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      } : null,
    });

    let errorMessage = 'Произошла ошибка при отправке данных';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Превышено время ожидания ответа от сервера';
      } else if (error.response) {
        errorMessage = `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету';
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}; 