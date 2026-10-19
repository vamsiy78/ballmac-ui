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

const signals = ["Progress", "Decisions", "Risks", "Next steps"]

export default function QuestionnaireMultiple() {
  const [picked, setPicked] = React.useState<string[] | null>(null)
  return (
    <div className="grid w-full max-w-md gap-4">
      <Questionnaire
        onSubmit={(e) => {
          e.preventDefault()
          setPicked(new FormData(e.currentTarget).getAll("signals").map(String))
        }}
      >
        <QuestionnaireItem name="signals" multiple required>
          <QuestionnaireTitle>What should every update include?</QuestionnaireTitle>
          <QuestionnaireDescription>Select all that apply.</QuestionnaireDescription>
          <QuestionnaireChoices>
            {signals.map((s) => (
              <QuestionnaireChoice key={s} value={s.toLowerCase()}>
                {s}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>Choose at least one.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
      {picked ? <p aria-live="polite" className="text-sm text-muted-foreground">You chose: {picked.join(", ")}</p> : null}
    </div>
  )
}
