import { readdirSync, readFileSync } from "node:fs"
import { registryItemSchema, registrySchema } from "shadcn/schema"
const dir = process.argv[2]
let ok = 0
for (const f of readdirSync(dir)) {
  const data = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"))
  const r = (f === "registry.json" ? registrySchema : registryItemSchema).safeParse(data)
  if (!r.success) { console.log("✗", f, JSON.stringify(r.error.issues.slice(0, 3))); continue }
  ok++
}
console.log(`${ok}/${readdirSync(dir).length} files valid against shadcn/schema`)
