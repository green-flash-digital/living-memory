import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devToolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  server: {
    port: 12_100,
  },
  plugins: [
    devToolsJson(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
