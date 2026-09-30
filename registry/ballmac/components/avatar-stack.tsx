// Ballmac UI: Avatar Stack. https://ui.ballmac.com/components/avatar-stack
import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarPerson = {
  /** Display name for screen readers and tooltip. */ name: string
  /** Optional image URL. */ src?: string
  /** Initials when no image is present. */ initials?: string
}
type AvatarStackProps = React.ComponentProps<"div"> & {
  /** People to display, in order. */
  people: AvatarPerson[]
  /** Maximum visible avatars before the overflow count. */
  max?: number
  /** Avatar diameter. */
  size?: "sm" | "default"
}
function AvatarStack({
  className,
  people,
  max = 4,
  size = "default",
  ...props
}: AvatarStackProps) {
  const visible = people.slice(0, Math.max(0, max))
  const overflow = people.length - visible.length
  return (
    <div
      data-slot="avatar-stack"
      data-size={size}
      role="group"
      aria-label={people.map((person) => person.name).join(", ")}
      className={cn(
        "group/avatar-stack flex min-w-0 items-center -space-x-2",
        className,
      )}
      {...props}
    >
      {visible.map((person, index) => (
        <span
          key={`${person.name}-${index}`}
          data-slot="avatar-stack-person"
          title={person.name}
          aria-hidden="true"
          className="bg-muted text-muted-foreground border-background relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-semibold data-[size=sm]:size-7 group-data-[size=sm]/avatar-stack:size-7"
        >
          <span>
            {person.initials ??
              person.name
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
          </span>
          {person.src && (
            <img
              src={person.src}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span
          data-slot="avatar-stack-overflow"
          aria-hidden="true"
          className="bg-secondary text-secondary-foreground border-background relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold group-data-[size=sm]/avatar-stack:size-7"
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
export { AvatarStack, type AvatarStackProps, type AvatarPerson }
