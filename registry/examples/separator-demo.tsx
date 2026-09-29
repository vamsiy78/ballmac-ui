import { Separator } from "@/components/ballmac/separator"
export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="text-sm font-semibold">Project activity</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Keep track of the latest changes.
      </p>
      <Separator label="Today" className="my-5" />
      <div className="text-sm">Design review completed</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Your team approved the new layout.
      </p>
    </div>
  )
}
