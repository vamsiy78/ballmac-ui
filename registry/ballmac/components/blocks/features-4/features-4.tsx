// Ballmac UI: Features 4. https://ui.ballmac.com/blocks/features-4
import * as React from "react"
import { Bell, Check, Cloud, Command, Keyboard, Laptop, Lock, MenuSquare, Smartphone, WifiOff } from "lucide-react"

import { BentoCard, BentoGrid } from "@/components/ballmac/bento-grid"
import { Kbd, KbdGroup } from "@/components/ballmac/kbd"
import { cn } from "@/lib/utils"

type Features4Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Small label above the heading. */
  eyebrow?: string
  /** The heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
}

function Visual({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("absolute inset-0 flex items-start justify-center p-6", className)}>{children}</div>
}

/** A menu bar with the app's popover open. */
function MenuBarVisual() {
  return (
    <Visual className="pt-5">
      <div className="w-full max-w-md">
        <div className="flex h-7 items-center justify-end gap-3 rounded-lg border bg-muted/60 px-3 text-[11px] text-muted-foreground">
          <span className="rounded bg-foreground/10 p-0.5 text-foreground">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span>Tue 9:41</span>
        </div>
        <div className="mt-2 ms-auto w-60 rounded-xl border bg-card p-2 text-start text-xs shadow-[0_12px_30px_-12px_rgb(0_0_0/0.35)]">
          {["Reply to beta feedback", "Notarize the build", "Schedule the announcement"].map((t, i) => (
            <div key={t} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5", i === 0 && "bg-accent")}>
              <span className="size-3 rounded-full border border-muted-foreground/50" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </Visual>
  )
}

function ShortcutVisual() {
  return (
    <Visual className="flex-col items-center gap-2.5 pt-8">
      {[
        { keys: ["⌘", "N"], label: "New task" },
        { keys: ["⌘", "K"], label: "Jump anywhere" },
      ].map((s) => (
        <div key={s.label} className="flex w-52 items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
          <span className="text-muted-foreground">{s.label}</span>
          <KbdGroup>
            {s.keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </KbdGroup>
        </div>
      ))}
    </Visual>
  )
}

function PrivacyVisual() {
  return (
    <Visual className="pt-9">
      <div className="relative flex size-20 items-center justify-center rounded-3xl border bg-card shadow-[0_12px_30px_-14px_rgb(0_0_0/0.4)]">
        <Lock className="size-8" aria-hidden="true" />
        <span className="absolute -end-2 -bottom-2 flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground">
          <WifiOff className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </Visual>
  )
}

function SyncVisual() {
  return (
    <Visual className="items-center gap-4 pt-10">
      <span className="flex size-12 items-center justify-center rounded-2xl border bg-card">
        <Laptop className="size-6" aria-hidden="true" />
      </span>
      <span className="flex items-center gap-1 text-primary" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
        <Cloud className="mx-1 size-5" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" style={{ animationDelay: `${(i + 3) * 200}ms` }} />
        ))}
      </span>
      <span className="flex size-12 items-center justify-center rounded-2xl border bg-card">
        <Smartphone className="size-6" aria-hidden="true" />
      </span>
    </Visual>
  )
}

function NotificationVisual() {
  return (
    <Visual className="pt-5">
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-x-4 -bottom-2 h-full rounded-2xl border bg-card/60" />
        <div className="relative flex items-start gap-3 rounded-2xl border bg-card/95 p-3 text-start shadow-[0_12px_30px_-14px_rgb(0_0_0/0.4)] backdrop-blur">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
          </span>
          <div className="min-w-0 text-xs">
            <p className="flex justify-between gap-2 font-semibold">
              Due in 15 minutes <span className="font-normal text-muted-foreground">now</span>
            </p>
            <p className="mt-0.5 truncate text-muted-foreground">Schedule the announcement for 9:00</p>
          </div>
        </div>
      </div>
    </Visual>
  )
}

function Features4({
  eyebrow = "Built for the Mac",
  title = "Feels like it came with your Mac.",
  description = "Native shortcuts, a menu bar companion and notifications that respect Focus. No account, no tracking.",
  className,
  ...props
}: Features4Props) {
  return (
    <section data-slot="features-4" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">{title}</h2>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p>
      </div>
      <BentoGrid columns={3} rowHeight="17rem" className="mt-14">
        <BentoCard colSpan={2} icon={<MenuSquare />} title="Lives in your menu bar" description="Add and check off tasks from any app, without switching windows." background={<MenuBarVisual />} />
        <BentoCard icon={<Keyboard />} title="Keyboard for everything" description="Every action has a shortcut you can change." background={<ShortcutVisual />} />
        <BentoCard icon={<Lock />} title="Private by design" description="Your tasks stay on your devices. No account required." background={<PrivacyVisual />} />
        <BentoCard icon={<Cloud />} title="Syncs through iCloud" description="Mac, iPhone and iPad stay in step, end to end encrypted." background={<SyncVisual />} />
        <BentoCard icon={<Bell />} title="Reminders that respect Focus" description="Notifications arrive when you want them, never during a meeting." background={<NotificationVisual />} />
      </BentoGrid>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Command className="size-3.5" aria-hidden="true" /> Universal app for Apple silicon and Intel
      </p>
    </section>
  )
}

export { Features4, type Features4Props }
