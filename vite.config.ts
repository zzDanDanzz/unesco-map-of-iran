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
      registerType: 'prompt',
      workbox: {
        navigateFallback: 'index.html',
        globIgnores: ['**/*-large.webp', '**/*-thumb.webp'],

        globPatterns: ['**/*.{js,css,ico,png,svg,json,geojson,html}'],
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
          },
          {
            urlPattern: /.*\.pbf$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pbf-cache',
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            const vendorChunks = {
              'map-vendor': ['maplibre-gl', 'react-map-gl', 'pmtiles'],
              'ui-vendor': ['@tabler/icons-react', 'embla-carousel-react', 'vaul', 'radix-ui'],
              'utils-vendor': ['supercluster', 'use-supercluster', '@turf/bbox', '@turf/helpers']
            };
            
            for (const [chunkName, dependencies] of Object.entries(vendorChunks)) {
              if (dependencies.some(dep => id.includes(dep))) {
                return chunkName;
              }
            }
          }
        }
      }
    }
  }
})
