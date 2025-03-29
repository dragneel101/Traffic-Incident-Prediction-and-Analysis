import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "10.0.0.252",
    port: 4173,
    open: true,
    allowedHosts: ["traffic.khaitu.ca", "trafficapi.khaitu.ca"],
    proxy: {
      "/auth": {
        target: "https://trafficapi.khaitu.ca", // Adjust if your backend is hosted elsewhere
        changeOrigin: true,
        secure: false,
      },
      "/user": {
        target: "https://trafficapi.khaitu.ca",
        changeOrigin: true,
        secure: false,
      },
      "/password-reset": {
        target: "https://trafficapi.khaitu.ca",
        changeOrigin: true,
        secure: false,
      },
    },
  }
});