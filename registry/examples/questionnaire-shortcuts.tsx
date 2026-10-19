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

const areas = ["Public API", "Test coverage", "Accessibility", "Performance"]

/** Press the letter beside an answer to choose it. Enter moves on. */
export default function QuestionnaireShortcuts() {
  return (
    <Questionnaire shortcuts="letters" className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
      <QuestionnaireItem name="review" required>
        <QuestionnaireTitle>What should the agent review?</QuestionnaireTitle>
        <QuestionnaireDescription>Press a letter to choose, then Enter.</QuestionnaireDescription>
        <QuestionnaireChoices>
          {areas.map((a) => (
            <QuestionnaireChoice key={a} value={a.toLowerCase().replace(" ", "-")}>
              {a}
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}
