import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ballmac/avatar"

const members = ["Alex Morgan", "Jordan Lee", "Sam Kim", "Riley Chen", "Taylor Diaz", "Casey Park"]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

export default function AvatarGroupDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarGroup max={4} total={24} aria-label="24 project members">
        {members.map((name) => (
          <Avatar key={name} title={name}>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <p className="text-sm text-muted-foreground">24 people have access</p>
    </div>
  )
}
