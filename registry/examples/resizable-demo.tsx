import { FileCode2, Folder, TerminalSquare } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ballmac/resizable";
const files = ["app/page.tsx", "app/layout.tsx", "lib/utils.ts", "package.json"];
export default function ResizableDemo() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-80 w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-sm">
      <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
        <div className="h-full p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Folder aria-hidden="true" className="size-3.5" /> Explorer
          </p>
          <ul className="grid gap-0.5 text-sm">
            {files.map((f, i) => (
              <li key={f} className={`truncate rounded-md px-2 py-1 ${i === 0 ? "bg-accent font-medium" : "text-muted-foreground"}`}>{f}</li>
            ))}
          </ul>
        </div>
      </ResizablePanel>
      <ResizableHandle label="Resize explorer" withHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={58} minSize={30}>
            <div className="h-full p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FileCode2 aria-hidden="true" className="size-3.5" /> app/page.tsx
              </p>
              <pre className="font-mono text-xs leading-relaxed text-muted-foreground">
{`export default function Page() {
  return <main>Hello, Acme</main>
}`}
              </pre>
            </div>
          </ResizablePanel>
          <ResizableHandle label="Resize terminal" withHandle />
          <ResizablePanel defaultSize={42} minSize={15}>
            <div className="h-full bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
              <p className="mb-1 flex items-center gap-2 font-sans font-medium">
                <TerminalSquare aria-hidden="true" className="size-3.5" /> Terminal
              </p>
              <p>$ pnpm dev</p>
              <p>ready on http://localhost:3000</p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
