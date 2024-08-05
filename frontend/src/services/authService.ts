// src/services/authService.ts

export const getStoredToken = () => {
    return localStorage.getItem('token');
  };
  
  export const getStoredRefreshToken = () => {
    return localStorage.getItem('refreshToken');
  };
  
  export const decodeToken = (token: string) => {
    return JSON.parse(atob(token.split('.')[1]));
  };
  
  export const refreshAccessToken = async (refreshToken: string) => {
    const response = await fetch('http://localhost:4000/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
  
    const data = await response.json();
    const newToken = data.access_token;
    localStorage.setItem('token', newToken);
    return newToken;
  };
  
  export const storeTokens = (token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  };
  
  export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };
  