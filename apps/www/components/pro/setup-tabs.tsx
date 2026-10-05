"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ballmac/tabs"
import { maskKey } from "@/lib/pro-session-core"
import { PRO_REGISTRY_SNIPPET, proCommands } from "@/lib/pro-snippets"

/** A code block that shows one text and copies another, so the key can be hidden on screen but real on the clipboard. */
function Snippet({ title, shown, copy }: { title?: string; shown: string; copy: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-xl border">
      <div className="bg-muted/40 flex h-9 items-center justify-between border-b pr-1.5 pl-4">
        <span className="text-muted-foreground font-mono text-xs">{title ?? "Terminal"}</span>
        <button
          type="button"
          aria-label={copied ? "Copied" : `Copy ${title ?? "command"}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(copy)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            } catch {
              // Clipboard unavailable; nothing else to do.
            }
          }}
          className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs outline-none focus-visible:ring-[3px]"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0} className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-inset">
        <code>{shown}</code>
      </pre>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-2">
      <span className="bg-foreground text-background mt-0.5 flex size-7 items-center justify-center rounded-full text-xs font-semibold" aria-hidden="true">
        {n}
      </span>
      <p className="pt-1 text-sm font-medium">
        <span className="sr-only">Step {n}: </span>
        {title}
      </p>
      <div className="col-span-2 min-w-0 space-y-3 sm:col-span-1 sm:col-start-2">{children}</div>
    </li>
  )
}

/** The three ways to use a licence, with the buyer's own key filled in. */
export function SetupTabs({ licenseKey, sampleItem }: { licenseKey: string; sampleItem: string }) {
  const real = proCommands(licenseKey)
  const masked = proCommands(maskKey(licenseKey))
  return (
    <Tabs defaultValue="cli" className="gap-5">
      <TabsList aria-label="How to install">
        <TabsTrigger value="cli">shadcn CLI</TabsTrigger>
        <TabsTrigger value="mcp">AI agents (MCP)</TabsTrigger>
        <TabsTrigger value="starter">Starter app</TabsTrigger>
      </TabsList>

      <TabsContent value="cli">
        <ol className="space-y-6">
          <Step n={1} title="Add your key to .env.local">
            <Snippet title=".env.local" shown={masked.env} copy={real.env} />
          </Step>
          <Step n={2} title="Add the Pro registry to components.json">
            <Snippet title="components.json" shown={PRO_REGISTRY_SNIPPET} copy={PRO_REGISTRY_SNIPPET} />
          </Step>
          <Step n={3} title="Install any Pro block">
            <Snippet shown={`npx shadcn@latest add @ballmac-pro/${sampleItem}`} copy={`npx shadcn@latest add @ballmac-pro/${sampleItem}`} />
            <p className="text-muted-foreground text-sm">Every Pro page shows its own command, and you can read and copy the code on the page while you are logged in.</p>
          </Step>
        </ol>
      </TabsContent>

      <TabsContent value="mcp">
        <ol className="space-y-6">
          <Step n={1} title="Give your agent the Ballmac MCP server">
            <Snippet title="Claude Code" shown={masked.claudeCode} copy={real.claudeCode} />
            <Snippet title="Cursor, Claude Desktop and others (mcp.json)" shown={masked.mcpJson} copy={real.mcpJson} />
          </Step>
          <Step n={2} title="Ask for what you need">
            <p className="text-muted-foreground text-sm">
              Try &ldquo;add a Pro pricing section to this page&rdquo;. The agent reads the Pro item and runs the right install command.
            </p>
          </Step>
        </ol>
      </TabsContent>

      <TabsContent value="starter">
        <ol className="space-y-6">
          <Step n={1} title="Download and run a starter app">
            <Snippet shown={masked.starter("beacon-saas")} copy={real.starter("beacon-saas")} />
            <p className="text-muted-foreground text-sm">Swap the name for <code className="font-mono text-[13px]">quire-ai</code> to get Quire. You can also download either as a zip below.</p>
          </Step>
          <Step n={2} title="Make it yours">
            <p className="text-muted-foreground text-sm">It runs on an embedded database in development, so there is nothing else to install. The README covers customising it, billing and deployment.</p>
          </Step>
        </ol>
      </TabsContent>
    </Tabs>
  )
}
