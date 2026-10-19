// Ballmac UI: Questionnaire. https://ui.ballmac.com/components/questionnaire
// Based on shadcn/ui's Questionnaire (MIT, Copyright (c) 2023 shadcn) on @shadcn/react (MIT), the same parts and props, restyled with tokens and translated action labels.
"use client"

import * as React from "react"
import { Questionnaire as Primitive } from "@shadcn/react/questionnaire"
import { Check } from "lucide-react"

import { buttonVariants, type ButtonProps } from "@/components/ballmac/button"
import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

/** The form that owns the items, the active one, the answers, validation and progress. Pass `items` to render the right item and its shortcuts on the server. */
function Questionnaire({ className, ...props }: React.ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root data-slot="questionnaire" className={cn("flex w-full min-w-0 flex-col gap-5", className)} {...props} />
}

/** "Question 2 of 5", in the active item's place. It is a named progress bar for assistive technology. */
function QuestionnaireProgress({ className, ...props }: React.ComponentProps<typeof Primitive.Progress>) {
  return <Primitive.Progress data-slot="questionnaire-progress" className={cn("min-h-[1lh] w-fit min-w-[14ch] text-sm font-medium tabular-nums text-muted-foreground", className)} {...props} />
}

/** One question: a fieldset, so its title is the legend that names the group of answers. */
function QuestionnaireItem({ className, ...props }: React.ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item data-slot="questionnaire-item" className={cn("min-w-0 border-0 p-0 outline-none", className)} {...props} />
}

function QuestionnaireTitle({ className, ...props }: React.ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title data-slot="questionnaire-title" className={cn("text-pretty text-lg font-semibold leading-snug tracking-tight", className)} {...props} />
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<typeof Primitive.Description>) {
  return <Primitive.Description data-slot="questionnaire-description" className={cn("mt-1 text-pretty text-sm text-muted-foreground", className)} {...props} />
}

/** The answers of one question. */
function QuestionnaireChoices({ className, ...props }: React.ComponentProps<typeof Primitive.Choices>) {
  return <Primitive.Choices data-slot="questionnaire-choices" className={cn("group/questionnaire-choices mt-4 grid min-w-0 gap-2", className)} {...props} />
}

/**
 * One fixed answer: a real radio button or checkbox that the label covers, so the keyboard, the arrow keys and screen readers behave as the browser
 * does. Put the answer's words in it, and a `QuestionnaireChoiceDescription` for a second line.
 */
function QuestionnaireChoice({ children, className, ...props }: React.ComponentProps<typeof Primitive.Choice>) {
  return (
    <Primitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer select-none items-start gap-3 rounded-lg border bg-background px-3 py-2.5 text-start text-sm shadow-xs outline-none transition-[border-color,background-color,box-shadow] duration-150 motion-reduce:transition-none",
        "hover:bg-accent/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
        "data-checked:border-primary data-checked:bg-primary/5 data-invalid:border-destructive/60",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <Primitive.ChoiceInput data-slot="questionnaire-choice-input" className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className="pointer-events-none relative mt-0.5 flex size-4 shrink-0 items-center justify-center border border-input bg-background text-primary-foreground transition-colors group-data-[type=radio]/questionnaire-choice:rounded-full group-data-[type=checkbox]/questionnaire-choice:rounded-[4px] group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary motion-reduce:transition-none"
      >
        <span className="hidden size-1.5 rounded-full bg-primary-foreground group-data-[type=radio]/questionnaire-choice:group-data-checked/questionnaire-choice:block" />
        <Check className="hidden size-3 group-data-[type=checkbox]/questionnaire-choice:group-data-checked/questionnaire-choice:block" strokeWidth={3} />
      </span>
      <Primitive.ChoiceLabel data-slot="questionnaire-choice-label" className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
        {children}
      </Primitive.ChoiceLabel>
      <Primitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        className="pointer-events-none ms-auto hidden shrink-0 rounded border bg-muted px-1.5 font-mono text-[11px] uppercase text-muted-foreground group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </Primitive.Choice>
  )
}

/** A second line inside a choice. */
function QuestionnaireChoiceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="questionnaire-choice-description" className={cn("text-muted-foreground", className)} {...props} />
}

/** A text answer next to the fixed ones. Always give it a name with a label, `aria-label` or `aria-labelledby`: a placeholder is not one. */
function QuestionnaireInput({ className, ...props }: React.ComponentProps<typeof Primitive.Input>) {
  return (
    <div data-slot="questionnaire-input-wrapper" className="group/questionnaire-input relative min-w-0">
      <Primitive.Input
        data-slot="questionnaire-input"
        className={cn(
          "min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none sm:min-h-10",
          className
        )}
        {...props}
      />
    </div>
  )
}

/** The message when an answer is required, or refused. It is tied to the item, and shown only while the item is invalid. */
function QuestionnaireError({ className, ...props }: React.ComponentProps<typeof Primitive.Error>) {
  return <Primitive.Error data-slot="questionnaire-error" className={cn("mt-2 text-sm text-destructive", className)} {...props} />
}

/** The row of buttons: Previous at the start, then Skip, then Next or Submit at the end. */
function QuestionnaireActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="questionnaire-actions" className={cn("grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2", className)} {...props} />
}

type ActionStyle = Pick<ButtonProps, "size" | "variant">

function QuestionnairePrevious({ children, className, size = "default", variant = "outline", ...props }: React.ComponentProps<typeof Primitive.Previous> & ActionStyle) {
  const msg = useMessages()
  return (
    <Primitive.Previous data-slot="questionnaire-previous" data-size={size} data-variant={variant} className={cn(buttonVariants({ size, variant }), "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0", className)} {...props}>
      {children ?? msg("questionnaire.previous", "Previous")}
    </Primitive.Previous>
  )
}

function QuestionnaireSkip({ children, className, size = "default", variant = "ghost", ...props }: React.ComponentProps<typeof Primitive.Skip> & ActionStyle) {
  const msg = useMessages()
  return (
    <Primitive.Skip data-slot="questionnaire-skip" data-size={size} data-variant={variant} className={cn(buttonVariants({ size, variant }), "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0", className)} {...props}>
      {children ?? msg("questionnaire.skip", "Skip")}
    </Primitive.Skip>
  )
}

function QuestionnaireNext({ children, className, size = "default", variant = "default", ...props }: React.ComponentProps<typeof Primitive.Next> & ActionStyle) {
  const msg = useMessages()
  return (
    <Primitive.Next data-slot="questionnaire-next" data-size={size} data-variant={variant} className={cn(buttonVariants({ size, variant }), "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0", className)} {...props}>
      {children ?? msg("questionnaire.next", "Next")}
    </Primitive.Next>
  )
}

function QuestionnaireSubmit({ children, className, size = "default", variant = "default", ...props }: React.ComponentProps<typeof Primitive.Submit> & ActionStyle) {
  const msg = useMessages()
  return (
    <Primitive.Submit data-slot="questionnaire-submit" data-size={size} data-variant={variant} className={cn(buttonVariants({ size, variant }), "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0", className)} {...props}>
      {children ?? msg("questionnaire.submit", "Submit")}
    </Primitive.Submit>
  )
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
}
