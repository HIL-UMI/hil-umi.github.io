import { defineConfig } from 'vite';
import { sites } from '@openai/sites-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [sites(), react()],
});
