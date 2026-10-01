import { Highlighter, type HighlighterAction } from "@/components/ballmac/highlighter"

const actions: HighlighterAction[] = ["highlight", "underline", "box", "circle", "strike", "bracket"]
const tones = ["chart-3", "chart-1", "chart-2", "chart-4", "destructive", "chart-5"] as const

export default function HighlighterActions() {
  return (
    <ul className="grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      {actions.map((action, i) => (
        <li key={action} className="flex items-center justify-center py-2 text-lg font-medium">
          <Highlighter action={action} tone={tones[i]} inView={false} delay={i * 0.2} padding={action === "circle" ? 8 : 4}>
            {action}
          </Highlighter>
        </li>
      ))}
    </ul>
  )
}
