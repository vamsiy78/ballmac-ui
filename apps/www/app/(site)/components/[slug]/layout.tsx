import { DocsShell } from "@/components/site/docs-shell"

export default function ComponentLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
