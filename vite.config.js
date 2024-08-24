import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
require('dotenv').config()

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: process.env.PROXY_URL,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
        },
    }
});




