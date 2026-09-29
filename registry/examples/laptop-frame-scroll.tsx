import { LaptopFrame } from "@/components/ballmac/laptop-frame"

const code = [
  ["kw", "export default async function ", "fn", "handler", "tx", "(req) {"],
  ["tx", "  const ", "fn", "session", "tx", " = await auth(req)"],
  ["tx", "  if (!session) ", "kw", "return ", "tx", "unauthorized()"],
  ["tx", "", "tx", "", "tx", ""],
  ["tx", "  const ", "fn", "usage", "tx", " = await meter.read(session.org)"],
  ["kw", "  return ", "tx", "Response.json({ usage, ", "fn", "plan: session.plan })"],
  ["tx", "}", "tx", "", "tx", ""],
]

const color = { kw: "text-chart-4", fn: "text-chart-1", tx: "text-foreground" } as const

function Editor() {
  return (
    <div className="flex size-full flex-col bg-background font-mono text-[13px] text-foreground">
      <div className="flex h-8 shrink-0 items-center gap-4 border-b bg-card px-4 text-[11px] text-muted-foreground">
        <span className="text-foreground">route.ts</span>
        <span>auth.ts</span>
        <span>meter.ts</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-40 shrink-0 space-y-1.5 border-r bg-card/60 p-3 text-[11px] text-muted-foreground">
          <p className="text-foreground">app</p>
          <p className="pl-3">api</p>
          <p className="pl-6 text-foreground">route.ts</p>
          <p className="pl-3">lib</p>
          <p className="pl-6">auth.ts</p>
          <p className="pl-6">meter.ts</p>
        </div>
        <div className="flex-1 p-4 leading-7">
          {code.map((row, i) => (
            <div key={i} className="flex gap-5 whitespace-pre">
              <span className="w-4 text-right text-muted-foreground/60 tabular-nums">{i + 1}</span>
              <span>
                {[0, 2, 4].map((j) => (
                  <span key={j} className={color[row[j] as keyof typeof color]}>
                    {row[j + 1]}
                  </span>
                ))}
              </span>
            </div>
          ))}
          <div className="mt-6 rounded-md border bg-card p-3 text-[12px] text-muted-foreground">
            <span className="text-chart-2">✓</span> Compiled in 212 ms · 0 type errors
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LaptopFrameScroll() {
  return (
    <div className="w-full max-w-xl px-2 py-6">
      <LaptopFrame variant="midnight" screenWidth={860} openAnimation="scroll" screenClassName="dark">
        <Editor />
      </LaptopFrame>
    </div>
  )
}
