import { defineConfig } from 'vite';
import { sites } from '@openai/sites-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/hil-umi.github.io/' : '/',
  plugins: [sites(), react()],
});
