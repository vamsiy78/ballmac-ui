"use client"

import { Quiz1, type Quiz1Question } from "@/components/ballmac/blocks/quiz-1/quiz-1"

const questions: Quiz1Question[] = [
  { id: "a", prompt: "What does an owner do for a task?", options: [{ id: "1", text: "Is responsible for it moving" }, { id: "2", text: "Does all the work alone" }], answer: "1", explanation: "Owning is being responsible, not doing everything." },
  { id: "b", prompt: "A plan should be reviewed…", options: [{ id: "1", text: "never" }, { id: "2", text: "when it can still change the week" }], answer: "2", explanation: "Review it while it can still change the week." },
  { id: "c", prompt: "Which are good reasons to split a task? Choose all that apply.", options: [{ id: "1", text: "It takes more than a few days" }, { id: "2", text: "Two people must work on it" }, { id: "3", text: "It looks short" }], answer: ["1", "2"] },
]

// Starts on the result with a wrong answer for two of the three questions.
export default function Quiz1Score() {
  return <Quiz1 questions={questions} defaultAnswers={{ a: ["1"], b: ["1"], c: ["1", "3"] }} />
}
