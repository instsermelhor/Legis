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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ONLINE_URL': JSON.stringify('https://www.legisconnect.com.br'),
        'process.env.LOCAL_URL': JSON.stringify(`http://localhost:3000/${currentDir}`),
        'process.env.APP_DIR_NAME': JSON.stringify(currentDir),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
