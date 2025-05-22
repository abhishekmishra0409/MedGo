import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Use generateSW for automatic service worker generation
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Workbox configuration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'], // Include JSON files
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },

      // Manifest configuration
      manifest: {
        name: 'DawaiLink',
        short_name: 'DawaiLink',
        description: 'A Healthcare ecosystem application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/android-icon-512x512.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      // Development options
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],

  // Server configuration
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },

  // Build configuration
  build: {
    sourcemap: true
  }
})