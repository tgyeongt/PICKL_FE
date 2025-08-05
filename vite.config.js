import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // 새 버전 생기면 자동 업데이트
      includeAssets: [
        "favicons/favicon.ico",
        "favicons/apple-touch-icon.png",
        "favicons/favicon-96x96.png",
        "favicons/favicon.svg",
      ],
      manifest: {
        name: "피클",
        short_name: "피클",
        description: "매일의 식탁에 계절을 담다",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "favicons/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicons/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: { outDir: "build" },
  resolve: {
    alias: [
      { find: "@", replacement: "/src/routes/*" },
      { find: "@commons", replacement: "/src/shared/commons" },
      { find: "@font", replacement: "/src/shared/assets/font" },
      { find: "@icon", replacement: "/src/shared/assets/icon" },
      { find: "@image", replacement: "/src/shared/assets/image" },
    ],
  },
});
