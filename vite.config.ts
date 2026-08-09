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
        sourcemap: false,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // ── Vendor: bibliotecas pesadas separadas ─────────────────────
              if (id.includes('node_modules')) {
                if (id.includes('recharts')) return 'vendor-charts';
                if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
                if (id.includes('xlsx') || id.includes('papaparse')) return 'vendor-excel';
                if (id.includes('@google/genai')) return 'vendor-ai';
                if (id.includes('dompurify')) return 'vendor-security';
                // React core (react, react-dom, scheduler)
                if (
                  id.includes('/react/') ||
                  id.includes('/react-dom/') ||
                  id.includes('/scheduler/')
                ) return 'vendor-react';
              }

              // ── Admin chunks (ISS-024): cada aba do admin em chunk próprio ─
              if (id.includes('components/admin/AdminCommandsTab')) return 'admin-commands';
              if (id.includes('components/admin/FinanceTab'))       return 'admin-finance';
              if (id.includes('components/admin/SettingsTab'))      return 'admin-settings';
              if (id.includes('components/admin/operations'))       return 'admin-operations';
              if (id.includes('components/admin/staff'))            return 'admin-staff';
              if (id.includes('components/admin/provisioning'))     return 'admin-provisioning';
              if (id.includes('components/admin/AdminAiConfigTab')) return 'admin-ai-config';
              if (id.includes('components/admin/AdminWhatsappTab')) return 'admin-whatsapp';
              if (id.includes('components/admin/AdminPlansTab'))    return 'admin-plans';
              if (id.includes('components/admin/ServicesManagement')) return 'admin-services';

              // ── Rotas públicas (ISS-024 cont.): chunks por domínio ─────────
              if (id.includes('components/landing'))    return 'page-landing';
              if (id.includes('components/lawyer/LawyerDashboard')) return 'page-lawyer-dash';
              if (id.includes('components/lawyer/ForLawyersPage'))  return 'page-for-lawyers';
              if (id.includes('components/client/ClientDashboard')) return 'page-client-dash';
              if (id.includes('components/client'))     return 'page-client';
              if (id.includes('components/intern'))     return 'page-intern';
              if (id.includes('components/secretary'))  return 'page-secretary';
              if (id.includes('components/search'))     return 'page-search';
              if (id.includes('components/chatbot'))    return 'widget-chatbot';
            }
          }
        }
      }
    };
});

