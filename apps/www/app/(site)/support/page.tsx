import { BookOpen, Github, KeyRound, Mail } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { SupportForm } from "@/components/support/support-form"
import Link from "@/components/site/link"

export const metadata: Metadata = {
  title: "Support",
  description: "Report a bug, ask for help, sort out a licence or purchase, or suggest a block. Ballmac UI support answers by email.",
  alternates: { canonical: "/support" },
}

// The public address; it forwards to a private inbox, so the real one is never shown.
const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@ballmac.com"

const links = [
  { href: "/docs/installation", label: "Installation guide", note: "Set up the CLI and your first component", icon: BookOpen },
  { href: "/docs/pro", label: "Pro setup", note: "Licence key, registry and troubleshooting", icon: KeyRound },
  { href: "https://github.com/vamsiy78/ballmac-ui/issues", label: "Public issues", note: "Open bugs and requests on GitHub", icon: Github },
]

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <header className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Support</p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">How can we help?</h1>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed text-pretty">
              Report a bug, ask a question, sort out a licence or a purchase, or tell us what to build next. A person reads every message and answers by email.
            </p>
          </div>
          <ul className="divide-y rounded-2xl border">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:bg-accent/50 focus-visible:ring-ring/50 flex items-center gap-3.5 p-4 outline-none transition-colors first:rounded-t-2xl last:rounded-b-2xl focus-visible:ring-[3px] focus-visible:ring-inset">
                  <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg" aria-hidden="true">
                    <l.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{l.label}</span>
                    <span className="text-muted-foreground block text-[13px] leading-5">{l.note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground flex items-start gap-2.5 text-sm leading-6">
            <Mail className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>
              Prefer email? Write to{" "}
              <a href={`mailto:${email}`} className="text-foreground font-medium underline underline-offset-4">
                {email}
              </a>
              .
            </span>
          </p>
        </header>
        <Suspense fallback={<div className="bg-muted/40 h-[40rem] animate-pulse rounded-2xl" />}>
          <SupportForm email={email} />
        </Suspense>
      </div>
    </div>
  )
}
