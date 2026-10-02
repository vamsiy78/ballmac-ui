// Ballmac UI: Settings Panel. https://ui.ballmac.com/components/settings-panel
"use client";

import * as React from "react";
import { Check, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type SettingsStatus = "idle" | "dirty" | "saving" | "saved";

type SettingsPanelProps = Omit<React.ComponentProps<"form">, "onSubmit" | "onReset"> & {
  /** Save state. `dirty` shows the save bar; `saving` disables it and shows a spinner; `saved` confirms briefly. */
  status?: SettingsStatus;
  /** Called when the form is submitted (Save button or Enter in a field). */
  onSave?: () => void;
  /** Called when Discard is pressed. Reset your own state here. */
  onDiscard?: () => void;
  /** Text next to the buttons while `dirty`. */
  dirtyMessage?: string;
  /** Label of the save button. */
  saveLabel?: string;
  /** Accessible name of the form. */
  label?: string;
};

/**
 * A card of grouped settings with a save bar that slides in when something changes. The bar's status is announced to
 * screen readers. Compose with SettingsSection and SettingsRow, and drive `status` from your form state.
 */
function SettingsPanel({
  status = "idle",
  onSave,
  onDiscard,
  dirtyMessage,
  saveLabel,
  label,
  className,
  children,
  ...props
}: SettingsPanelProps) {
  const msg = useMessages()
  dirtyMessage ??= msg("settings-panel.dirtyMessage", "You have unsaved changes")
  saveLabel ??= msg("settings-panel.saveLabel", "Save changes")
  label ??= msg("settings-panel.label", "Settings")
  const reduce = useReducedMotion();
  const showBar = status !== "idle";
  return (
    <form
      data-slot="settings-panel"
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        if (status !== "saving") onSave?.();
      }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.14)]",
        className,
      )}
      {...props}
    >
      <div className="divide-y">{children}</div>
      <div aria-live="polite" role="status" className="sr-only">
        {status === "dirty" ? dirtyMessage : status === "saving" ? "Saving" : status === "saved" ? "Changes saved" : ""}
      </div>
      <AnimatePresence initial={false}>
        {showBar && (
          <motion.div
            key="bar"
            data-slot="settings-panel-bar"
            initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={reduce ? { duration: 0.1 } : spring.snappy}
            className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t bg-card/90 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/75"
          >
            <p
              aria-hidden="true"
              className={cn(
                "flex items-center gap-2 text-sm",
                status === "saved" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {status === "saved" ? (
                <>
                  <Check className="size-4 text-chart-2" /> Changes saved
                </>
              ) : status === "saving" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> Saving…
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-chart-3" /> {dirtyMessage}
                </>
              )}
            </p>
            <div className="ms-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onDiscard}
                disabled={status !== "dirty"}
                className="inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              >
                {msg("settings-panel.discard", "Discard")}
              </button>
              <button
                type="submit"
                disabled={status !== "dirty"}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              >
                {saveLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

type SettingsSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title: string;
  /** One line under the heading. */
  description?: string;
};

/** A titled group of rows. The title names the section for assistive technology. */
function SettingsSection({ title, description, className, children, ...props }: SettingsSectionProps) {
  const id = React.useId();
  return (
    <section
      data-slot="settings-section"
      aria-labelledby={id}
      className={cn("grid gap-1 px-5 py-5 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-x-10", className)}
      {...props}
    >
      <div className="pb-3 md:pb-0">
        <h3 id={id} className="text-sm font-semibold tracking-tight">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm leading-snug text-muted-foreground">{description}</p>}
      </div>
      <div className="grid min-w-0 divide-y rounded-xl border bg-background/60">{children}</div>
    </section>
  );
}

type SettingsRowProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Setting name. */
  label: string;
  /** Explains what the setting does. */
  description?: string;
  /** The id of the control, so the label is clickable. */
  htmlFor?: string;
  /** Stack the control under the label instead of beside it. Good for wide inputs. */
  stacked?: boolean;
};

/** One setting: label and help text on the left, the control (switch, select, input) as children on the right. */
function SettingsRow({ label, description, htmlFor, stacked = false, className, children, ...props }: SettingsRowProps) {
  const descId = React.useId();
  return (
    <div
      data-slot="settings-row"
      className={cn(
        "flex gap-x-6 gap-y-3 px-4 py-3.5",
        stacked ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p id={descId} className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className={cn("shrink-0", stacked && "w-full")}>{children}</div>
    </div>
  );
}

export {
  SettingsPanel,
  SettingsSection,
  SettingsRow,
  type SettingsPanelProps,
  type SettingsSectionProps,
  type SettingsRowProps,
  type SettingsStatus,
};
