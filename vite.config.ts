import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendors into their own cacheable chunks
        // so the app code and the >500 kB Mapbox lib no longer ship as one blob.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl')) return 'mapbox';
            if (id.includes('@supabase')) return 'supabase';
            return 'vendor';
          }
        },
      },
    },
  },
});
