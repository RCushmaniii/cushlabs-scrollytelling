import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "static",
  adapter: vercel(),
  integrations: [svelte(), tailwind(), mdx()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            p5: ["p5"],
          },
        },
      },
    },
  },
});
