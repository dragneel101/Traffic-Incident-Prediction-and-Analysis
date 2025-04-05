// src/utils/apiClient.js
export const apiClient = async (url, options = {}) => {
    const token = localStorage.getItem('token');
  
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  
    if (response.status === 401) {
      // 🔐 Token expired or invalid — log out
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login page
      return;
    }
  
    if (!response.ok) {
      throw new Error('Request failed');
    }
  
    return response.json();
  };
  