import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse } from '@/types'
import { API_CONFIG, ENV_INFO } from '@/config'

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  if (ENV_INFO.isDevelopment) {
    console.log('API Configuration:', {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      environment: ENV_INFO.mode,
    })
  }

  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
  });

  // Request interceptor for auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();

// Generic API methods

export const apiService = {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, config);
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as T;
  },

  // GET request with pagination
  async getPaginated<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await api.get<ApiResponse<PaginatedResponse<T>>>(url, { params });
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as PaginatedResponse<T>;
  },

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as T;
  },

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as T;
  },

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as T;
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url, config);
    // Extract data from the API response wrapper
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data as unknown as T;
  },

  // Upload file
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post<T>(url, formData, config);
    return response.data;
  },

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length > 0) {
    return error.response.data.errors.join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Request cancellation utility
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Check if error is cancellation
export const isCancel = (error: any): boolean => {
  return axios.isCancel(error);
};

export default apiService;
