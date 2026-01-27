import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 13_100,
    proxy: {
      "/status": {
        target: "http://127.0.0.1:13000",
        changeOrigin: true,
        secure: false
      },
      "/pair": {
        target: "http://127.0.0.1:13000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react()]
});
