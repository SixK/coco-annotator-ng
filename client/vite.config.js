// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
const path = require("path");
export default defineConfig({
  plugins: [vue()],
  strict: false,
  optimizeDeps: {
    strict: false,
  },
  server: {
    port: 8080, 
    strictPort: true,

    allowedHosts: ["localhost", "webserver"],

    proxy: {
      "/api/model": {
        target: "http://ia:6000/api/model",
        changeOrigin: true,
        secure: false,  
        rewrite: (path) => path.replace(/^\/api\/model/, ""),
      },
      "/api": {
        target: "http://webserver:5000/api/",
        changeOrigin: true,
        secure: false,  
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      "/socket.io": {
        target: "http://webserver:5000/socket.io",
        changeOrigin: false,
                secure: false,  
                ws: true,
        rewrite: (path) => path.replace(/^\/socket.io/, ""),
        },
      },
    
  },


  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
});
