// Ballmac UI: Billing Card. https://ui.ballmac.com/components/billing-card
"use client";

import * as React from "react";
import { AlertTriangle, CalendarClock, CircleCheck, Clock, Download, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useMessages, defineMessage } from "@/lib/ballmac/i18n";

type BillingStatus = "active" | "trialing" | "past_due" | "canceled";

type BillingPlan = {
  /** Plan name, for example "Team". */
  name: string;
  /** Price per interval in major currency units (for example 49 for $49). */
  price: number;
  /** Billing interval. */
  interval: "month" | "year";
  /** ISO 4217 currency code. */
  currency?: string;
  /** Subscription state. */
  status: BillingStatus;
  /** ISO date (YYYY-MM-DD) of the next charge, or when access ends if canceled. */
  renewsOn?: string;
  /** ISO date (YYYY-MM-DD) the trial ends. */
  trialEndsOn?: string;
  /** Seats in use and included. */
  seats?: { used: number; total: number };
};

type BillingPaymentMethod = {
  /** Card brand as text, for example "Visa". */
  brand: string;
  /** Last four digits. */
  last4: string;
  /** Expiry as MM/YY. */
  expires: string;
};

type BillingInvoice = {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Amount in major currency units. */
  amount: number;
  status: "paid" | "open" | "failed";
  /** Link to download the PDF. */
  href?: string;
};

type BillingCardProps = Omit<React.ComponentProps<"section">, "title"> & {
  plan: BillingPlan;
  paymentMethod?: BillingPaymentMethod;
  /** Recent invoices, newest first. The first three are shown. */
  invoices?: BillingInvoice[];
  /** Adds a "Change plan" button and calls this when pressed. */
  onChangePlan?: () => void;
  /** Adds an "Update" button on the payment method row. */
  onUpdatePayment?: () => void;
  /** Adds a "Cancel subscription" text button. */
  onCancel?: () => void;
  /** Locale for dates and money. Fixed by default so server and browser match. */
  locale?: string;
};

const STATUS = {
  active: { label: defineMessage("billing-card.STATUS.active", "Active"), icon: CircleCheck, tone: "bg-chart-2/12 text-foreground", iconTone: "text-chart-2" },
  trialing: { label: defineMessage("billing-card.STATUS.trialing", "Trial"), icon: Clock, tone: "bg-chart-1/12 text-foreground", iconTone: "text-chart-1" },
  past_due: { label: defineMessage("billing-card.STATUS.past_due", "Payment failed"), icon: AlertTriangle, tone: "bg-destructive/12 text-foreground", iconTone: "text-destructive" },
  canceled: { label: defineMessage("billing-card.STATUS.canceled", "Canceled"), icon: XCircle, tone: "bg-muted text-foreground", iconTone: "text-muted-foreground" },
} as const;

const INVOICE_STATUS = {
  paid: { label: defineMessage("billing-card.INVOICE_STATUS.paid", "Paid"), dot: "bg-chart-2" },
  open: { label: defineMessage("billing-card.INVOICE_STATUS.open", "Open"), dot: "bg-chart-3" },
  failed: { label: defineMessage("billing-card.INVOICE_STATUS.failed", "Failed"), dot: "bg-destructive" },
} as const;

/**
 * A subscription summary: plan and price, status, next charge, payment method, seat usage and recent invoices.
 * Status uses an icon and words, not color alone. Dates are formatted in UTC from ISO strings so they never shift.
 */
