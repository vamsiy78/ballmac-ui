"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ballmac/card"
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

/** In a card: the card owns the frame, the questionnaire owns the questions. */
export default function QuestionnaireCard() {
  return (
    <Card className="w-full max-w-md">
      <Questionnaire onSubmit={(e) => e.preventDefault()} className="gap-0">
        <CardHeader>
          <CardTitle>Before we start</CardTitle>
          <CardDescription>Two quick questions so the first run fits you.</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <QuestionnaireItem name="stack" required>
            <QuestionnaireTitle className="text-base">Which framework do you use?</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="next">Next.js</QuestionnaireChoice>
              <QuestionnaireChoice value="vite">Vite</QuestionnaireChoice>
              <QuestionnaireChoice value="other">Something else</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
        </CardContent>
        <CardFooter>
          <QuestionnaireActions>
            <QuestionnaireSubmit>Start</QuestionnaireSubmit>
          </QuestionnaireActions>
        </CardFooter>
      </Questionnaire>
    </Card>
  )
}
