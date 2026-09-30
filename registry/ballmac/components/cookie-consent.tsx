// Ballmac UI: Cookie Consent. https://ui.ballmac.com/components/cookie-consent
"use client";

import * as React from "react";
import { ChevronLeft, Cookie, Lock } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type ConsentCategory = {
  /** Key used in the saved choice, for example "analytics". */
  id: string;
  /** Name shown in preferences. */
  label: string;
  /** What this category is used for. */
  description: string;
  /** Always on and cannot be switched off (for strictly necessary cookies). */
  required?: boolean;
};

type ConsentChoice = Record<string, boolean>;

type CookieConsentProps = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  /** Cookie categories. Put required ones first. */
  categories: ConsentCategory[];
  /** Called with the choice when the visitor decides. */
  onConsent?: (choice: ConsentChoice) => void;
  /**
   * localStorage key. When set, the banner stays hidden once a choice is saved there and the choice is saved for you.
   * Leave undefined to manage visibility yourself with `open`.
   */
  storageKey?: string;
  /** Controlled visibility. Overrides the stored state. */
  open?: boolean;
  /** Banner heading. */
  title?: string;
  /** Short explanation. */
  description?: React.ReactNode;
  /** Link to your cookie or privacy policy. */
  policyHref?: string;
  /** Where the banner sits. */
  placement?: "bottom-left" | "bottom-right" | "bottom-center";
};

function readStored(key?: string): ConsentChoice | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ConsentChoice) : null;
  } catch {
    return null;
  }
}

/**
 * A privacy banner with three equal choices: Accept all, Reject non-essential, and Customize. Accept and Reject have the
 * same visual weight, and the preferences view lists each category with its own switch. Required categories are shown as locked.
 * Focus moves to the new view when you open preferences, and the banner never blocks the page.
 */
function CookieConsent({
  categories,
  onConsent,
  storageKey,
  open: openProp,
  title = "We value your privacy",
  description = "We use cookies to make the site work, understand how it is used and, with your permission, personalize content.",
  policyHref,
  placement = "bottom-left",
  className,
  ...props
}: CookieConsentProps) {
  const reduce = useReducedMotion();
  const [view, setView] = React.useState<"summary" | "preferences">("summary");
  const [decided, setDecided] = React.useState<boolean | null>(null);
  const [draft, setDraft] = React.useState<ConsentChoice>(() =>
    Object.fromEntries(categories.map((c) => [c.id, !!c.required])),
  );
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    // Reading storage must wait for the browser, so the server and first render agree.
    const frame = requestAnimationFrame(() => setDecided(readStored(storageKey) !== null));
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);

  const visible = openProp ?? (decided === false);

  function decide(choice: ConsentChoice) {
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(choice));
      } catch {
        /* storage unavailable: the choice still reaches onConsent */
      }
    }
    setDecided(true);
    onConsent?.(choice);
  }
  const all = (value: boolean) => Object.fromEntries(categories.map((c) => [c.id, c.required ? true : value]));

  function show(next: "summary" | "preferences") {
    setView(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          data-slot="cookie-consent"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          transition={reduce ? { duration: 0.1 } : spring.gentle}
          className={cn(
            "fixed bottom-4 z-50 max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border bg-popover text-popover-foreground shadow-[0_24px_64px_-16px_rgb(0_0_0/0.35)]",
            placement === "bottom-left" && "left-4",
            placement === "bottom-right" && "right-4",
            placement === "bottom-center" && "left-1/2 -translate-x-1/2",
            className,
          )}
          {...(props as object)}
        >
          <div className="grid gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/15 text-chart-3">
                <Cookie aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="cookie-consent-title" ref={headingRef} tabIndex={-1} className="text-base font-semibold tracking-tight outline-none">
                  {view === "summary" ? title : "Cookie preferences"}
                </h2>
                {view === "summary" && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                    {policyHref && (
                      <>
                        {" "}
                        <a href={policyHref} className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                          Cookie policy
                        </a>
                        .
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {view === "preferences" && (
              <ul className="grid gap-2">
                {categories.map((c) => {
                  const id = `cookie-${c.id}`;
                  const on = c.required ? true : !!draft[c.id];
                  return (
                    <li key={c.id} className="flex items-start gap-3 rounded-xl border bg-background/60 p-3">
                      <div className="min-w-0 flex-1">
                        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
                          {c.label}
                          {c.required && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                              <Lock aria-hidden="true" className="size-2.5" /> Always on
                            </span>
                          )}
                        </label>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{c.description}</p>
                      </div>
                      <button
                        id={id}
                        type="button"
                        role="switch"
                        aria-checked={on}
                        disabled={c.required}
                        onClick={() => setDraft((d) => ({ ...d, [c.id]: !d[c.id] }))}
                        className={cn(
                          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
                          on ? "bg-primary" : "bg-input",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-4 rounded-full bg-background shadow transition-transform duration-200 motion-reduce:transition-none",
                            on ? "translate-x-[18px]" : "translate-x-0.5",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className={cn("grid gap-2", view === "summary" ? "grid-cols-2" : "grid-cols-1")}>
              {view === "summary" ? (
                <>
                  <button
                    type="button"
                    onClick={() => decide(all(false))}
                    className="h-9 rounded-md border bg-background text-sm font-medium shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    Reject non-essential
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(all(true))}
                    className="h-9 rounded-md border bg-background text-sm font-medium shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    Accept all
                  </button>
                  <button
                    type="button"
                    onClick={() => show("preferences")}
                    className="col-span-2 h-9 rounded-md text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    Customize
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => decide({ ...draft, ...Object.fromEntries(categories.filter((c) => c.required).map((c) => [c.id, true])) })}
                    className="h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    Save preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => show("summary")}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" /> Back
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export { CookieConsent, type CookieConsentProps, type ConsentCategory, type ConsentChoice };
