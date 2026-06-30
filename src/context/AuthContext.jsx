// Step 3.1: Create Auth Context
import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  getUserData,
  setTokens,
  clearTokens,
  isAuthenticated,
  isTokenExpired
} from '../utils/tokenUtils';

// Create context
export const AuthContext = createContext(null);

// Step 3.2: Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Step 3.3: Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const token = getAccessToken();
      const refresh = getRefreshToken();
      const userData = getUserData();

      if (token && !isTokenExpired(token)) {
        setAccessToken(token);
        setRefreshToken(refresh);
        setUser(userData);
      } else if (token && isTokenExpired(token)) {
        // Token expired, try to refresh
        refreshTokens();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Step 3.4: Refresh tokens function
  const refreshTokens = useCallback(async () => {
    try {
      const refresh = getRefreshToken();
      if (!refresh) {
        throw new Error('No refresh token');
      }

      // This will be implemented in Step 5
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken, user } = data;

      setTokens(accessToken, newRefreshToken, user);
      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3.5: Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      
      // API call to login
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken, user } = data;

      // Store tokens
      setTokens(accessToken, newRefreshToken, user);
      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3.6: Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API to invalidate token on server
      const refresh = getRefreshToken();
      if (refresh) {
        await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh })
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API response
      clearTokens();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setLoading(false);
    }
  }, []);

  // Step 3.7: Context value
  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!user && accessToken && !isTokenExpired(accessToken),
    login,
    logout,
    refreshTokens,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};