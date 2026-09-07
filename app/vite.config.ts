import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'VECT CT LAB',
        short_name: 'CT LAB',
        theme_color: '#1a365d',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { networkTimeoutSeconds: 3, cacheName: 'supabase-cache' },
          },
        ],
      },
    }),
  ],
})
