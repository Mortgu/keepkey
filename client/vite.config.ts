import path from "node:path";
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    }
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
