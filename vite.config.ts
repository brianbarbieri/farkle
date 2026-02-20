import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';

const projectRoot = __dirname;
let root = projectRoot;

// if index.html not at project root, look for it in an immediate subfolder and use that
if (!fs.existsSync(path.join(projectRoot, 'index.html'))) {
  const subdirs = fs.readdirSync(projectRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  for (const d of subdirs) {
    if (fs.existsSync(path.join(projectRoot, d, 'index.html'))) {
      root = path.join(projectRoot, d);
      break;
    }
  }
}

export default defineConfig({
  root,
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: path.relative(root, path.join(projectRoot, 'dist')), // keep dist at repo root
  },
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
});