import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vite does not populate process.env from .env files inside this config, so
  // the proxy targets below would always fall back to their defaults. Load the
  // VITE_* vars explicitly so the values documented in .env.example take effect.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), viteTsconfigPaths(), svgrPlugin(), tailwindcss()],
    server: {
      proxy: {
        // Local Mock tier. Only reached when MSW is disabled; MSW normally
        // intercepts /api in the browser before it hits the network.
        "/api": {
          target: env.VITE_MOCKED_API_URL || "http://localhost:8081",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // JPMC CAT tier -> express server (mTLS + signed JWT).
        "/cat-api": {
          target: env.VITE_CAT_API_URL || "http://localhost:8082",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/cat-api\/api/, ""),
        },
        // JPMC Mock tier -> express server, which mints the OAuth2 Bearer and
        // forwards to api-mock. Rewrites to the server's /mockapi mount.
        "/mock-api": {
          target: env.VITE_JPMC_MOCK_API_URL || "http://localhost:8082",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/mock-api\/api/, "/mockapi"),
        },
      },
    },
  };
});
