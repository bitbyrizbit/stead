import { defineConfig } from "tsup";
export default defineConfig([
  {
    entry: { content: "src/content.ts" },
    format: ["iife"],
    globalName: "STEADContent",
    outDir: "dist",
    clean: false,
    platform: "browser",
    target: "chrome90",
  },
  {
    entry: { popup: "src/popup.ts" },
    format: ["iife"],
    globalName: "STEADPopup",
    outDir: "dist",
    clean: false,
    platform: "browser",
    target: "chrome90",
  }
]);