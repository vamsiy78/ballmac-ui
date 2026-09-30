import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/ballmac/toggle";
export default function ToggleStates() {
  return (
    <div className="flex w-full max-w-xs flex-wrap items-center gap-2">
      <Toggle aria-label="Bold" defaultPressed size="sm">
        <Bold aria-hidden="true" />
      </Toggle>
      <Toggle aria-label="Italic" variant="outline">
        <Italic aria-hidden="true" />
      </Toggle>
      <Toggle aria-label="Underline" variant="outline" size="lg" disabled>
        <Underline aria-hidden="true" />
      </Toggle>
      <span className="text-xs text-muted-foreground">
        Small, outline, disabled
      </span>
    </div>
  );
}
