import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "10.0.0.12",
    port: 5173,
    open: true,
    allowedHosts: ["testing.khaitu.ca", "api.khaitu.ca"],
  }
});