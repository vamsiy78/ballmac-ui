import { DocsSidebar } from "@/components/site/docs-sidebar"

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[200px_1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <DocsSidebar />
        </div>
      </aside>
      {children}
    </div>
  )
}
