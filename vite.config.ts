import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  base: "/unesco-map-of-iran/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['**/*-large.webp', '**/*-thumb.webp'],

        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,geojson}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: /.*-thumb\.webp$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'thumbnail-images-cache',
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /.*-large\.webp$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'large-images-cache',
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'UNESCO World Heritage Sites of Iran',
        short_name: 'Iran UNESCO',
        theme_color: '#ffffff',
        display: 'standalone'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
