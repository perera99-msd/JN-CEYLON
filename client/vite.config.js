import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const targetPort = env.PORT || process.env.PORT || 5000;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${targetPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
