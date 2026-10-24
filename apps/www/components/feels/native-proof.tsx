"use client"

import * as React from "react"
import { ArrowRight, Check, Keyboard, MousePointerClick, ToggleRight } from "lucide-react"
import { FEELS, type FeelId } from "@ballmac-ui/theme-engine"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { MiniApp } from "@/components/themes/feel-compare"
import { detectFeel } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

type Target = Exclude<FeelId, "web">

const subscribeNever = () => () => {}
const px = (v: string) => (v.startsWith("calc(var(--spacing) * ") ? Number.parseFloat(v.slice(22)) * 4 : v.endsWith("rem") ? Number.parseFloat(v) * 16 : Number.parseFloat(v))
const feel = (id: FeelId) => FEELS.find((f) => f.slug === id)!

/** The tells that make a web app read as a web app, each measured from the same values the components use. */
function tells(target: Target) {
  const w = feel("web")
  const n = feel(target)
  return [
    { label: "Controls", web: `${px(w.tokens.control.h)} px`, native: `${px(n.tokens.control.h)} px`, note: target === "ios" ? "thumb-sized targets" : "sized like the system's own" },
    { label: "Body text", web: `${px(w.tokens.text.sm[0])} px`, native: `${px(n.tokens.text.sm[0])} px`, note: "the platform's reading size" },
    { label: "Corners", web: `${Number((w.spec.radius * 16).toFixed(1))} px`, native: `${Number((n.spec.radius * 16).toFixed(1))} px`, note: "how round the platform draws" },
    { label: "Focus ring", web: `${w.tokens.focus.width} halo`, native: `${n.tokens.focus.width} ${target === "windows" ? "solid outline" : "halo"}`, note: "what keyboard users see" },
    { label: "Menu rows", web: `${px(w.tokens.menu.itemH)} px`, native: `${px(n.tokens.menu.itemH)} px`, note: n.tokens.material.blur !== "0px" ? "frosted, like system menus" : "flat, like system menus" },
    { label: "Window controls", web: "None", native: n.controls === "left" ? "Left, traffic lights" : n.controls === "right" ? "Right, caption buttons" : "None, it is a phone", note: "real title-bar chrome" },
  ]
}

const WHERE: Record<Target, string> = { macos: "your Mac", windows: "your PC", ios: "your phone" }

/**
 * The hook: the same small app twice, once as a typical web app and once with a platform feel (the viewer's own platform to begin with), side by side.
 * People feel the difference by using it, so there is a three-step "try it", and the first real interaction opens the next step (`reveal`), where the
 * page turns the proof into a purchase. `cta` is rendered by the server page, so the offer and checkout link stay on the server.
 */
export function NativeProof({ reveal, className }: { reveal?: React.ReactNode; className?: string }) {
  // The server cannot know the visitor's device, so it draws macOS; the browser then switches to the device's own feel.
  const detected = React.useSyncExternalStore(subscribeNever, () => detectFeel(), () => "macos" as FeelId)
  const [picked, setPicked] = React.useState<Target | null>(null)
  const target: Target = picked ?? (detected === "web" ? "macos" : detected)
  const [engaged, setEngaged] = React.useState(false)
  const rows = tells(target).filter((r) => r.web !== r.native)
  const n = feel(target)

  // Any real use of either app counts: a key press, a click, a tap.
  const engage = () => setEngaged(true)

  return (
    <div className={cn("grid min-w-0 gap-8 [&>*]:min-w-0", className)} onKeyDownCapture={engage} onPointerDownCapture={engage}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {picked ? `Showing the ${n.title} feel.` : detected !== "web" ? `Matched to ${WHERE[target]}.` : "Pick a platform."}
        </p>
        <SegmentedControl aria-label="Platform to compare" value={target} onValueChange={(v) => setPicked(v as Target)}>
          {FEELS.filter((f) => f.slug !== "web").map((f) => (
            <SegmentedControlItem key={f.slug} value={f.slug}>
              {f.title}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6 [&>*]:min-w-0">
        {(["web", target] as const).map((id) => (
          <figure key={id} className="grid min-w-0 gap-3">
            <div data-feel={id} className="bg-muted/40 relative isolate overflow-hidden rounded-3xl border p-4 sm:p-8">
              <div aria-hidden="true" className="bm-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
              <div className="mx-auto max-w-md">
                <MiniApp feel={id} />
              </div>
            </div>
            <figcaption className="flex items-baseline justify-between gap-3 px-1">
              <span className="text-sm font-semibold">{id === "web" ? "A typical web app" : `The same app, ${n.title} feel`}</span>
              <span className="text-muted-foreground text-xs">{id === "web" ? "shadcn defaults" : "one setting"}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <ol className="grid gap-2.5 text-sm sm:grid-cols-3" aria-label="Try it">
        {[
          { icon: Keyboard, text: "Press Tab in each app and watch the focus ring." },
          { icon: MousePointerClick, text: "Click through the sidebar, then compare the selected row." },
          { icon: ToggleRight, text: "Flip Sync and resize your eyes to the menu rows." },
        ].map(({ icon: Icon, text }, i) => (
          <li key={text} className="bg-card flex items-start gap-3 rounded-xl border p-3.5">
            <span className="bg-foreground/[0.07] flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <span className="text-muted-foreground leading-snug">
              <Icon className="mr-1.5 -mt-0.5 inline size-3.5" aria-hidden="true" />
              {text}
            </span>
          </li>
        ))}
      </ol>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Typical web app compared with the {n.title} feel</caption>
          <thead className="bg-muted/50 text-muted-foreground text-xs">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">What you notice</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Typical web app</th>
              <th scope="col" className="px-4 py-2.5 font-medium">{n.title} feel</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Why it reads native</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="px-4 py-3 font-medium">{r.label}</th>
                <td className="text-muted-foreground px-4 py-3 tabular-nums">{r.web}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{r.native}</td>
                <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The next step opens once they have used the apps; before that it is a quiet hint, so nobody is pushed to buy before they have felt anything. */}
      <div aria-live="polite" className="min-w-0">
        {engaged && reveal ? (
          <div className="min-w-0 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">{reveal}</div>
        ) : reveal ? (
          <p className="text-muted-foreground flex items-center justify-center gap-2 text-center text-sm">
            <Check className="size-3.5" aria-hidden="true" /> Use either app, then see how to ship this. <ArrowRight className="size-3.5" aria-hidden="true" />
          </p>
        ) : null}
      </div>
    </div>
  )
}
