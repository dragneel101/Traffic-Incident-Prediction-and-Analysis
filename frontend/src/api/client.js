import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Module-level token store — updated by AuthContext, read by interceptors
let _accessToken = null;
export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;

const client = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
client.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// On 401: attempt silent token refresh, then retry once
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          setAccessToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          setAccessToken(null);
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Stats helpers used by Dashboard
export const getTotalPredictions = () => client.get("/api/stats/total").then((r) => r.data);
export const getTimeseries = () => client.get("/api/stats/timeseries").then((r) => r.data);
export const getFrequentLocations = () => client.get("/api/stats/frequent").then((r) => r.data);
export const getRecentActivity = () => client.get("/api/stats/recent").then((r) => r.data);

export default client;
