/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,          
    environment: "node",    
    include: ["test/**/*.test.{js,ts}"], 
    exclude: ["node_modules", "dist"],   
    coverage: {
      reporter: ["text", "html"],
    },
    alias: {
      "@llm-canvas/sdk": "/src/index.ts"
    }
  },
});
