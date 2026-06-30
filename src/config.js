// Step 11.2: Configuration
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  tokenRefreshInterval: parseInt(process.env.REACT_APP_TOKEN_REFRESH_INTERVAL) || 2700000,
  idleTimeout: parseInt(process.env.REACT_APP_IDLE_TIMEOUT) || 1800000,
  isDevelopment: process.env.REACT_APP_ENV === 'development',
};

export default config;