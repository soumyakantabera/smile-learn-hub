import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Base path configuration:
// ========================
// Vercel / Lovable / any root-domain host:  leave VITE_BASE_PATH unset (defaults to "/")
// GitHub PROJECT Pages (https://user.github.io/repo/): set VITE_BASE_PATH=/repo/
// Local development: base is always "/"

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? (process.env.VITE_BASE_PATH || "/") : "/",


  
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
