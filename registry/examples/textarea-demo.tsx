import { Label } from "@/components/ballmac/label"
import { Textarea } from "@/components/ballmac/textarea"

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea id="feedback" placeholder="What could we do better?" rows={4} aria-describedby="feedback-hint" />
      <p id="feedback-hint" className="text-sm text-muted-foreground">
        We read every message. Please don&apos;t include passwords.
      </p>
    </div>
  )
}
