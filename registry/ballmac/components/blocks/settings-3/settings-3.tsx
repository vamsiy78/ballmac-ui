// Ballmac UI: Settings 3. https://ui.ballmac.com/blocks/settings-3
"use client"

import * as React from "react"
import { MailPlus, MoreHorizontal, SearchX, Send, Trash2 } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ballmac/dropdown-menu"
import { Input } from "@/components/ballmac/input"
import { SearchField } from "@/components/ballmac/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { cn } from "@/lib/utils"

type Settings3Member = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "invited"
  /** When they were last active, in words, e.g. "2 hours ago". */
  lastActive?: string
}

type Settings3Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** People in the workspace. */
  members?: Settings3Member[]
  /** Roles that can be assigned. The role named "Owner" can't be changed or removed. */
  roles?: string[]
  /** Seats included in the plan. */
  seats?: number
  /** Called with the email and role when an invitation is sent. Throw to show an error. */
  onInvite?: (email: string, role: string) => void | Promise<void>
  /** Called when someone's role changes. */
  onRoleChange?: (id: string, role: string) => void
  /** Called after a removal is confirmed. */
  onRemove?: (id: string) => void
}

const defaults: Settings3Member[] = [
  { id: "1", name: "Jordan Lee", email: "jordan@acme.com", role: "Owner", status: "active", lastActive: "Active now" },
  { id: "2", name: "Maya Kim", email: "maya@acme.com", role: "Admin", status: "active", lastActive: "2 hours ago" },
  { id: "3", name: "Jonas Ortiz", email: "jonas@acme.com", role: "Editor", status: "active", lastActive: "Yesterday" },
  { id: "4", name: "Amara Singh", email: "amara@acme.com", role: "Editor", status: "active", lastActive: "3 days ago" },
  { id: "5", name: "Elena Fischer", email: "elena@acme.com", role: "Viewer", status: "active", lastActive: "Last week" },
  { id: "6", name: "tomas@acme.com", email: "tomas@acme.com", role: "Editor", status: "invited" },
  { id: "7", name: "yuki@acme.com", email: "yuki@acme.com", role: "Viewer", status: "invited" },
]

const tones = ["bg-chart-1/25", "bg-chart-3/25", "bg-chart-5/25", "bg-chart-2/25", "bg-chart-4/25"]
const emailPattern = /^\S+@\S+\.\S+$/
const initials = (name: string) => name.replace(/@.*/, "").split(/[\s.]+/).map((w) => w[0]?.toUpperCase()).join("").slice(0, 2)

