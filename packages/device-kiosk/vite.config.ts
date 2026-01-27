import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 13_100,
    proxy: {
      "/status": "http://localhost:13000",
      "/pair": "http://localhost:13000"
    }
  },
  plugins: [react()]
});
