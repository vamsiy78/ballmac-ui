import { readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { addItems } from "../src/add.js"
import { diffItem } from "../src/diff.js"
import { readBase, readLock } from "../src/lock.js"
import { hasGit } from "../src/merge.js"
import { findOutdated, outdatedCommand } from "../src/outdated.js"
import { installTests } from "../src/tests.js"
import { trackItems } from "../src/track.js"
import { updateItems } from "../src/update.js"
import { BASE, FakeWorld, has, makeCtx, makeProject, read, write } from "./helpers.js"

const BTN = "@components/ballmac/button.tsx"
const DLG = "@components/ballmac/dialog.tsx"
const I18N = "@lib/ballmac/i18n.tsx"
const body = (...lines: string[]) => lines.join("\n") + "\n"

const button1 = body("// button", "const size = 'h-9'", "const lg = 'h-11'", "const gap = 1", "const spinner = 'size-4'", "export { size }")
const dialog1 = body("// dialog", "import { t } from '@/lib/ballmac/i18n'", "const overlay = 'bg-black/50'", "export { overlay }")
const i18n1 = body("// i18n", "export const t = (k: string) => k")

function world() {
  const w = new FakeWorld()
  w.set("i18n", { version: "1.0.0", files: { [I18N]: i18n1 } })
  w.set("button", { version: "1.0.0", files: { [BTN]: button1 }, test: "// button test\nit one\nit two\nit three\n" })
  w.set("dialog", { version: "1.0.0", files: { [DLG]: dialog1 }, requires: ["i18n", "button"], test: "// dialog test\n" })
  return w
}

describe("add", () => {
  it("installs through shadcn and records every item and file, dependencies included", async () => {
    const root = makeProject()
    const { ctx, text } = makeCtx(root, world())
    await addItems(ctx, ["dialog"])
    const lock = readLock(root, BASE)
    expect(Object.keys(lock.items).sort()).toEqual(["button", "dialog", "i18n"])
    expect(lock.items.dialog).toMatchObject({ version: "1.0.0", tier: "free" })
    const file = lock.items.dialog!.files["src/components/ballmac/dialog.tsx"]!
    expect(file.kind).toBe("source")
    expect(readBase(root, file.base)).toBe(dialog1)
    expect(text()).toContain("3 item(s) tracked")
  })

  it("rejects unknown names with a suggestion, before touching anything", async () => {
    const root = makeProject()
    const { ctx, shadcn } = makeCtx(root, world())
    await expect(addItems(ctx, ["buton"])).rejects.toThrow(/did you mean button/)
    expect(shadcn.adds).toHaveLength(0)
  })

  it("asks for a licence key for Pro items instead of failing later", async () => {
    const w = world()
    const m = w.manifest()
    const root = makeProject()
    const { ctx } = makeCtx(root, w)
    // A Pro item is invisible without a key, so it is "not in the catalogue" and the message says why.
    await expect(addItems(ctx, ["hero-pro-1"])).rejects.toThrow(/Pro items are only listed when BALLMAC_LICENSE_KEY is set/)
    expect(Object.keys(m.items)).not.toContain("hero-pro-1")
  })

  it("records a pre-existing file that differs from the registry with no base", async () => {
    const root = makeProject()
    write(root, "src/components/ballmac/button.tsx", "// my own button\n")
    const { ctx, text } = makeCtx(root, world())
    await addItems(ctx, ["button"])
    const f = readLock(root, BASE).items.button!.files["src/components/ballmac/button.tsx"]!
    expect(f.base).toBeNull()
    expect(text()).toContain("tracked without a base")
    expect(read(root, "src/components/ballmac/button.tsx")).toBe("// my own button\n")
  })

  it("does not re-record items that are already tracked", async () => {
    const root = makeProject()
    const { ctx } = makeCtx(root, world())
    await addItems(ctx, ["button"])
    const before = readLock(root, BASE).items.button!.installedAt
    write(root, "src/components/ballmac/button.tsx", button1 + "// edited\n")
    await addItems(ctx, ["button"])
    const lock = readLock(root, BASE)
    expect(lock.items.button!.installedAt).toBe(before)
    expect(readBase(root, lock.items.button!.files["src/components/ballmac/button.tsx"]!.base)).toBe(button1)
  })
})

describe("add when shadcn writes nothing", () => {
  it("fails loudly instead of recording items that were never installed", async () => {
    const root = makeProject()
    const { ctx, shadcn } = makeCtx(root, world())
    shadcn.add = async () => {} // what shadcn does when it stops at an overwrite question nobody can answer: exit 0, write nothing
    await expect(addItems(ctx, ["button"])).rejects.toThrow(/shadcn did not write 1 file\(s\): src\/components\/ballmac\/button\.tsx.*interactive terminal/s)
    expect(Object.keys(readLock(root, BASE).items)).toEqual([])
  })
})

describe("tests that ship with items", () => {
  it("installs setup, test files and tracks them", async () => {
    const root = makeProject()
    const { ctx, text } = makeCtx(root, world())
    await addItems(ctx, ["button"], { withTests: true, installDev: false })
    expect(read(root, "src/components/ballmac/__tests__/button.test.tsx")).toBe("// button test\nit one\nit two\nit three\n")
    expect(has(root, "src/components/ballmac/__tests__/setup.ts")).toBe(true)
    const lock = readLock(root, BASE)
    expect(lock.items.button!.files["src/components/ballmac/__tests__/button.test.tsx"]!.kind).toBe("test")
    expect(text()).toContain("1 test file(s) installed")
  })

  it("uses the project's own alias prefix in the tests", async () => {
    const root = makeProject({ prefix: "~" })
    const w = world()
    w.set("button", { version: "1.0.0", files: { [BTN]: button1 }, test: 'import { Button } from "@/components/ballmac/button"\n' })
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["button"], { withTests: true, installDev: false })
    expect(read(root, "src/components/ballmac/__tests__/button.test.tsx")).toBe('import { Button } from "~/components/ballmac/button"\n')
  })

  it("says so when an item ships no test, and never overwrites an untracked file of that name", async () => {
    const root = makeProject()
    const w = world()
    const { ctx, text } = makeCtx(root, w)
    await addItems(ctx, ["i18n"], { withTests: true, installDev: false })
    expect(text()).toContain("No test ships with i18n yet")

    write(root, "src/components/ballmac/__tests__/button.test.tsx", "// mine\n")
    await installTests(makeCtx(root, w).ctx, ["button"], { installDev: false })
    expect(read(root, "src/components/ballmac/__tests__/button.test.tsx")).toBe("// mine\n")
  })

  it("lists the packages to install when asked not to install them", async () => {
    const root = makeProject()
    write(root, "package.json", "{}")
    const { ctx, text } = makeCtx(root, world())
    await addItems(ctx, ["button"], { withTests: true, installDev: false })
    expect(text()).toContain("Install the test packages: vitest@^4")
  })
})

