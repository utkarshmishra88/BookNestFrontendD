import { defineConfig } from 'vite';
import reactSWC from '@vitejs/plugin-react-swc';
import path from 'path';

// Vite configuration with proxy to API Gateway (Spring Cloud Gateway on port 9000)
export default defineConfig({
  plugins: [reactSWC()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false, // Disable error overlay during development
    },
    proxy: {
      // All /api/* requests are forwarded to the Spring Boot API Gateway
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
        // Let the browser handle redirects to external OAuth providers.
        // If the dev proxy follows redirects, it will fetch provider HTML
        // and return it from the dev server (localhost:5173), causing
        // CSP/CORS issues. Set to false so the browser receives the 302.
        followRedirects: false,
        ws: true,
      },
    },
  },
});
