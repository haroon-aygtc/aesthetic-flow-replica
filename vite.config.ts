import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
        withCredentials: true,
      },
      "/sanctum": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
        withCredentials: true,
      },
    },
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    tempo(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