describe("outdated", () => {
  it("reports what is behind, whether you edited it, and what changed", async () => {
    const root = makeProject()
    const w = world()
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["button", "dialog"])
    write(root, "src/components/ballmac/button.tsx", button1 + "// mine\n")
    w.set("button", { version: "1.1.0", files: { [BTN]: button1.replace("h-11", "h-12") }, changelog: [{ version: "1.1.0", date: "2026-10-12", note: "lg is taller." }] })

    const { rows } = await findOutdated(makeCtx(root, w).ctx)
    const button = rows.find((r) => r.name === "button")!
    expect(button).toMatchObject({ installed: "1.0.0", latest: "1.1.0", outdated: true, modified: "yes" })
    expect(button.changes.map((c) => c.note)).toEqual(["lg is taller."])
    expect(rows.find((r) => r.name === "dialog")).toMatchObject({ outdated: false, modified: "no" })

    const { ctx: c2, lines } = makeCtx(root, w)
    expect(await outdatedCommand(c2, [])).toBe(1)
    expect(lines.join("\n")).toContain("lg is taller.")
  })

  it("produces JSON for CI", async () => {
    const root = makeProject()
    const { ctx, lines } = makeCtx(root, world())
    await addItems(ctx, ["i18n"])
    const { ctx: c2, lines: out } = makeCtx(root, world())
    await outdatedCommand(c2, [], { json: true })
    expect(JSON.parse(out.join("\n"))[0]).toMatchObject({ name: "i18n", outdated: false })
    expect(lines.length).toBeGreaterThan(0)
  })

  it("flags files that still contain conflict markers, and items removed upstream", async () => {
    const root = makeProject()
    const w = world()
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["button", "i18n"])
    write(root, "src/components/ballmac/button.tsx", "<<<<<<< yours\nx\n=======\ny\n>>>>>>> ballmac 1.1.0\n")
    delete w.items.i18n
    const { rows } = await findOutdated(makeCtx(root, w).ctx)
    expect(rows.find((r) => r.name === "button")!.unresolved).toEqual(["src/components/ballmac/button.tsx"])
    expect(rows.find((r) => r.name === "i18n")!.removed).toBe(true)
  })

  it("tells you to track items it does not know", async () => {
    const root = makeProject()
    const { ctx } = makeCtx(root, world())
    await expect(findOutdated(ctx, ["button"])).rejects.toThrow(/Not tracked.*ballmac track/s)
  })
})