function BillingCard({
  plan,
  paymentMethod,
  invoices = [],
  onChangePlan,
  onUpdatePayment,
  onCancel,
  locale,
  className,
  ...props
}: BillingCardProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const msg = useMessages()
  const currency = plan.currency ?? "USD";
  const money = (n: number, digits = 2) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const date = (iso?: string) =>
    iso ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "";
  const status = STATUS[plan.status];
  const StatusIcon = status.icon;
  const whole = Math.trunc(plan.price);
  const cents = Math.round((plan.price - whole) * 100);
  const symbol = money(0, 0).replace(/[\d\s.,]/g, "");
  const seatPercent = plan.seats ? Math.min(100, (plan.seats.used / Math.max(plan.seats.total, 1)) * 100) : 0;
  const nextLabel =
    plan.status === "canceled" ? "Access ends" : plan.status === "trialing" ? "Trial ends" : plan.status === "past_due" ? "Retrying" : "Renews";
  const nextDate = plan.status === "trialing" ? plan.trialEndsOn : plan.renewsOn;
  const headingId = React.useId();

  return (
    <section
      data-slot="billing-card"
      aria-labelledby={headingId}
      className={cn(
        "w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-20px_rgb(0_0_0/0.2)]",
        className,
      )}
      {...props}
    >
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-chart-1/[0.10] via-chart-4/[0.06] to-transparent p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -end-10 size-48 rounded-full bg-chart-1/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{msg("billing-card.currentPlan", "Current plan")}</p>
            <h3 id={headingId} className="mt-1 text-xl font-semibold tracking-tight">
              {plan.name}
            </h3>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", status.tone)}>
            <StatusIcon aria-hidden="true" className={cn("size-3.5", status.iconTone)} />
            {msg.of(status.label)}
          </span>
        </div>
        <p className="relative mt-5 flex items-baseline tabular-nums">
          <span className="me-0.5 text-2xl font-medium text-muted-foreground">{symbol}</span>
          <span className="text-5xl font-semibold tracking-tight">{whole.toLocaleString(locale)}</span>
          {cents > 0 && <span className="text-xl font-medium text-muted-foreground">.{String(cents).padStart(2, "0")}</span>}
          <span className="ms-1.5 text-sm text-muted-foreground">/ {plan.interval}</span>
        </p>
      </div>

      {plan.status === "past_due" && (
        <p role="alert" className="flex items-start gap-2.5 border-b bg-destructive/[0.06] px-6 py-3 text-sm">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>We could not charge your card. Update your payment method to keep your workspace active.</span>
        </p>
      )}

      <div className="grid gap-px bg-border sm:grid-cols-2 [&>div]:bg-card">
        {nextDate && (
          <div className={cn("flex items-start gap-3 p-5", !plan.seats && "sm:col-span-2")}>
            <CalendarClock aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{nextLabel}</p>
              <p className="mt-0.5 text-sm font-medium">{date(nextDate)}</p>
            </div>
          </div>
        )}
        {plan.seats && (
          <div className="grid content-center gap-2 p-5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <p className="text-xs text-muted-foreground">{msg("billing-card.seats", "Seats")}</p>
              <p className="font-medium tabular-nums">
                {msg("billing-card.seatsOf", "{used} of {total} used", { used: plan.seats.used, total: plan.seats.total })}
              </p>
            </div>
            <div
              role="meter"
              aria-label={msg("billing-card.seatsUsed", "Seats used")}
              aria-valuemin={0}
              aria-valuemax={plan.seats.total}
              aria-valuenow={plan.seats.used}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full rounded-full bg-primary transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${seatPercent}%` }} />
            </div>
          </div>
        )}
        {paymentMethod && (
          <div className="flex items-center gap-3 p-5 sm:col-span-2">
            <span
              aria-hidden="true"
              className="relative flex h-8 w-12 shrink-0 items-end justify-end overflow-hidden rounded-md bg-gradient-to-br from-foreground to-foreground/70 p-1 shadow-sm"
            >
              <span className="absolute top-1.5 start-1.5 h-2 w-3 rounded-[2px] bg-background/30" />
              <span className="text-[8px] font-bold tracking-wider text-background/90 uppercase">{paymentMethod.brand.slice(0, 4)}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{msg("billing-card.paymentMethod", "Payment method")}</p>
              <p className="mt-0.5 truncate text-sm font-medium tabular-nums">
                {paymentMethod.brand} •••• {paymentMethod.last4}
                <span className="ms-2 text-xs font-normal text-muted-foreground">{msg("billing-card.exp", "Exp {date}", { date: paymentMethod.expires })}</span>
              </p>
            </div>
            {onUpdatePayment && (
              <button
                type="button"
                onClick={onUpdatePayment}
                className="rounded-md px-2 py-1 text-[13px] font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {msg("billing-card.update", "Update")}
              </button>
            )}
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="border-t">
          <h4 className="px-6 pt-4 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{msg("billing-card.recentInvoices", "Recent invoices")}</h4>
          <ul className="px-3 pb-3">
            {invoices.slice(0, 3).map((inv) => {
              const s = INVOICE_STATUS[inv.status];
              return (
                <li key={inv.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/50">
                  <span className="w-28 shrink-0 text-muted-foreground tabular-nums">{date(inv.date)}</span>
                  <span className="flex-1 font-medium tabular-nums">{money(inv.amount)}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", s.dot)} />
                    {msg.of(s.label)}
                  </span>
                  {inv.href && (
                    <a
                      href={inv.href}
                      aria-label={msg("billing-card.downloadInvoice", "Download invoice {id}", { id: inv.id })}
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <Download aria-hidden="true" className="size-4" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(onChangePlan || onCancel) && (
        <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-6 py-4">
          {onChangePlan && (
            <button
              type="button"
              onClick={onChangePlan}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {msg("billing-card.changePlan", "Change plan")}
            </button>
          )}
          {onCancel && plan.status !== "canceled" && (
            <button
              type="button"
              onClick={onCancel}
              className="ms-auto rounded-md px-2 py-1 text-[13px] text-muted-foreground underline-offset-4 outline-none hover:text-destructive hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {msg("billing-card.cancelSubscription", "Cancel subscription")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export { BillingCard, type BillingCardProps, type BillingPlan, type BillingPaymentMethod, type BillingInvoice, type BillingStatus };
