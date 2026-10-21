/** Dedicated partner workspace: product navigation stays focused while the public program retains the main site chrome. */
export default function PartnerWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <main className="flex-1">{children}</main>
      <footer className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 border-t px-4 py-6 text-xs text-muted-foreground sm:px-8">
        <span>
          Ballmac UI <span aria-hidden="true">/</span> Partner program
        </span>
        <nav aria-label="Workspace resources" className="flex gap-5">
          <a href="/affiliates#program-terms" className="hover:text-foreground focus-visible:outline-ring">
            Terms & privacy
          </a>
          <a href="/support" className="hover:text-foreground focus-visible:outline-ring">
            Partner support
          </a>
        </nav>
      </footer>
    </div>
  )
}
