import { existsSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// BALLMAC_BASE=1 runs the same tests against the Base UI versions: an item that has a file under ballmac/base/components (or base/lib) is replaced by it.
const baseAliases = (process.env.BALLMAC_BASE === "1" ? ["components", "lib"] : []).flatMap((kind) => {
  const dir = fileURLToPath(new URL(`./ballmac/base/${kind}`, import.meta.url))
  if (!existsSync(dir)) return []
  // Nested files (blocks/desktop-1/desktop-1.tsx) are matched by their path under the folder, as users import them.
  return (readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => /\.tsx?$/.test(f))
    .map((f) => ({ find: new RegExp(`^@/${kind}/ballmac/${f.replace(/\.tsx?$/, "")}$`), replacement: `${dir}/${f}` }))
})

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The same import paths users get after `shadcn add`.
    alias: [
      ...baseAliases,
      // Pro blocks live in the private checkout at registry/pro (absent in public clones).
      { find: /^@\/components\/ballmac\/dashboard-kit$/, replacement: r("./pro/ballmac/components/dashboard-kit") },
      { find: /^@\/components\/ballmac\/ecommerce-kit$/, replacement: r("./pro/ballmac/components/ecommerce-kit") },
      { find: /^@\/components\/ballmac\/blocks\/([a-z-]+-pro-\d+)\/(.*)$/, replacement: r("./pro/ballmac/components/blocks/$1/$2") },
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
    include: ["tests/**/*.test.tsx", "pro/tests/**/*.test.tsx"],
    css: false,
  },
})
