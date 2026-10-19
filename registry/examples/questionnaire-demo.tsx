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
  {
    name: "direction",
    required: true,
    prompt: "What should we prototype next?",
    description: "Choose a direction or write your own.",
    choices: [
      { value: "delegation", label: "Delegation", description: "Show how work moves to a specialist." },
      { value: "questions", label: "Question prompts", description: "Show choices while the interface waits." },
      { value: "both", label: "Both together" },
    ],
    input: { label: "Another answer", placeholder: "Type another answer…" },
  },
  {
    name: "detail",
    required: false,
    prompt: "How much detail should it include?",
    description: "Skip this if you are not sure yet.",
    choices: [
      { value: "focused", label: "Focused" },
      { value: "complete", label: "Complete flow" },
    ],
  },
] as const

export default function QuestionnaireDemo() {
  const [answers, setAnswers] = React.useState<Record<string, string> | null>(null)
  return (
    <div className="grid w-full max-w-md gap-4">
      <Questionnaire
        items={items}
        onSubmit={(event) => {
          event.preventDefault()
          setAnswers(Object.fromEntries([...new FormData(event.currentTarget)].map(([k, v]) => [k, String(v)])))
        }}
      >
        <QuestionnaireProgress />
        {items.map((question) => (
          <QuestionnaireItem key={question.name} name={question.name} required={question.required}>
            <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
            <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
            <QuestionnaireChoices>
              {question.choices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  <span className="font-medium">{choice.label}</span>
                  {"description" in choice ? <QuestionnaireChoiceDescription>{choice.description}</QuestionnaireChoiceDescription> : null}
                </QuestionnaireChoice>
              ))}
              {"input" in question ? <QuestionnaireInput aria-label={question.input.label} placeholder={question.input.placeholder} /> : null}
            </QuestionnaireChoices>
            <QuestionnaireError>Choose an answer to continue.</QuestionnaireError>
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
      {answers ? (
        <pre dir="ltr" className="overflow-x-auto rounded-lg border bg-muted p-3 font-mono text-xs" aria-live="polite">
          {JSON.stringify(answers, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}
