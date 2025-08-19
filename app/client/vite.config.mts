/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_MOCKED_API_URL || "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/cat-api": {
        target: process.env.VITE_CAT_API_URL || "http://localhost:8082",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cat-api\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "**/mocks", "**/*.test.tsx", "**/config.ts"],
    },
  },
});
