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
        // Split heavy, rarely-changing vendors and big data modules into their own
        // cacheable chunks so the app code and the >500 kB Mapbox lib no longer
        // ship as one blob. (The old `@supabase` rule produced an empty chunk —
        // Rollup folds Supabase into vendor — so it's dropped.)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl')) return 'mapbox';
            return 'vendor';
          }
          // Large generated data — own long-cached chunks, off the entry chunk.
          if (id.includes('/data/visaMatrix')) return 'visa-data';
          if (id.includes('/screens/web/globalCities')) return 'city-data';
        },
      },
    },
  },
});
