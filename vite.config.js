import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    logLevel: 'error',

    plugins: [
      base44({
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true
      }),

      react(),

      // 🔥 Custom startup banner plugin
      {
        name: "task-master-banner",
        configureServer(server) {
          server.httpServer?.once("listening", () => {
            console.log(`
=================================
🔥 Task Master
🚀 Running at: http://localhost:5173
=================================
`);
          });
        }
      }
    ]
  }
});