import { GitMerge, ShieldCheck } from "lucide-react"

import Link from "@/components/site/link"
import { overview } from "@/lib/quality"
import { cn } from "@/lib/utils"

/** The command and its output, set in a terminal. Output matches what `ballmac update` prints. */
function Terminal() {
  return (
    <figure className="bg-card overflow-hidden rounded-2xl border shadow-sm" aria-label="Terminal: ballmac update merging a new version into an edited file">
      <div className="bg-muted/50 flex items-center gap-1.5 border-b px-4 py-2.5" aria-hidden="true">
        <span className="bg-border size-2.5 rounded-full" />
        <span className="bg-border size-2.5 rounded-full" />
        <span className="bg-border size-2.5 rounded-full" />
        <span className="text-muted-foreground ms-3 font-mono text-xs">your-app</span>
      </div>
      <pre tabIndex={0} aria-label="Example output of ballmac update" className="focus-visible:ring-ring/50 overflow-x-auto p-4 font-mono text-[12.5px] leading-6 outline-none focus-visible:ring-[3px] focus-visible:ring-inset sm:p-5">
        <code>
          <span className="text-muted-foreground">$ </span>
          <span className="text-foreground">npx @ballmac/cli update</span>
          {"\n\n"}
          <span className="text-foreground">button</span>
          <span className="text-muted-foreground">  1.0.0 → 1.1.0</span>
          {"\n"}
          <span className="text-muted-foreground">  The lg size is taller so it matches the lg input.</span>
          {"\n"}
          <span className="text-emerald-700 dark:text-emerald-400">  merged   </span>
          <span className="text-muted-foreground">button.tsx  your changes kept</span>
          {"\n\n"}
          <span className="text-foreground">dialog</span>
          <span className="text-muted-foreground">  1.0.0 → 1.1.0</span>
          {"\n"}
          <span className="text-amber-800 dark:text-amber-400">  CONFLICT </span>
          <span className="text-muted-foreground">dialog.tsx  1 conflict, you choose</span>
          {"\n\n"}
          <span className="text-muted-foreground">Originals saved in .ballmac/backup/</span>
        </code>
      </pre>
    </figure>
  )
}

/** Two promises most copy-paste libraries cannot make: new versions merge into your edited copy, and the quality claims are measured and public. */
export function StayCurrent({ className }: { className?: string }) {
  const o = overview()
  return (
    <div className={cn("grid items-center gap-x-12 gap-y-10 lg:grid-cols-2", className)}>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-muted flex size-8 items-center justify-center rounded-lg" aria-hidden="true">
              <GitMerge className="size-4" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">Updates that keep your edits</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Copy-paste means you are stuck on the version you copied. <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">ballmac update</code> merges a new version into your edited file, line by line, and stops with a conflict only where you and we changed the same line.{" "}
            <Link href="/docs/guides/update-components" className="text-foreground underline underline-offset-4">
              How it works
            </Link>
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-muted flex size-8 items-center justify-center rounded-lg" aria-hidden="true">
              <ShieldCheck className="size-4" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">Quality you can check</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            We loaded all {o.items} items in a real browser, in light, dark, phone width and right to left, and published the results{o.failing.length ? `, including the ${o.failing.length} that did not pass` : ", failures included"}. Then <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">ballmac check</code> holds your own app to the same bar, and your AI agent can run it before it says it is done.{" "}
            <Link href="/quality" className="text-foreground underline underline-offset-4">
              See the results
            </Link>
          </p>
        </div>
      </div>
      <Terminal />
    </div>
  )
}
