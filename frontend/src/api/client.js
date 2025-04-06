// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: "https://trafficapi.khaitu.ca",
});

// Automatically include the token from localStorage in each request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage, depending on your app
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Existing methods
export const getTotalPredictions = () =>
  client.get("/api/stats/total").then(res => res.data);

export const getTimeseries = () =>
  client.get("/api/stats/timeseries").then(res => res.data);

export const getFrequentLocations = () =>
  client.get("/api/stats/frequent").then(res => res.data);

export const getRecentActivity = () =>
  client.get("/api/stats/recent").then(res => res.data);

export default client;
