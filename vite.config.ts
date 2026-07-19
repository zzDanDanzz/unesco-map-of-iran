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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,geojson}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB limit
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