describe.skipIf(!hasGit())("update", () => {
  async function installed() {
    const root = makeProject()
    const w = world()
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["dialog", "button"], { withTests: true, installDev: false })
    return { root, w }
  }
  const bump = (w: FakeWorld, name: string, files: Record<string, string>, extra: Partial<Parameters<FakeWorld["set"]>[1]> = {}) => {
    const cur = w.items[name]!
    w.set(name, { ...cur, version: "1.1.0", files, changelog: [{ version: "1.1.0", date: "2026-10-12", note: `${name} changed.` }], ...extra })
  }

  it("replaces untouched files, merges edits elsewhere and keeps both sets of changes", async () => {
    const { root, w } = await installed()
    write(root, "src/components/ballmac/button.tsx", button1.replace("size-4", "size-5")) // my change, far from upstream's
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    bump(w, "dialog", { [DLG]: dialog1.replace("bg-black/50", "bg-black/60") })

    const { ctx, text } = makeCtx(root, w)
    const result = await updateItems(ctx)
    expect(result.conflicts).toBe(0)
    expect(read(root, "src/components/ballmac/button.tsx")).toBe(button1.replace("size-4", "size-5").replace("h-11", "h-12"))
    expect(read(root, "src/components/ballmac/dialog.tsx")).toBe(dialog1.replace("bg-black/50", "bg-black/60"))
    expect(text()).toContain("merged")
    expect(text()).toContain("your changes kept")

    // The lock moved to the new version, and the base is now upstream's new file, not the merge.
    const lock = readLock(root, BASE)
    expect(lock.items.button!.version).toBe("1.1.0")
    expect(readBase(root, lock.items.button!.files["src/components/ballmac/button.tsx"]!.base)).toBe(button1.replace("h-11", "h-12"))
    // Still modified relative to the new base, so the next update merges again.
    const next = await findOutdated(makeCtx(root, w).ctx)
    expect(next.rows.find((r) => r.name === "button")).toMatchObject({ outdated: false, modified: "yes" })
  })

  it("writes conflict markers when you and Ballmac changed the same line, and counts them", async () => {
    const { root, w } = await installed()
    write(root, "src/components/ballmac/dialog.tsx", dialog1.replace("bg-black/50", "bg-black/70"))
    bump(w, "dialog", { [DLG]: dialog1.replace("bg-black/50", "bg-black/60") })
    const { ctx, text } = makeCtx(root, w)
    const result = await updateItems(ctx, ["dialog"])
    expect(result.conflicts).toBe(1)
    expect(read(root, "src/components/ballmac/dialog.tsx")).toContain("<<<<<<< yours\nconst overlay = 'bg-black/70'\n=======\nconst overlay = 'bg-black/60'\n>>>>>>> ballmac 1.1.0")
    expect(text()).toContain("CONFLICT")
    const { rows } = await findOutdated(makeCtx(root, w).ctx)
    expect(rows.find((r) => r.name === "dialog")!.unresolved).toHaveLength(1)
  })

  it("backs up every file it may change", async () => {
    const { root, w } = await installed()
    write(root, "src/components/ballmac/button.tsx", button1 + "// mine\n")
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    await updateItems(makeCtx(root, w).ctx, ["button"])
    const stamp = readdirSync(join(root, ".ballmac/backup"))[0]!
    expect(read(root, `.ballmac/backup/${stamp}/src/components/ballmac/button.tsx`)).toBe(button1 + "// mine\n")
  })

  it("never overwrites a customised dependency file that shadcn rewrites", async () => {
    const { root, w } = await installed()
    write(root, "src/lib/ballmac/i18n.tsx", i18n1 + "// my team's helper\n")
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    const { ctx, shadcn } = makeCtx(root, w)
    await updateItems(ctx, ["button"])
    expect(shadcn.adds.at(-1)).toMatchObject({ overwrite: true })
    expect(read(root, "src/lib/ballmac/i18n.tsx")).toBe(i18n1 + "// my team's helper\n")
  })

  it("respects a file you deleted", async () => {
    const { root, w } = await installed()
    await import("node:fs").then((fs) => fs.rmSync(join(root, "src/components/ballmac/button.tsx")))
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    const { ctx, text } = makeCtx(root, w)
    await updateItems(ctx, ["button"])
    expect(has(root, "src/components/ballmac/button.tsx")).toBe(false)
    expect(text()).toContain("you deleted it")
  })

  it("puts the new version beside a file with no base instead of guessing", async () => {
    const root = makeProject()
    const w = world()
    write(root, "src/components/ballmac/button.tsx", "// my own\n")
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["button"])
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    await updateItems(makeCtx(root, w).ctx, ["button"])
    expect(read(root, "src/components/ballmac/button.tsx")).toBe("// my own\n")
    expect(read(root, "src/components/ballmac/button.tsx.ballmac-new")).toBe(button1.replace("h-11", "h-12"))
  })

  it("tracks a new file and a new dependency that a version adds", async () => {
    const { root, w } = await installed()
    w.set("kbd", { version: "1.0.0", files: { "@components/ballmac/kbd.tsx": "// kbd\n" } })
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12"), "@components/ballmac/button-icon.tsx": "// icon\n" }, { requires: ["kbd"] })
    const { ctx, text } = makeCtx(root, w)
    await updateItems(ctx, ["button"])
    expect(read(root, "src/components/ballmac/kbd.tsx")).toBe("// kbd\n")
    expect(read(root, "src/components/ballmac/button-icon.tsx")).toBe("// icon\n")
    const lock = readLock(root, BASE)
    expect(lock.items.kbd).toBeDefined()
    expect(Object.keys(lock.items.button!.files)).toContain("src/components/ballmac/button-icon.tsx")
    expect(text()).toContain("new")
  })

  it("updates the item's tests along with it, merging yours", async () => {
    const { root, w } = await installed()
    write(root, "src/components/ballmac/__tests__/button.test.tsx", "// button test\nit one (my assertion added)\nit two\nit three\n")
    bump(w, "button", { [BTN]: button1 }, { test: "// button test\nit one\nit two\nit three (new upstream case)\n" })
    await updateItems(makeCtx(root, w).ctx, ["button"])
    expect(read(root, "src/components/ballmac/__tests__/button.test.tsx")).toBe("// button test\nit one (my assertion added)\nit two\nit three (new upstream case)\n")
  })

  it("dry run reports everything and writes nothing", async () => {
    const { root, w } = await installed()
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    const before = readLock(root, BASE)
    const { ctx, text, shadcn } = makeCtx(root, w, { dryRun: true })
    const adds = shadcn.adds.length
    await updateItems(ctx)
    expect(text()).toContain("dry run")
    expect(text()).toContain("Nothing was changed")
    expect(read(root, "src/components/ballmac/button.tsx")).toBe(button1)
    expect(shadcn.adds.length).toBe(adds)
    expect(readLock(root, BASE)).toEqual(before)
    expect(has(root, ".ballmac/backup")).toBe(false)
  })

  it("restores your files if shadcn fails halfway", async () => {
    const { root, w } = await installed()
    write(root, "src/components/ballmac/button.tsx", button1 + "// mine\n")
    bump(w, "button", { [BTN]: button1.replace("h-11", "h-12") })
    const { ctx, shadcn } = makeCtx(root, w)
    shadcn.add = async () => {
      write(root, "src/components/ballmac/button.tsx", "// shadcn wrote this\n")
      throw new Error("network down")
    }
    await expect(updateItems(ctx, ["button"])).rejects.toThrow("network down")
    expect(read(root, "src/components/ballmac/button.tsx")).toBe(button1 + "// mine\n")
    expect(readLock(root, BASE).items.button!.version).toBe("1.0.0")
  })

  it("says everything is up to date when it is", async () => {
    const { root, w } = await installed()
    const { ctx, text } = makeCtx(root, w)
    expect((await updateItems(ctx)).items).toEqual([])
    expect(text()).toContain("up to date")
  })
})

