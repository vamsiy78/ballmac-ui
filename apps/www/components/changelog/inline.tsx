import type { ReactNode } from "react"

import Link from "@/components/site/link"

/** Renders the two inline forms a changelog bullet may hold: [text](link) and `code`. Everything else is text. */
export function Inline({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[3] !== undefined) parts.push(<code key={m.index}>{m[3]}</code>)
    else {
      const href = m[2]!
      const label = m[1]!.replace(/`([^`]+)`/g, "$1")
      parts.push(
        href.startsWith("/") ? (
          <Link key={m.index} href={href}>
            {label}
          </Link>
        ) : (
          <a key={m.index} href={href}>
            {label}
          </a>
        )
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
