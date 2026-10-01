"use client"

import { GitGraph, type GitCommit } from "@/components/ballmac/git-graph"

const commits: GitCommit[] = [
  { hash: "e91c0a7", parents: ["b72d4f1", "5a8e3c9"], message: "Merge branch 'feature/search' into main", author: "Priya", date: "2026-09-29T16:20:00Z", branches: ["main"] },
  { hash: "5a8e3c9", parents: ["c04b11d"], message: "Add fuzzy matching to search results", author: "Marco", date: "2026-09-29T14:02:00Z", branches: ["feature/search"] },
  { hash: "b72d4f1", parents: ["9f3e2a8"], message: "Fix off-by-one in pagination", author: "Priya", date: "2026-09-28T18:44:00Z", tags: ["v2.4.1"] },
  { hash: "c04b11d", parents: ["9f3e2a8"], message: "Index titles and descriptions", author: "Marco", date: "2026-09-27T11:15:00Z" },
  { hash: "9f3e2a8", parents: ["1d7a6b0", "ae52f84"], message: "Merge branch 'hotfix/login' into main", author: "Sam", date: "2026-09-26T09:30:00Z" },
  { hash: "ae52f84", parents: ["1d7a6b0"], message: "Expire stale login sessions", author: "Sam", date: "2026-09-25T20:05:00Z", branches: ["hotfix/login"] },
  { hash: "1d7a6b0", parents: ["03f95de"], message: "Release 2.4.0", author: "Priya", date: "2026-09-24T12:00:00Z", tags: ["v2.4.0"] },
  { hash: "03f95de", parents: [], message: "Initial commit", author: "Priya", date: "2026-09-10T08:00:00Z" },
]

export default function GitGraphDemo() {
  return (
    <div className="w-full max-w-2xl">
      <GitGraph commits={commits} defaultSelected="e91c0a7" />
    </div>
  )
}