describe("track and diff", () => {
  it("adopts items installed with plain shadcn: pristine files get a base, edited ones do not", async () => {
    const root = makeProject()
    const w = world()
    write(root, "src/components/ballmac/button.tsx", button1)
    write(root, "src/components/ballmac/dialog.tsx", dialog1 + "// edited\n")
    write(root, "src/lib/ballmac/i18n.tsx", i18n1)
    const { ctx, text } = makeCtx(root, w)
    await trackItems(ctx, [])
    const lock = readLock(root, BASE)
    expect(lock.items.button!.files["src/components/ballmac/button.tsx"]!.base).not.toBeNull()
    expect(lock.items.dialog!.files["src/components/ballmac/dialog.tsx"]!.base).toBeNull()
    expect(text()).toContain("without a base")
  })

  it("rebase declares your files current and records the latest as the base", async () => {
    const root = makeProject()
    const w = world()
    write(root, "src/components/ballmac/button.tsx", "// old and edited\n")
    const { ctx } = makeCtx(root, w)
    await addItems(ctx, ["button"])
    expect(readLock(root, BASE).items.button!.files["src/components/ballmac/button.tsx"]!.base).toBeNull()
    await trackItems(makeCtx(root, w).ctx, ["button"], { rebase: true })
    const f = readLock(root, BASE).items.button!.files["src/components/ballmac/button.tsx"]!
    expect(readBase(root, f.base)).toBe(button1)
  })

  it.skipIf(!hasGit())("diff shows only your changes since install", async () => {
    const root = makeProject()
    const { ctx } = makeCtx(root, world())
    await addItems(ctx, ["button"])
    const c1 = makeCtx(root, world())
    expect(await diffItem(c1.ctx, "button")).toBe(0)
    expect(c1.text()).toContain("exactly as installed")
    write(root, "src/components/ballmac/button.tsx", button1.replace("size-4", "size-5"))
    const c2 = makeCtx(root, world())
    expect(await diffItem(c2.ctx, "button")).toBe(1)
    expect(c2.text()).toContain("-const spinner = 'size-4'")
    expect(c2.text()).toContain("+const spinner = 'size-5'")
  })
})
