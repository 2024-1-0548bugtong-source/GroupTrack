import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  base: "",  // relative paths — required for chrome extension (no server)
  envDir: path.resolve(__dirname),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  define: {
    "import.meta.env.VITE_IS_EXTENSION": JSON.stringify("true"),
  },
  build: {
    outDir: path.resolve(__dirname, "dist-extension"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "client", "index.html"),
        background: path.resolve(__dirname, "extension", "background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Background script must be at root level as background.js
          if (chunkInfo.name === "background") return "background.js";
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
            return "vendor-misc";
          }
          return undefined;
        },
      },
    },
    // Chrome Extensions don't support import() in service workers easily
    target: "esnext",
    minify: true,
    sourcemap: false,
  },
});
