// Ballmac UI: Settings 2. https://ui.ballmac.com/blocks/settings-2
"use client"

import * as React from "react"
import { BellRing, Check, Moon } from "lucide-react"

import { Input } from "@/components/ballmac/input"
import { Switch } from "@/components/ballmac/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ballmac/toggle-group"
import { cn } from "@/lib/utils"

type Settings2Channel = "email" | "push" | "inApp"

type Settings2Event = {
  id: string
  label: string
  description: string
}

type Settings2Values = {
  digest: string
  events: Record<string, Record<Settings2Channel, boolean>>
  quiet: { enabled: boolean; from: string; to: string; days: string[] }
}

type Settings2Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** Things people can be notified about. */
  events?: Settings2Event[]
  /** Starting values. */
  defaultValues?: Partial<Settings2Values>
  /** Called after every change, with all values. Changes save instantly, so there is no Save button. */
  onChange?: (values: Settings2Values) => void | Promise<void>
}

const channels: { id: Settings2Channel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
  { id: "inApp", label: "In-app" },
]

const digests = [
  { id: "realtime", label: "Real time", description: "An email as things happen" },
  { id: "daily", label: "Daily", description: "One summary each morning" },
  { id: "weekly", label: "Weekly", description: "A Monday recap" },
  { id: "never", label: "Never", description: "Only what you turned on below" },
]

const days = [
  ["mon", "M", "Monday"],
  ["tue", "T", "Tuesday"],
  ["wed", "W", "Wednesday"],
  ["thu", "T", "Thursday"],
  ["fri", "F", "Friday"],
  ["sat", "S", "Saturday"],
  ["sun", "S", "Sunday"],
] as const

const defaultEvents: Settings2Event[] = [
  { id: "mentions", label: "Mentions", description: "Someone @mentions you" },
  { id: "comments", label: "Comments", description: "Replies on things you own or follow" },
  { id: "assignments", label: "Assignments", description: "You are assigned a task" },
  { id: "invoices", label: "Invoices paid", description: "A customer pays an invoice" },
  { id: "product", label: "Product news", description: "New features and tips" },
]

function initialEvents(events: Settings2Event[]) {
  return Object.fromEntries(
    events.map((e, i) => [e.id, { email: i !== 4, push: i < 3, inApp: true }])
  ) as Settings2Values["events"]
}

