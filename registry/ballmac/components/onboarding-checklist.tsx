// Ballmac UI: Onboarding Checklist. https://ui.ballmac.com/components/onboarding-checklist
"use client";

import * as React from "react";
import { Check, ChevronDown, PartyPopper, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, ease, spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type OnboardingStep = {
  /** Unique id. */
  id: string;
  /** Short task name. */
  title: string;
  /** One or two sentences shown when the step is open. */
  description?: React.ReactNode;
  /** Button shown inside the open step, for example "Invite teammates". */
  action?: { label: string; onClick?: () => void; href?: string };
};

type OnboardingChecklistProps = Omit<React.ComponentProps<"section">, "title" | "onChange" | "defaultValue"> & {
  /** Tasks, in the order you want people to do them. */
  steps: OnboardingStep[];
  /** Controlled list of completed step ids. */
  completed?: string[];
  /** Initial completed ids when uncontrolled. */
  defaultCompleted?: string[];
  /** Called with the new list of completed ids whenever one is checked or unchecked. */
  onCompletedChange?: (completed: string[]) => void;
  /** Heading. */
  title?: string;
  /** Text under the heading while tasks remain. */
  description?: string;
  /** Message shown once every step is done. */
  completeMessage?: string;
  /** Which step is open at first. Defaults to the first unfinished one. */
  defaultOpenId?: string;
  /** Adds a dismiss button and calls this when it is pressed. */
  onDismiss?: () => void;
};

function Ring({ done, total }: { done: number; total: number }) {
  const reduce = useReducedMotion();
  const r = 15;
  const c = 2 * Math.PI * r;
  const fraction = total ? done / total : 0;
  return (
    <div className="relative size-11 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
        <motion.circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - fraction) }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: ease.out }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}

/**
 * A "get started" list with a progress ring and segmented bar. Each task can be checked off, and the open task shows its
 * description and a call to action. When everything is done the list swaps to a short celebration.
 */
function OnboardingChecklist({
  steps,
  completed: completedProp,
  defaultCompleted = [],
  onCompletedChange,
  title = "Get started",
  description = "Finish these steps to set up your workspace.",
  completeMessage = "You're all set. Nice work.",
  defaultOpenId,
  onDismiss,
  className,
  ...props
}: OnboardingChecklistProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = React.useState(defaultCompleted);
  const completed = completedProp ?? inner;
  const doneSet = new Set(completed);
  const doneCount = steps.filter((s) => doneSet.has(s.id)).length;
  const allDone = steps.length > 0 && doneCount === steps.length;
  const firstOpen = defaultOpenId ?? steps.find((s) => !doneSet.has(s.id))?.id;
  const [openId, setOpenId] = React.useState<string | undefined>(firstOpen);
  const baseId = React.useId();

  function toggle(id: string) {
    const next = doneSet.has(id) ? completed.filter((c) => c !== id) : [...completed, id];
    if (completedProp === undefined) setInner(next);
    onCompletedChange?.(next);
    if (!doneSet.has(id)) {
      const after = steps.find((s) => !new Set(next).has(s.id));
      setOpenId(after?.id);
    }
  }

  return (
    <section
      data-slot="onboarding-checklist"
      aria-label={title}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.16)]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-chart-2/[0.09] to-transparent"
      />
      <header className="relative flex items-start gap-4 p-5 pb-4">
        <Ring done={doneCount} total={steps.length} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
            {allDone ? "All steps complete" : description}
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            aria-label="Dismiss checklist"
            onClick={onDismiss}
            className="-mt-1 -mr-1 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </header>

      <div className="relative px-5 pb-4" aria-hidden="true">
        <div className="flex gap-1">
          {steps.map((s) => (
            <motion.span
              key={s.id}
              className="h-1.5 flex-1 rounded-full"
              initial={false}
              animate={{ backgroundColor: doneSet.has(s.id) ? "var(--primary)" : "var(--muted)" }}
              transition={{ duration: reduce ? 0 : duration.slow }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {allDone ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.gentle}
            className="relative flex flex-col items-center gap-3 px-5 pt-3 pb-8 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
              <PartyPopper aria-hidden="true" className="size-6" />
            </span>
            <p className="text-sm font-medium">{completeMessage}</p>
            <button
              type="button"
              onClick={() => {
                const next: string[] = [];
                if (completedProp === undefined) setInner(next);
                onCompletedChange?.(next);
                setOpenId(steps[0]?.id);
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Review the steps again
            </button>
          </motion.div>
        ) : (
          <ul key="steps" className="relative grid gap-0.5 px-2 pb-2">
            {steps.map((step, index) => {
              const done = doneSet.has(step.id);
              const open = openId === step.id;
              const panelId = `${baseId}-${step.id}`;
              return (
                <li
                  key={step.id}
                  data-done={done || undefined}
                  className={cn(
                    "rounded-xl transition-colors duration-200 motion-reduce:transition-none",
                    open && !done && "bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`${step.title}: mark as ${done ? "not done" : "done"}`}
                      onClick={() => toggle(step.id)}
                      className={cn(
                        "relative flex size-6 shrink-0 items-center justify-center rounded-full border outline-none transition-[background-color,border-color,box-shadow] duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                        "after:absolute after:-inset-2 after:content-['']",
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:border-foreground/40",
                      )}
                    >
                      <AnimatePresence initial={false}>
                        {done ? (
                          <motion.span
                            key="check"
                            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={spring.bouncy}
                          >
                            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <span aria-hidden="true" className="text-[11px] font-medium text-muted-foreground tabular-nums">
                            {index + 1}
                          </span>
                        )}
                      </AnimatePresence>
                    </button>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? undefined : step.id)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <span
                        className={cn(
                          "truncate text-sm font-medium transition-colors",
                          done && "text-muted-foreground line-through decoration-muted-foreground/50",
                        )}
                      >
                        {step.title}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-label={step.title}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : duration.base, ease: ease.out }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-3 pr-3 pb-3.5 pl-[3.25rem] text-sm text-muted-foreground">
                          {step.description && <p className="leading-relaxed">{step.description}</p>}
                          {step.action &&
                            (step.action.href ? (
                              <a
                                href={step.action.href}
                                onClick={step.action.onClick}
                                className="inline-flex h-8 w-fit items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              >
                                {step.action.label}
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={step.action.onClick}
                                className="inline-flex h-8 w-fit items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              >
                                {step.action.label}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </AnimatePresence>
    </section>
  );
}

export { OnboardingChecklist, type OnboardingChecklistProps, type OnboardingStep };
