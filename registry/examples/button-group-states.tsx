import { Plus, Minus } from "lucide-react";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/components/ballmac/button-group";
export default function ButtonGroupStates() {
  return (
    <div className="flex w-full max-w-xs items-start gap-4">
      <ButtonGroup orientation="vertical" aria-label="Zoom controls">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex size-9 items-center justify-center border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
        <ButtonGroupText>100%</ButtonGroupText>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex size-9 items-center justify-center border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
      </ButtonGroup>
      <p className="text-sm text-muted-foreground">
        Vertical groups keep related tools compact in narrow panels.
      </p>
    </div>
  );
}
