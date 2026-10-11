import { fileState, type Ctx } from "./ctx.js"
import { readLock } from "./lock.js"
import { hasGit, unifiedDiff } from "./merge.js"
import { CliError, c, suggest } from "./util.js"

/** `ballmac diff <item>`: what you changed since you installed it (the recorded upstream file against yours). */
export async function diffItem(ctx: Ctx, name: string) {
  const lock = readLock(ctx.project.root, ctx.registry.base)
  const item = lock.items[name]
  if (!item) {
    const close = suggest(name, Object.keys(lock.items))
    throw new CliError(`${name} is not tracked in ballmac.lock.json${close.length ? ` (did you mean ${close.join(", ")}?)` : ""}.`)
  }
  if (!hasGit()) throw new CliError("ballmac diff needs git on your PATH.")
  let changed = 0
  for (const [path, f] of Object.entries(item.files)) {
    const { ours, baseText } = fileState(ctx, path, f.base)
    if (ours === null) {
      ctx.out(c.yellow(`${path}: deleted`))
      changed++
    } else if (baseText === null) {
      ctx.out(c.yellow(`${path}: no base recorded, so your changes cannot be told apart. Use \`ballmac track --rebase ${name}\` to start fresh.`))
    } else {
      const d = unifiedDiff(baseText, ours, `${path} (ballmac ${item.version})`, `${path} (yours)`)
      if (d) {
        ctx.out(d)
        changed++
      }
    }
  }
  if (!changed) ctx.out(c.green(`✓ ${name} is exactly as installed (${item.version}).`))
  return changed
}
