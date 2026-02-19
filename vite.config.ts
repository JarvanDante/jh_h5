import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8000'
  const devSiteId = env.VITE_DEV_SITE_ID || '1'
  const devSiteCode = env.VITE_DEV_SITE_CODE || 'jh'

  return {
    plugins: [
      vue(),
      // Vant 按需引入
      Components({
        resolvers: [VantResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['i.jh_h5.com', 'a01.jh_h5.com', 'a02.jh_h5.com'],
      proxy: {
        '/api/frontend': {
          target: proxyTarget,
          changeOrigin: true,
          headers: {
            'X-Site-Id': devSiteId,
            'X-Site-Code': devSiteCode,
          },
        },
        '/api/backend': {
          target: proxyTarget,
          changeOrigin: true,
          headers: {
            'X-Site-Id': devSiteId,
            'X-Site-Code': devSiteCode,
          },
        },
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          headers: {
            'X-Site-Id': devSiteId,
            'X-Site-Code': devSiteCode,
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})
