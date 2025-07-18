// vite.config.js
import { defineConfig } from "vite";
import { p5GlobalsPlugin } from "./vite-p5-plugin.js";

export default defineConfig({
  // plugins: [
  //   // Only transform generator.js specifically
  //   p5GlobalsPlugin({
  //     instanceName: "this.p",
  //     filePattern: /\/generator\.js$/, // More specific pattern
  //     debug: true, // Enable to see what gets transformed
  //   }),
  // ],

  // Other Vite configuration
  build: {
    target: "es2015",
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      // Bundle p5 again since we removed toxiclibsjs
    },
  },

  server: {
    hmr: true, // Make sure this is enabled
    port: 3000,
    open: true,
  },
});
