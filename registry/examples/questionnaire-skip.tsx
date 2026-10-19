"use client"

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
  { name: "team", required: true, prompt: "Who is this for?", choices: ["Just me", "My team", "Customers"] },
  { name: "budget", required: false, prompt: "Is there a budget?", description: "Optional. Skip if you do not know yet.", choices: ["Under $1k", "$1k to $10k", "More than $10k"] },
] as const

/** An optional question can be skipped on purpose, which counts as an answer. */
export default function QuestionnaireSkipExample() {
  return (
    <Questionnaire items={items.map((i) => ({ name: i.name, required: i.required, choices: i.choices.map((c) => ({ value: c })) }))} className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
      <QuestionnaireProgress />
      {items.map((q) => (
        <QuestionnaireItem key={q.name} name={q.name} required={q.required}>
          <QuestionnaireTitle>{q.prompt}</QuestionnaireTitle>
          {"description" in q ? <QuestionnaireDescription>{q.description}</QuestionnaireDescription> : null}
          <QuestionnaireChoices>
            {q.choices.map((c) => (
              <QuestionnaireChoice key={c} value={c}>
                {c}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}
