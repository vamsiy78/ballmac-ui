import { Bold, Italic, Underline } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ballmac/toggle-group";
export default function ToggleGroupStates() {
  return (
    <div className="w-full max-w-xs">
      <p className="mb-2 text-sm font-medium">Text formatting</p>
      <ToggleGroup
        type="multiple"
        defaultValue={["bold"]}
        variant="outline"
        aria-label="Text formatting"
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold aria-hidden="true" />
          Bold
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
