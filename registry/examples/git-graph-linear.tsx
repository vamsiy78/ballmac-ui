"use client"

import * as React from "react"

import { GitGraph, type GitCommit } from "@/components/ballmac/git-graph"

const commits: GitCommit[] = [
  { hash: "7c1a90e", parents: ["2b8d3f4"], message: "Bump dependencies", author: "Sam", date: "2026-09-30T08:10:00Z", branches: ["main"] },
  { hash: "2b8d3f4", parents: ["f60e1c2"], message: "Add dark mode to settings", author: "Marco", date: "2026-09-29T17:25:00Z" },
  { hash: "f60e1c2", parents: ["a49d7b5"], message: "Refactor billing hooks", author: "Priya", date: "2026-09-29T10:02:00Z" },
  { hash: "a49d7b5", parents: [], message: "Set up the project", author: "Priya", date: "2026-09-28T09:00:00Z" },
]

export default function GitGraphLinear() {
  const [hash, setHash] = React.useState<string>()
  const chosen = commits.find((c) => c.hash === hash)
  return (
    <div className="grid w-full max-w-xl gap-3">
      <GitGraph commits={commits} selected={hash} onSelect={setHash} hideAuthors />
      <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground" aria-live="polite">
        {chosen ? (
          <>
            Selected <code className="font-mono text-foreground">{chosen.hash}</code> by {chosen.author}
          </>
        ) : (
          "Select a commit with the mouse or the arrow keys and Enter."
        )}
      </p>
    </div>
  )
}
