"use client"

import { FileCode2 } from "lucide-react"

import { ArtifactPanel } from "@/components/ballmac/artifact-panel"

const code = `export function Counter() {
  const [n, setN] = useState(0)
  return (
    <button onClick={() => setN(n + 1)}>
      Clicked {n} times
    </button>
  )
}`

export default function ArtifactPanelDemo() {
  return (
    <div className="h-[20rem] w-full max-w-xl">
      <ArtifactPanel
        className="h-full"
        title="Counter button"
        kind="React component"
        icon={<FileCode2 />}
        code={code}
        filename="counter.tsx"
        language="tsx"
        versions={3}
        onClose={() => {}}
      >
        <div className="flex h-full min-h-48 items-center justify-center">
          <span className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium shadow-xs">Clicked 0 times</span>
        </div>
      </ArtifactPanel>
    </div>
  )
}
