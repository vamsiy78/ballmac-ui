import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The same import paths users get after `shadcn add`.
    alias: [
      { find: /^@\/components\/ballmac\/(.*)$/, replacement: r("./ballmac/components/$1") },
      { find: /^@\/hooks\/ballmac\/(.*)$/, replacement: r("./ballmac/hooks/$1") },
      { find: /^@\/lib\/ballmac\/(.*)$/, replacement: r("./ballmac/lib/$1") },
      { find: /^@\/lib\/utils$/, replacement: r("./tests/utils.ts") },
      { find: /^next\/font\/google$/, replacement: r("./tests/next-font-google.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.tsx"],
    css: false,
  },
})
