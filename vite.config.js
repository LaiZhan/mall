import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { useHost } from "vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    vueDevTools(),
    useHost({
      host: "0.0.0.0",
      port: 5173,
      protocol: "http",
      open: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: "Dockerfile",
          dest: "",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
