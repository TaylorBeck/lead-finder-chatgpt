import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fg from "fast-glob";
import path from "node:path";

function buildInputs() {
  const files = fg.sync("src/**/index.{tsx,jsx}", { dot: false });
  return Object.fromEntries(
    files.map((f) => [path.basename(path.dirname(f)), path.resolve(f)])
  );
}

const inputs = buildInputs();

export default defineConfig({
  plugins: [tailwindcss(), react()],
  cacheDir: "node_modules/.vite-react",
  server: {
    port: 4444,
    strictPort: true,
    cors: true,
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
    target: "es2022",
  },
  build: {
    target: "es2022",
    sourcemap: true,
    minify: "esbuild",
    outDir: "assets",
    assetsDir: ".",
    rollupOptions: {
      input: inputs,
      preserveEntrySignatures: "strict",
    },
  },
});

