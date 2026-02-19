import { defineConfig } from "vite";

export default defineConfig({
  // App is served from /games/snake/, not the domain root.
  base: "/games/snake/",
});
