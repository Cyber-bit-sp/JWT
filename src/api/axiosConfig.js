// Step 5.1: Create axios instance
import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired
} from '../utils/tokenUtils';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Step 5.2: Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Step 5.3: Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Step 5.4: Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if we have a refresh token
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Step 5.5: Refresh token
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken, user } = response.data;

      // Store new tokens
      setTokens(accessToken, newRefreshToken, user);

      // Process queued requests
      processQueue(null, accessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh failed - logout user
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = '/login?session=expired';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Step 5.6: API error handler
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    const errorMessages = {
      400: 'Bad request',
      401: 'Unauthorized. Please login again.',
      403: 'You do not have permission to access this resource.',
      404: 'Resource not found.',
      500: 'Server error. Please try again later.',
    };

    return {
      status,
      message: data?.message || errorMessages[status] || 'An error occurred',
      data: data
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'No response from server. Please check your connection.',
    };
  } else {
    return {
      status: -1,
      message: error.message || 'Request failed',
    };
  }
};

export default api;