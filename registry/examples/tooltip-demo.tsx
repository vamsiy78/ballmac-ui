import { Bold, Italic, Link } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Kbd, KbdGroup } from "@/components/ballmac/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ballmac/tooltip"

const tools = [
  { label: "Bold", icon: Bold, keys: ["⌘", "B"] },
  { label: "Italic", icon: Italic, keys: ["⌘", "I"] },
  { label: "Insert link", icon: Link, keys: ["⌘", "K"] },
]

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <div role="toolbar" aria-label="Formatting" className="flex items-center gap-1 rounded-lg border bg-card p-1">
        {tools.map(({ label, icon: Icon, keys }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={label}>
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {label}
              <KbdGroup>
                {keys.map((key) => (
                  <Kbd key={key} size="sm">
                    {key}
                  </Kbd>
                ))}
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
