import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      includeAssets: ["ojt-icon.svg"],
      manifest: {
        name: "OJT Days Tracker",
        short_name: "OJT Tracker",
        description: "Track internship attendance and progress.",
        theme_color: "#397c55",
        background_color: "#f7f8f5",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/ojt-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: { navigateFallback: "/index.html" },
    }),
  ],
  server: {
    watch: {
      ignored: ["**/*.zip"],
    },
  },
});
