// Ballmac UI: Plan Selector. https://ui.ballmac.com/components/plan-selector
"use client";

import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type PlanOption = {
  /** Unique id; this is the selected value. */
  id: string;
  /** Plan name. */
  name: string;
  /** One line describing who it is for. */
  description?: string;
  /** Price per month. `yearly` is the monthly price when billed yearly. Use 0 for free. */
  price: { monthly: number; yearly: number };
  /** Short list of what is included. */
  features: string[];
  /** Ribbon text that makes the plan stand out, for example "Most popular". */
  highlight?: string;
  /** Text after the price, for example "per user". */
  priceNote?: string;
  /** Prevent choosing this plan. */
  disabled?: boolean;
};

type Billing = "monthly" | "yearly";

type PlanSelectorProps = Omit<React.ComponentProps<"fieldset">, "onChange" | "defaultValue" | "value"> & {
  /** Plans to offer. */
  plans: PlanOption[];
  /** Controlled selected plan id. */
  value?: string;
  /** Initial plan id when uncontrolled. */
  defaultValue?: string;
  /** Called with the plan id when one is chosen. */
  onValueChange?: (id: string) => void;
  /** Controlled billing period. */
  billing?: Billing;
  /** Initial billing period. */
  defaultBilling?: Billing;
  /** Called when the billing period changes. */
  onBillingChange?: (billing: Billing) => void;
  /** Name of the radio group, so the value submits with a native form. */
  name?: string;
  /** ISO 4217 currency code. */
  currency?: string;
  /** Locale for money. Fixed by default so server and browser match. */
  locale?: string;
  /** Visible legend for the group. */
  legend?: string;
};

/**
 * Pick a pricing plan. Each plan is a real radio button, so arrow keys, Space and form submission work, and screen
 * readers announce "Team, 2 of 3". A Monthly/Yearly switch re-prices every plan with a short slide.
 */
function PlanSelector({
  plans,
  value: valueProp,
  defaultValue,
  onValueChange,
  billing: billingProp,
  defaultBilling = "yearly",
  onBillingChange,
  name,
  currency = "USD",
  locale = "en-US",
  legend = "Choose a plan",
  className,
  ...props
}: PlanSelectorProps) {
  const reduce = useReducedMotion();
  const generated = React.useId();
  const groupName = name ?? `plan-${generated}`;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? plans.find((p) => p.highlight)?.id ?? plans[0]?.id);
  const value = valueProp ?? innerValue;
  const [innerBilling, setInnerBilling] = React.useState<Billing>(defaultBilling);
  const billing = billingProp ?? innerBilling;
  const setBilling = (next: Billing) => {
    if (billingProp === undefined) setInnerBilling(next);
    onBillingChange?.(next);
  };
  const money = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  const savings = Math.max(
    0,
    ...plans.filter((p) => p.price.monthly > 0).map((p) => Math.round((1 - p.price.yearly / p.price.monthly) * 100)),
  );

  return (
    <fieldset data-slot="plan-selector" className={cn("grid w-full min-w-0 gap-6", className)} {...props}>
      <legend className="sr-only">{legend}</legend>

      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="relative inline-flex rounded-full border bg-muted/60 p-1 text-sm font-medium"
        >
          {(["monthly", "yearly"] as const).map((period) => (
            <label key={period} className="relative cursor-pointer">
              <input
                type="radio"
                name={`${groupName}-billing`}
                value={period}
                checked={billing === period}
                onChange={() => setBilling(period)}
                className="peer sr-only"
              />
              {billing === period && (
                <motion.span
                  layoutId={`${groupName}-billing-pill`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-background shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                  transition={reduce ? { duration: 0 } : spring.snappy}
                />
              )}
              <span
                className={cn(
                  "relative flex h-8 items-center gap-2 rounded-full px-4 transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50",
                  billing === period ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {period === "monthly" ? "Monthly" : "Yearly"}
                {period === "yearly" && savings > 0 && (
                  <span className="rounded-full bg-chart-2/20 px-1.5 py-px text-[10px] font-semibold text-foreground">Save {savings}%</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(14.5rem,1fr))]">
        {plans.map((plan) => {
          const price = plan.price[billing];
          const free = plan.price.monthly === 0;
          const selected = plan.id === value;
          return (
            <label
              key={plan.id}
              data-selected={selected || undefined}
              className={cn(
                "group/plan relative flex cursor-pointer flex-col rounded-2xl border bg-card p-6 text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow,transform] duration-200",
                "hover:border-foreground/25 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 motion-reduce:transition-none",
                plan.highlight && "md:-translate-y-2 md:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.3)]",
                selected && "border-primary shadow-[0_0_0_1px_var(--primary),0_16px_40px_-20px_rgb(0_0_0/0.3)]",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={plan.id}
                checked={selected}
                disabled={plan.disabled}
                onChange={() => {
                  if (valueProp === undefined) setInnerValue(plan.id);
                  onValueChange?.(plan.id);
                }}
                className="peer sr-only"
              />
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap text-primary-foreground shadow-sm">
                  <Sparkles aria-hidden="true" className="size-3" />
                  {plan.highlight}
                </span>
              )}
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-base font-semibold tracking-tight">{plan.name}</span>
                  {plan.description && <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{plan.description}</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </span>

              <span className="mt-5 flex items-baseline gap-1.5">
                <span className="relative inline-flex h-10 items-baseline overflow-hidden text-4xl font-semibold tracking-tight tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${plan.id}-${billing}`}
                      initial={reduce ? false : { y: "60%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { y: "-60%", opacity: 0 }}
                      transition={reduce ? { duration: 0 } : spring.snappy}
                    >
                      {free ? "Free" : money(price)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {!free && (
                  <span className="text-[13px] text-muted-foreground">
                    / month{plan.priceNote ? ` ${plan.priceNote}` : ""}
                  </span>
                )}
              </span>
              <span className="mt-1 block h-4 text-xs text-muted-foreground">
                {!free && billing === "yearly" ? `Billed ${money(price * 12)} per year` : !free ? "Billed monthly" : "No card needed"}
              </span>

              <span className="my-5 block h-px bg-border" aria-hidden="true" />
              <ul className="grid gap-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-chart-2" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export { PlanSelector, type PlanSelectorProps, type PlanOption, type Billing as PlanBilling };
