export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  TOKEN_EXPIRY: 'tokenExpiry'
}

export const setToken = (accessToken, refreshToken, userData = null) => {
  try {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);

    if(refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }

    if(userData) {
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    }

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, payload.exp.toString());
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

export const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
export const getUserData = () => {
  const data = localStorage.getItem(TOKEN_KEYS.USER_DATA);
  return data? JSON.parse(data) : null;
}

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
};

export const getTokenExpiryTime = () => {
  const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  return expiry ? parseInt(expiry) : null;
};