// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000/', // Adjust if backend is hosted elsewhere
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
