// Ballmac UI: Feedback Widget. https://ui.ballmac.com/components/feedback-widget
"use client";

import * as React from "react";
import { Angry, CircleCheck, Frown, Laugh, LoaderCircle, Meh, MessageSquareText, Smile } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type FeedbackSubmission = {
  /** 1 (very unhappy) to 5 (delighted). */
  rating: number;
  /** Free-text comment, may be empty. */
  message: string;
  /** Chosen topic, if topics were given. */
  topic?: string;
};

type FeedbackWidgetProps = Omit<React.ComponentProps<"button">, "onSubmit"> & {
  /** Called with the feedback. Return a promise to show a sending state. */
  onSubmit?: (feedback: FeedbackSubmission) => void | Promise<void>;
  /** Topics people can tag feedback with. */
  topics?: string[];
  /** Text on the trigger. */
  triggerLabel?: string;
  /** Question shown in the panel. */
  question?: string;
  /** Require a written message before sending. */
  requireMessage?: boolean;
  /** Milliseconds before the panel closes itself after a successful send. 0 keeps it open. */
  closeAfter?: number;
  /** Side the panel opens on. */
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Initial open state. */
  defaultOpen?: boolean;
};

const FACES = [
  { value: 1, label: "Very unhappy", icon: Angry, tone: "text-destructive" },
  { value: 2, label: "Unhappy", icon: Frown, tone: "text-chart-3" },
  { value: 3, label: "Neutral", icon: Meh, tone: "text-muted-foreground" },
  { value: 4, label: "Happy", icon: Smile, tone: "text-chart-2" },
  { value: 5, label: "Delighted", icon: Laugh, tone: "text-chart-1" },
] as const;

/**
 * A compact feedback form in a popover: five face ratings (a real radio group), optional topic chips and a comment box,
 * then a confirmation. Opens from a pill button you can dock in a corner of your app.
 */
function FeedbackWidget({
  onSubmit,
  topics,
  triggerLabel = "Feedback",
  question = "How is your experience?",
  requireMessage = false,
  closeAfter = 2200,
  side = "top",
  align = "end",
  defaultOpen = false,
  className,
  ...props
}: FeedbackWidgetProps) {
  const reduce = useReducedMotion();
  const name = React.useId();
  const messageId = React.useId();
  const [open, setOpen] = React.useState(defaultOpen);
  const [rating, setRating] = React.useState(0);
  const [topic, setTopic] = React.useState<string | undefined>();
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle");

  React.useEffect(() => {
    if (status !== "sent" || !closeAfter) return;
    const id = window.setTimeout(() => setOpen(false), closeAfter);
    return () => window.clearTimeout(id);
  }, [status, closeAfter]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating || status === "sending") return;
    setStatus("sending");
    try {
      await onSubmit?.({ rating, message: message.trim(), topic });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          window.setTimeout(() => {
            setStatus("idle");
            setRating(0);
            setMessage("");
            setTopic(undefined);
          }, 200);
        }
      }}
    >
      <PopoverTrigger
        data-slot="feedback-widget"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium shadow-[0_4px_16px_-6px_rgb(0_0_0/0.25)] outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          className,
        )}
        {...props}
      >
        <MessageSquareText aria-hidden="true" className="size-4" />
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent label="Send feedback" side={side} align={align} className="w-[min(21rem,calc(100vw-1.5rem))] gap-0 p-0">
        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            <motion.div
              key="sent"
              role="status"
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.gentle}
              className="flex flex-col items-center gap-3 px-6 py-10 text-center"
            >
              <motion.span
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={spring.bouncy}
                className="flex size-12 items-center justify-center rounded-full bg-chart-2/15 text-chart-2"
              >
                <CircleCheck aria-hidden="true" className="size-6" />
              </motion.span>
              <div>
                <p className="text-sm font-semibold">Thank you</p>
                <p className="mt-1 text-sm text-muted-foreground">Your feedback helps us improve.</p>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="grid gap-4 p-4">
              <fieldset className="grid gap-3">
                <legend className="text-sm font-semibold tracking-tight">{question}</legend>
                <div className="flex justify-between gap-1">
                  {FACES.map(({ value, label, icon: Icon, tone }) => (
                    <label key={value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl border border-transparent transition-[background-color,border-color,transform,box-shadow] duration-150 hover:bg-accent peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none",
                          rating === value ? `border-border bg-muted shadow-sm ${reduce ? "" : "scale-110"}` : "text-muted-foreground",
                          rating === value && tone,
                        )}
                      >
                        <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                        <span className="sr-only">{label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {topics && topics.length > 0 && (
                <div role="group" aria-label="Topic" className="flex flex-wrap gap-1.5">
                  {topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      onClick={() => setTopic(topic === t ? undefined : t)}
                      className="h-7 rounded-full border px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-1.5">
                <label htmlFor={messageId} className="text-xs font-medium text-muted-foreground">
                  Tell us more {requireMessage ? "" : "(optional)"}
                </label>
                <textarea
                  id={messageId}
                  rows={3}
                  required={requireMessage}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What worked well, or what could be better?"
                  className="min-h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>

              <button
                type="submit"
                disabled={!rating || status === "sending" || (requireMessage && !message.trim())}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              >
                {status === "sending" && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
                {status === "sending" ? "Sending…" : "Send feedback"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

export { FeedbackWidget, type FeedbackWidgetProps, type FeedbackSubmission };
