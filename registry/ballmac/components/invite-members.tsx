// Ballmac UI: Invite Members. https://ui.ballmac.com/components/invite-members
"use client";

import * as React from "react";
import { AlertCircle, ChevronDown, LoaderCircle, Mail, RotateCw, Send, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type InviteRole = {
  /** Value sent to `onInvite`. */
  value: string;
  /** Name shown in the list. */
  label: string;
};

type PendingInvite = {
  email: string;
  /** Role value. */
  role: string;
  /** Text such as "Sent 2 days ago". */
  sent?: string;
};

type Invitation = { email: string; role: string };

type InviteMembersProps = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Roles people can be invited as. */
  roles: InviteRole[];
  /** Role selected at first. Defaults to the first role. */
  defaultRole?: string;
  /** Called with the valid invitations. Return a promise to show a sending state. */
  onInvite?: (invitations: Invitation[]) => void | Promise<void>;
  /** Invitations that were sent and have not been accepted. */
  pending?: PendingInvite[];
  /** Adds a Resend button on each pending invitation. */
  onResend?: (email: string) => void;
  /** Adds a Revoke button on each pending invitation. */
  onRevoke?: (email: string) => void;
  /** Emails that already belong to the workspace; they are flagged instead of invited. */
  existing?: string[];
  /** Heading. */
  title?: string;
  /** Text under the heading. */
  description?: string;
  /** Most invitations per batch. */
  max?: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Invite teammates by email. Type or paste addresses (separated by Enter, comma, space or semicolon) and they become
 * chips; invalid or duplicate ones are flagged with an icon and an explanation, not just color. Pending invitations
 * can be resent or revoked.
 */
function InviteMembers({
  roles,
  defaultRole,
  onInvite,
  pending = [],
  onResend,
  onRevoke,
  existing = [],
  title,
  description,
  max = 20,
  className,
  ...props
}: InviteMembersProps) {
  const msg = useMessages()
  title ??= msg("invite-members.title", "Invite teammates")
  description ??= msg("invite-members.description", "They will get an email with a link to join.")
  const reduce = useReducedMotion();
  const inputId = React.useId();
  const helpId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [chips, setChips] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState("");
  const [role, setRole] = React.useState(defaultRole ?? roles[0]?.value ?? "");
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const lowerExisting = new Set([...existing, ...pending.map((p) => p.email)].map((e) => e.toLowerCase()));
  function problem(email: string, index: number) {
    if (!EMAIL.test(email)) return "Not a valid email address";
    if (lowerExisting.has(email.toLowerCase())) return "Already invited or a member";
    if (chips.findIndex((c) => c.toLowerCase() === email.toLowerCase()) !== index) return "Listed twice";
    return null;
  }
  const valid = chips.filter((c, i) => !problem(c, i));

  function commit(text: string) {
    const parts = text.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return;
    setChips((prev) => [...prev, ...parts].slice(0, max));
    setDraft("");
  }

  async function send() {
    if (!valid.length || sending) return;
    setSending(true);
    try {
      await onInvite?.(valid.map((email) => ({ email, role })));
      setMessage(`${valid.length} invitation${valid.length === 1 ? "" : "s"} sent`);
      setChips([]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      data-slot="invite-members"
      aria-label={title}
      className={cn(
        "w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.14)]",
        className,
      )}
      {...props}
    >
      <div className="grid gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-1/12 text-chart-1">
            <Mail aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor={inputId} className="text-sm font-medium">
            {msg("invite-members.emailAddresses", "Email addresses")}
          </label>
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex min-h-11 cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background p-1.5 shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30"
          >
            <AnimatePresence initial={false}>
              {chips.map((chip, index) => {
                const issue = problem(chip, index);
                return (
                  <motion.span
                    key={`${chip}-${index}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                    transition={spring.snappy}
                    title={issue ?? undefined}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1 rounded-lg py-1 pe-1 ps-2.5 text-[13px] font-medium",
                      issue ? "bg-destructive/10 text-foreground ring-1 ring-destructive/40" : "bg-muted text-foreground",
                    )}
                  >
                    {issue && <AlertCircle aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />}
                    <span className="truncate">{chip}</span>
                    {issue && <span className="sr-only">: {issue}</span>}
                    <button
                      type="button"
                      aria-label={msg("invite-members.remove", "Remove {chip}", { chip })}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChips((prev) => prev.filter((_, i) => i !== index));
                        inputRef.current?.focus();
                      }}
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded-md opacity-70 outline-none transition hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <X aria-hidden="true" className="size-3" />
                    </button>
                  </motion.span>
                );
              })}
            </AnimatePresence>
            <input
              ref={inputRef}
              id={inputId}
              type="email"
              inputMode="email"
              autoComplete="off"
              value={draft}
              placeholder={chips.length ? "" : msg("invite-members.nameCompanyCom", "name@company.com")}
              aria-describedby={helpId}
              onChange={(e) => {
                const v = e.target.value;
                if (/[,;\s]$/.test(v)) commit(v);
                else setDraft(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (draft.trim()) {
                    e.preventDefault();
                    commit(draft);
                  } else if (valid.length) {
                    e.preventDefault();
                    void send();
                  }
                } else if (e.key === "Backspace" && !draft && chips.length) {
                  setChips((prev) => prev.slice(0, -1));
                }
              }}
              onBlur={() => commit(draft)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/[\s,;]/.test(text.trim())) {
                  e.preventDefault();
                  commit(draft + " " + text);
                }
              }}
              className="h-8 min-w-40 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p id={helpId} className="text-xs text-muted-foreground">
            {msg("invite-members.separateAddressesWithAComma", "Separate addresses with a comma, space or Enter. You can paste a list.")}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <label htmlFor={`${inputId}-role`} className="text-sm font-medium">
              {msg("invite-members.role", "Role")}
            </label>
            <div className="relative">
              <select
                id={`${inputId}-role`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-44 cursor-pointer appearance-none rounded-md border border-input bg-background pe-8 ps-3 text-sm shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 end-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void send()}
            disabled={!valid.length || sending}
            className="ms-auto inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Send aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            )}
            {valid.length ? `Send ${valid.length} invitation${valid.length === 1 ? "" : "s"}` : "Send invitations"}
          </button>
        </div>
        <p role="status" className="min-h-4 text-sm font-medium">
          {message}
        </p>
      </div>

      {pending.length > 0 && (
        <div className="border-t bg-muted/30 px-2 py-3">
          <h4 className="px-4 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{msg("invite-members.pending", "Pending ({count})", { count: pending.length })}</h4>
          <ul>
            {pending.map((p) => (
              <li key={p.email} className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-muted/60">
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold uppercase ring-1 ring-border">
                  {p.email.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.email}</span>
                  <span className="block text-xs text-muted-foreground">
                    {roles.find((r) => r.value === p.role)?.label ?? p.role}
                    {p.sent ? ` · ${p.sent}` : ""}
                  </span>
                </span>
                {onResend && (
                  <button
                    type="button"
                    onClick={() => onResend(p.email)}
                    aria-label={msg("invite-members.resendInvitationTo", "Resend invitation to {email}", { email: p.email })}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <RotateCw aria-hidden="true" className="size-4" />
                  </button>
                )}
                {onRevoke && (
                  <button
                    type="button"
                    onClick={() => onRevoke(p.email)}
                    aria-label={msg("invite-members.revokeInvitationFor", "Revoke invitation for {email}", { email: p.email })}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export { InviteMembers, type InviteMembersProps, type InviteRole, type PendingInvite, type Invitation };
