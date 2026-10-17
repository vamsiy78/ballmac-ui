import { MatchHighlight } from "@/components/ballmac/match-highlight"

export default function MatchHighlightDemo() {
  return (
    <div className="grid max-w-md gap-1.5">
      <p className="text-base font-medium">
        <MatchHighlight text="Verify webhook signatures" query="webhook sign" />
      </p>
      <p className="text-muted-foreground text-sm text-pretty">
        <MatchHighlight text="Every webhook request is signed. Check the signature header against your signing secret before you trust the payload." query="webhook sign" />
      </p>
    </div>
  )
}
