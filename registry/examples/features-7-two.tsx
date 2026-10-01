import { Moon, Sun } from "lucide-react"

import { Features7 } from "@/components/ballmac/blocks/features-7/features-7"

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-popover w-[19rem] max-w-full overflow-hidden rounded-2xl border shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)]">
      <div className="border-b px-4 py-2.5 text-xs font-semibold">{title}</div>
      <div className="p-4 text-sm">{children}</div>
    </div>
  )
}

export default function Features7Two() {
  return (
    <Features7
      eyebrow="Nightfall"
      title="Your Mac, easier on the eyes."
      description="A tiny menu bar app that shifts your display warm in the evening."
      time="Thu 9:12 PM"
      features={[
        { id: "schedule", title: "Sunset schedule", description: "Colors warm up automatically at dusk and return at dawn.", icon: <Moon />, panel: <Panel title="Schedule"><p>Warmer at <b>7:42 PM</b></p><p className="text-muted-foreground mt-1">Back to normal at 6:58 AM</p></Panel> },
        { id: "now", title: "Pause for an hour", description: "Doing color-sensitive work? Pause it for an hour with one click.", keys: ["⌥", "P"], icon: <Sun />, panel: <Panel title="Paused"><p>Back on at <b>10:12 PM</b></p></Panel> },
      ]}
    />
  )
}