function Settings3({
  title = "Team",
  description = "Invite people and choose what each of them can do.",
  members: initialMembers = defaults,
  roles = ["Admin", "Editor", "Viewer"],
  seats = 10,
  onInvite,
  onRoleChange,
  onRemove,
  className,
  ...props
}: Settings3Props) {
  const [members, setMembers] = React.useState(initialMembers)
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState("All")
  const [email, setEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState(roles[roles.length > 1 ? 1 : 0] ?? "Viewer")
  const [error, setError] = React.useState<string>()
  const [sending, setSending] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const [removing, setRemoving] = React.useState<Settings3Member | null>(null)
  const emailId = React.useId()

  const used = members.length
  const full = used >= seats
  const q = query.trim().toLowerCase()
  const visible = members.filter(
    (m) => (filter === "All" || m.role === filter || (filter === "Pending" && m.status === "invited")) && (!q || `${m.name} ${m.email}`.toLowerCase().includes(q))
  )
  const filters = ["All", ...Array.from(new Set(members.map((m) => m.role))), "Pending"]

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    const address = email.trim()
    if (!emailPattern.test(address)) return setError("Enter a full email address.")
    if (members.some((m) => m.email.toLowerCase() === address.toLowerCase())) return setError("That person is already on the team.")
    if (full) return setError(`All ${seats} seats are in use. Remove someone or upgrade your plan.`)
    setError(undefined)
    setSending(true)
    try {
      if (onInvite) await onInvite(address, inviteRole)
      else await new Promise((r) => setTimeout(r, 600))
      setMembers((m) => [...m, { id: `new-${m.length + 1}-${address}`, name: address, email: address, role: inviteRole, status: "invited" }])
      setEmail("")
      setNotice(`Invitation sent to ${address}.`)
    } catch {
      setError("We couldn’t send that invitation. Please try again.")
    } finally {
      setSending(false)
    }
  }

  function changeRole(m: Settings3Member, role: string) {
    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, role } : x)))
    onRoleChange?.(m.id, role)
    setNotice(`${m.status === "invited" ? m.email : m.name} is now ${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}.`)
  }

  return (
    <section data-slot="settings-3" className={cn("mx-auto w-full max-w-4xl px-4 py-8 sm:px-6", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <div className="w-full sm:w-56">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Seats</span>
            <span className="text-muted-foreground tabular-nums">{used} of {seats} used</span>
          </div>
          <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full" role="img" aria-label={`${used} of ${seats} seats used`}>
            <div className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", used / seats >= 0.9 ? "bg-chart-3" : "bg-chart-1")} style={{ width: `${Math.min(100, (used / seats) * 100)}%` }} />
          </div>
        </div>
      </div>

      <form onSubmit={invite} noValidate className="bg-card mt-6 rounded-2xl border p-4 sm:p-5">
        <label htmlFor={emailId} className="flex items-center gap-2 text-sm font-medium"><MailPlus className="size-4" aria-hidden="true" />Invite someone</label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input id={emailId} type="email" autoComplete="off" placeholder="name@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined) }} aria-invalid={error ? true : undefined} aria-describedby={error ? `${emailId}-error` : undefined} className="sm:flex-1" />
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger aria-label="Role for the invitation" className="w-full sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="submit" loading={sending}><Send /> Send invite</Button>
        </div>
        <p id={`${emailId}-error`} role="alert" className="text-destructive mt-2 min-h-5 text-sm">{error}</p>
      </form>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by role" className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {filters.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("focus-visible:ring-ring/50 h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]", filter === f ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>{f}</button>
          ))}
        </div>
        <SearchField className="sm:w-64" label="Search people" placeholder="Search people" value={query} onValueChange={setQuery} />
      </div>

      <p role="status" className="sr-only">{notice || `${visible.length} ${visible.length === 1 ? "person" : "people"} shown.`}</p>
      {notice && <p aria-hidden="true" className="text-muted-foreground mt-3 text-sm">{notice}</p>}

      <ul className="bg-card mt-3 divide-y overflow-hidden rounded-2xl border">
        {visible.map((m, i) => {
          const owner = m.role === "Owner"
          return (
            <li key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 px-4 py-4 sm:grid-cols-[1fr_9rem_8rem_auto] sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar><AvatarFallback className={cn("text-foreground text-xs font-semibold", tones[i % tones.length])}>{initials(m.name)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.status === "invited" ? m.email : m.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{m.status === "invited" ? "Invitation sent" : m.email}{m.lastActive ? <span className="sm:hidden"> · {m.lastActive}</span> : null}</p>
                </div>
              </div>
              <div className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">
                {owner ? (
                  <Badge variant="outline">Owner</Badge>
                ) : (
                  <Select value={m.role} onValueChange={(r) => changeRole(m, r)}>
                    <SelectTrigger size="sm" aria-label={`Role for ${m.status === "invited" ? m.email : m.name}`} className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
              <div className="hidden sm:block">
                {m.status === "invited" ? <Badge status="warning">Pending</Badge> : <span className="text-muted-foreground text-sm">{m.lastActive}</span>}
              </div>
              <div className="col-start-2 row-start-1 sm:col-start-4">
                {!owner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger aria-label={`Actions for ${m.status === "invited" ? m.email : m.name}`} className="hover:bg-accent focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"><MoreHorizontal className="size-4" aria-hidden="true" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {m.status === "invited" && <DropdownMenuItem onSelect={() => setNotice(`Invitation resent to ${m.email}.`)}><Send /> Resend invite</DropdownMenuItem>}
                      {m.status === "invited" && <DropdownMenuSeparator />}
                      <DropdownMenuItem destructive onSelect={() => setRemoving(m)}><Trash2 /> {m.status === "invited" ? "Cancel invite" : "Remove from team"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="flex flex-col items-center px-6 py-14 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full"><SearchX className="size-5" aria-hidden="true" /></span>
            <p className="mt-4 font-semibold">No one matches</p>
            <p className="text-muted-foreground mt-1 text-sm">Try a different search or role.</p>
          </li>
        )}
      </ul>

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{removing?.status === "invited" ? "Cancel this invitation?" : `Remove ${removing?.name}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.status === "invited" ? `${removing.email} won’t be able to join with the link they were sent.` : "They lose access right away. Their work stays in the workspace."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => { if (removing) { setMembers((all) => all.filter((x) => x.id !== removing.id)); onRemove?.(removing.id); setNotice(`${removing.status === "invited" ? removing.email : removing.name} was removed.`) } }}>
              {removing?.status === "invited" ? "Cancel invite" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Settings3, type Settings3Props, type Settings3Member }
