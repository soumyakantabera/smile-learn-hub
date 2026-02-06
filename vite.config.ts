import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// GitHub Pages Configuration:
// ============================
// For GitHub PROJECT Pages (https://username.github.io/repo-name/):
//   Set base to: '/<repo-name>/'
//   Example: base: '/learn-with-smile-moodle/'
//
// For GitHub USER/ORG Pages (https://username.github.io/):
//   Set base to: '/'
//
// For local development:
//   The base setting doesn't affect local dev server

export default defineConfig(({ mode }) => ({
  // Change this to your repository name for GitHub Pages deployment
  // Example: base: '/learn-with-smile-moodle/'
  base: mode === "production" ? "/learn-with-smile-moodle/" : "/",
  
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
        },
      },
    },
  },
}));
