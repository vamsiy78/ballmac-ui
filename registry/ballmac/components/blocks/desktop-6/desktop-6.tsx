// Ballmac UI: Desktop 6. https://ui.ballmac.com/blocks/desktop-6
"use client"

import * as React from "react"
import { Check, ChevronLeft, Copy, Info, Sparkles } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

type Desktop6Acknowledgement = { name: string; license: string; href?: string }

type Desktop6Props = Omit<React.ComponentProps<"div">, "children"> & {
  /** Which platform the window handles like. Defaults to the page's feel. */
  feel?: FeelId
  /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
  frame?: boolean
  appName?: string
  version?: string
  /** The build number, shown in brackets after the version as macOS does. */
  build?: string
  /** The app icon. A generated one is drawn when you leave it out. */
  icon?: React.ReactNode
  /** One line about the app. */
  tagline?: string
  copyright?: string
  /** Links under the version: website, privacy policy, support. */
  links?: { label: string; href: string }[]
  /** Open-source software the app includes, listed under Acknowledgements. */
  acknowledgements?: Desktop6Acknowledgement[]
  /** Called by "Check for updates". Leave it out to hide the button. */
  onCheckForUpdates?: () => void
  /** Called by OK (Windows) and the close button. */
  onClose?: () => void
}

const sampleAck: Desktop6Acknowledgement[] = [
  { name: "Tauri", license: "MIT or Apache-2.0", href: "https://github.com/tauri-apps/tauri" },
  { name: "React", license: "MIT", href: "https://github.com/facebook/react" },
  { name: "Radix UI", license: "MIT", href: "https://github.com/radix-ui/primitives" },
  { name: "Lucide", license: "ISC", href: "https://github.com/lucide-icons/lucide" },
  { name: "Ballmac UI", license: "MIT", href: "https://ui.ballmac.com" },
]

function AppIcon({ icon, className }: { icon?: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-primary to-primary/70 text-primary-foreground flex shrink-0 items-center justify-center rounded-[22%] bg-linear-to-b shadow-[0_2px_6px_rgb(0_0_0/0.18),inset_0_1px_0_rgb(255_255_255/0.25)] [&_svg]:size-1/2",
        className
      )}
    >
      {icon ?? <Sparkles />}
    </span>
  )
}

/**
 * The About window: icon, name, version and build (with a button that copies them for a support email), copyright, links,
 * acknowledgements for the open-source software inside, and Check for updates. Small and centered on macOS, a dialog with OK on Windows.
 */
function Desktop6({
  feel: feelProp,
  frame = true,
  appName = "Acme",
  version = "2.4.1",
  build = "241",
  icon,
  tagline = "Notes that stay out of your way.",
  copyright = "© 2026 Acme, Inc. All rights reserved.",
  links = [
    { label: "Website", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Support", href: "#" },
  ],
  acknowledgements = sampleAck,
  onCheckForUpdates,
  onClose,
  className,
  ...props
}: Desktop6Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const win = feel === "windows"
  const mac = feel === "macos"
  const id = React.useId()
  const [view, setView] = React.useState<"about" | "acknowledgements">("about")
  const [copied, setCopied] = React.useState(false)
  const versionText = build ? `Version ${version} (${build})` : `Version ${version}`
  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(`${appName} ${versionText}`)
      setCopied(true)
    } catch {}
  }
  const t = (macText: string, other: string) => (mac ? macText : other)

  const about = (
    <div className={cn("flex flex-1 flex-col gap-4 p-6", mac ? "items-center text-center" : "")}>
      <div className={cn("flex gap-4", mac ? "flex-col items-center" : "items-center")}>
        <AppIcon icon={icon} className={mac ? "size-20" : "size-14"} />
        <div>
          <h2 id={`${id}-title`} className={cn("font-semibold", mac ? "text-base" : "text-lg")}>
            {appName}
          </h2>
          <div className={cn("mt-0.5 flex items-center gap-1", mac && "justify-center")}>
            <p className="text-muted-foreground text-xs tabular-nums select-text">{versionText}</p>
            <Button variant="ghost" size="icon-sm" className="size-6 [&_svg]:size-3" onClick={copy} aria-label={copied ? "Version copied" : "Copy version"}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
      {tagline ? <p className="text-[13px] text-pretty">{tagline}</p> : null}
      {links.length ? (
        <nav aria-label={`About ${appName}`} className={cn("flex flex-wrap gap-x-4 gap-y-1", mac && "justify-center")}>
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="text-primary rounded-sm text-[13px] underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}
      <div className="flex-1" />
      <div className={cn("flex flex-wrap items-center gap-2", mac ? "justify-center" : "")}>
        {acknowledgements.length ? (
          <Button variant="outline" size="sm" onClick={() => setView("acknowledgements")}>
            {t("Acknowledgements", "Third-party notices")}
          </Button>
        ) : null}
        {onCheckForUpdates ? (
          <Button variant="outline" size="sm" onClick={onCheckForUpdates}>
            {t("Check for Updates…", "Check for updates")}
          </Button>
        ) : null}
        {win ? (
          <Button size="sm" className="ms-auto min-w-20" onClick={onClose}>
            OK
          </Button>
        ) : null}
      </div>
      {copyright ? <p className="text-muted-foreground text-[11px]">{copyright}</p> : null}
      <p aria-live="polite" className="sr-only">
        {copied ? "Version copied" : ""}
      </p>
    </div>
  )

  const acks = (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setView("about")} className="ps-1.5">
          <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
          Back
        </Button>
        <h2 id={`${id}-title`} className="text-sm font-semibold">
          {t("Acknowledgements", "Third-party notices")}
        </h2>
      </div>
      <p className="text-muted-foreground px-1 text-xs text-pretty">{appName} is built with open-source software. Thank you to everyone who works on it.</p>
      <ul tabIndex={0} aria-label={t("Acknowledgements", "Third-party notices")} className="bg-background min-h-0 flex-1 divide-y overflow-y-auto rounded-md border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {acknowledgements.map((a) => (
          <li key={a.name} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
            {a.href ? (
              <a href={a.href} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "link" }), "h-auto px-0 text-[13px] font-medium")}>
                {a.name}
              </a>
            ) : (
              <span className="font-medium">{a.name}</span>
            )}
            <span className="text-muted-foreground text-xs">{a.license}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const content = view === "about" ? about : acks
  if (!frame)
    return (
      <div data-slot="desktop-6" data-feel={feelProp} role="region" aria-labelledby={`${id}-title`} className={cn("flex flex-col", className)} {...props}>
        {content}
      </div>
    )
  return (
    <AppWindow
      data-slot="desktop-6"
      feel={feel}
      onClose={onClose}
      role="region"
      aria-labelledby={`${id}-title`}
      className={cn(mac ? "h-[24rem] w-full max-w-[19rem]" : "h-[22rem] w-full max-w-md", className)}
      {...props}
    >
      <AppWindowTitleBar title={win ? `About ${appName}` : ""} icon={<Info />} className="border-b-0" />
      <AppWindowContent className="flex flex-col">{content}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop6, type Desktop6Props, type Desktop6Acknowledgement }