function Settings2({
  title = "Notifications",
  description = "Choose what you hear about and where. Changes save as you make them.",
  events = defaultEvents,
  defaultValues,
  onChange,
  className,
  ...props
}: Settings2Props) {
  const [values, setValues] = React.useState<Settings2Values>({
    digest: "daily",
    events: initialEvents(events),
    quiet: { enabled: true, from: "22:00", to: "07:00", days: ["mon", "tue", "wed", "thu", "fri"] },
    ...defaultValues,
  })
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
  const quietId = React.useId()

  function commit(next: Settings2Values) {
    setValues(next)
    setStatus("saving")
    Promise.resolve(onChange ? onChange(next) : new Promise((r) => setTimeout(r, 350)))
      .then(() => setStatus("saved"))
      .catch(() => setStatus("error"))
  }
  const toggle = (event: string, channel: Settings2Channel, on: boolean) =>
    commit({ ...values, events: { ...values.events, [event]: { ...values.events[event], [channel]: on } } })

  return (
    <section data-slot="settings-2" className={cn("mx-auto w-full max-w-4xl px-4 py-8 sm:px-6", className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <p role="status" className="text-muted-foreground flex h-6 items-center gap-1.5 text-sm">
          {status === "saving" && "Saving…"}
          {status === "saved" && <><Check className="text-chart-2 size-4" aria-hidden="true" />Saved</>}
          {status === "error" && <span className="text-destructive">Couldn’t save. Try again.</span>}
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <fieldset>
          <legend className="text-sm font-semibold">Email digest</legend>
          <p className="text-muted-foreground mt-1 text-sm">How often you get a summary of activity.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {digests.map((d) => {
              const on = values.digest === d.id
              return (
                <label key={d.id} className="relative cursor-pointer">
                  <input type="radio" name="digest" value={d.id} checked={on} onChange={() => commit({ ...values, digest: d.id })} className="peer sr-only" />
                  <span className="peer-focus-visible:ring-ring/50 peer-checked:border-foreground peer-checked:bg-accent/60 hover:bg-accent/40 bg-card flex h-full flex-col rounded-2xl border p-4 transition-colors peer-focus-visible:ring-[3px]">
                    <span className="flex items-center justify-between text-sm font-medium">
                      {d.label}
                      <span aria-hidden="true" className={cn("flex size-4 items-center justify-center rounded-full border", on && "bg-foreground text-background border-transparent")}>{on && <Check className="size-3" />}</span>
                    </span>
                    <span className="text-muted-foreground mt-1 text-xs">{d.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><BellRing className="size-4" aria-hidden="true" />What to notify me about</h3>
          <p className="text-muted-foreground mt-1 text-sm">Turn on each place you want to hear about it.</p>

          {/* Tablets and up: a grid with one switch per event and channel. */}
          <div className="bg-card mt-4 hidden overflow-hidden rounded-2xl border sm:block">
            <table className="w-full text-start text-sm">
              <caption className="sr-only">Notification channels for each event</caption>
              <thead>
                <tr className="text-muted-foreground bg-muted/40 border-b text-xs">
                  <th scope="col" className="px-5 py-3 font-medium">Event</th>
                  {channels.map((c) => <th key={c.id} scope="col" className="w-24 px-3 py-3 text-center font-medium">{c.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((e) => (
                  <tr key={e.id}>
                    <th scope="row" className="px-5 py-4 font-normal">
                      <span className="block font-medium">{e.label}</span>
                      <span className="text-muted-foreground block text-xs">{e.description}</span>
                    </th>
                    {channels.map((c) => (
                      <td key={c.id} className="px-3 py-4 text-center">
                        <Switch aria-label={`${e.label} by ${c.label}`} checked={values.events[e.id]?.[c.id] ?? false} onCheckedChange={(on) => toggle(e.id, c.id, on)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: one card per event with its three switches. */}
          <ul className="mt-4 space-y-3 sm:hidden">
            {events.map((e) => (
              <li key={e.id} className="bg-card rounded-2xl border p-4">
                <p className="text-sm font-medium">{e.label}</p>
                <p className="text-muted-foreground text-xs">{e.description}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {channels.map((c) => (
                    <label key={c.id} className="flex flex-col items-center gap-2 rounded-xl border py-2.5 text-xs">
                      {c.label}
                      <Switch aria-label={`${e.label} by ${c.label}`} checked={values.events[e.id]?.[c.id] ?? false} onCheckedChange={(on) => toggle(e.id, c.id, on)} />
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Moon className="size-4" aria-hidden="true" />Quiet hours</h3>
              <p id={`${quietId}-d`} className="text-muted-foreground mt-1 text-sm">Pause push notifications at night and on days off.</p>
            </div>
            <Switch aria-label="Quiet hours" aria-describedby={`${quietId}-d`} checked={values.quiet.enabled} onCheckedChange={(enabled) => commit({ ...values, quiet: { ...values.quiet, enabled } })} />
          </div>
          <div className={cn("mt-5 grid gap-5 transition-opacity duration-200 motion-reduce:transition-none", !values.quiet.enabled && "pointer-events-none opacity-50")} aria-disabled={!values.quiet.enabled}>
            <div className="grid max-w-md grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-sm font-medium">From<Input type="time" disabled={!values.quiet.enabled} value={values.quiet.from} onChange={(e) => commit({ ...values, quiet: { ...values.quiet, from: e.target.value } })} /></label>
              <label className="grid gap-1.5 text-sm font-medium">Until<Input type="time" disabled={!values.quiet.enabled} value={values.quiet.to} onChange={(e) => commit({ ...values, quiet: { ...values.quiet, to: e.target.value } })} /></label>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">On these days</p>
              <ToggleGroup type="multiple" variant="outline" aria-label="Days with quiet hours" disabled={!values.quiet.enabled} value={values.quiet.days} onValueChange={(d) => commit({ ...values, quiet: { ...values.quiet, days: d } })}>
                {days.map(([id, short, long]) => (
                  <ToggleGroupItem key={id} value={id} aria-label={long} className="w-9 px-0">{short}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Settings2, type Settings2Props, type Settings2Values, type Settings2Event, type Settings2Channel }
