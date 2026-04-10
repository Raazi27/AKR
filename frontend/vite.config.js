import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            '/api': {
                target: 'https://al-kabah-uniform.vercel.app',
                changeOrigin: true,
                secure: true
            },
            '/uploads': {
                target: 'https://al-kabah-uniform.vercel.app',
                changeOrigin: true,
                secure: true
            }
        }
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        minify: 'esbuild',

        chunkSizeWarningLimit: 2000,

        cssCodeSplit: true,

        sourcemap: false,

        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    // Core React & Router
                    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                        return 'vendor-react';
                    }

                    // Large UI & Animation Libs
                    if (id.includes('framer-motion')) {
                        return 'vendor-animation';
                    }

                    // Visualization
                    if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                        return 'vendor-charts';
                    }

                    // Icons - only split if large
                    if (id.includes('react-icons') || id.includes('@heroicons')) {
                        return 'vendor-icons';
                    }

                    // UI Components
                    if (id.includes('@headlessui')) {
                        return 'vendor-ui';
                    }

                    // Default vendor chunk
                    return 'vendor';
                },

                chunkFileNames: 'assets/js/[name]-[hash].js',

                entryFileNames: 'assets/js/[name]-[hash].js',

                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        }
    },

    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom'
        ]
    }
})