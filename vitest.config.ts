import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

/** Vite plugin to import .glsl files as raw strings */
function glslPlugin(): Plugin {
  return {
    name: "glsl-raw",
    transform(_code: string, id: string) {
      if (id.endsWith(".glsl")) {
        const src = fs.readFileSync(id, "utf-8");
        return { code: `export default ${JSON.stringify(src)};`, map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), glslPlugin()],
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
