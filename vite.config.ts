import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const currentDir = path.basename(__dirname);
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // ⚠️ SECURITY (VULN-004 FIX): GEMINI_API_KEY REMOVED from frontend bundle.
        // The frontend MUST call the proxy at /api/gemini — see server/gemini-proxy.js
        // API_KEY is intentionally undefined in the client bundle.
        'process.env.API_KEY': JSON.stringify('USE_PROXY'), // Signal to geminiService.ts
        'process.env.GEMINI_API_KEY': JSON.stringify('USE_PROXY'),
        'process.env.GEMINI_PROXY_URL': JSON.stringify(
          env.NODE_ENV === 'development'
            ? 'http://localhost:3001/api/gemini'
            : '/api/gemini'
        ),
        'process.env.ONLINE_URL': JSON.stringify('https://www.legisconnect.com.br'),
        'process.env.LOCAL_URL': JSON.stringify(`http://localhost:3000/${currentDir}`),
        'process.env.APP_DIR_NAME': JSON.stringify(currentDir),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('recharts')) return 'vendor-charts';
                if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
                if (id.includes('xlsx') || id.includes('papaparse')) return 'vendor-excel';
                if (id.includes('@google/genai')) return 'vendor-ai';
              }
            }
          }
        }
      }
    };
});
