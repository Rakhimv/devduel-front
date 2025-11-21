import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';
import path from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  publicDir: 'public',
  build: {
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-icons', 'react-resizable-panels'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});