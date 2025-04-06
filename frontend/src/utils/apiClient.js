// src/utils/apiClient.js

export const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null); // handle non-JSON response

  if (response.status === 401 && !url.includes("/signin")) {
    // 🔐 Token invalid or expired, but NOT during login
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    const error = new Error(data?.detail || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

  