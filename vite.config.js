import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets_local/[name].[ext]',
        chunkFileNames: 'assets_local/[name].[hash].js',
        entryFileNames: 'assets_local/[name].[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // This will separate out most dependencies into a vendor chunk
          }
          if (id.includes('three')) { // Example for isolating specific large libraries
            return 'three';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: Increase limit to suppress warning
  },
  server: {
    sourcemap: false, // Ensure this matches your desired configuration
  },
});

