"use client"

import * as React from "react"

import {
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
} from "@/components/ballmac/questionnaire"

const items = [
  { name: "scope", prompt: "What should the project include?", choices: ["Design", "Build", "Launch"] },
  { name: "detail", prompt: "How much detail?", choices: ["Focused", "Complete"] },
] as const

/** Your own validation, for rules the form cannot know: set `invalid` on the item, show the message in the error, and move the active item to the first problem. */
export default function QuestionnaireValidation() {
  const [item, setItem] = React.useState("scope")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [done, setDone] = React.useState(false)
  return (
    <Questionnaire
      item={item}
      onItemChange={setItem}
      noValidate
      onChange={() => setErrors({})}
      className="w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const next: Record<string, string> = {}
        if (data.get("scope") === "Launch" && data.get("detail") === "Focused") next.detail = "A launch needs the complete flow."
        setErrors(next)
        const first = items.find((q) => next[q.name])
        if (first) return setItem(first.name)
        setDone(true)
      }}
    >
      <QuestionnaireProgress />
      {items.map((q) => (
        <QuestionnaireItem key={q.name} name={q.name} required invalid={Boolean(errors[q.name])}>
          <QuestionnaireTitle>{q.prompt}</QuestionnaireTitle>
          <QuestionnaireChoices>
            {q.choices.map((c) => (
              <QuestionnaireChoice key={c} value={c}>
                {c}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>{errors[q.name]}</QuestionnaireError>
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
      {done ? <p role="status" className="text-sm text-muted-foreground">Thanks, that is everything.</p> : null}
    </Questionnaire>
  )
}
