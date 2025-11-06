import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Configuração do Vite: IPv4, porta fixa e proxy para backend (evita CORS em dev)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawApi = env.VITE_API_URL || 'http://192.168.0.107:8080/api';
  let targetOrigin = 'http://192.168.0.107:8080';
  // Caminho base do backend. Pode ser '', '/api', '/v1', etc.
  let apiBasePath = '/api';
  try {
    const u = new URL(rawApi);
    targetOrigin = `${u.protocol}//${u.host}`;
    // Se o .pathname for '/', normalizamos para '' (sem prefixo)
    const p = (u.pathname || '/api').replace(/\/+$/, '');
    apiBasePath = p === '/' ? '' : p;
  } catch (e) {
    // fallback mantém valores padrão
  }

  return {
    plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'VEIMANFLOW',
        short_name: 'VEIMANFLOW',
        description: 'Sistema de gerenciamento de fluxo de trabalho',
        theme_color: '#2563eb',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: targetOrigin,
          changeOrigin: true,
          secure: false,
          // '/api/foo' -> '{apiBasePath}/foo' (quando apiBasePath = '') vira '/foo'
          rewrite: (path) => {
            const suffix = path.replace(/^\/api/, '');
            // Garante única barra entre base e sufixo
            return `${apiBasePath}${suffix}`;
          },
        },
      }
    }
  };
});
