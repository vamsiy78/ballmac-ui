import { AvatarCircles } from "@/components/ballmac/avatar-circles"

const people = [
  { name: "Ada Lovelace", role: "Engineering", status: "online" as const },
  { name: "Grace Hopper", role: "Platform", status: "busy" as const },
  { name: "Katherine Johnson", role: "Data", status: "online" as const },
  { name: "Margaret Hamilton", role: "Design", status: "away" as const },
  { name: "Linus Torvalds", role: "Infrastructure" },
  { name: "Barbara Liskov", role: "Security" },
]

export default function AvatarCirclesDemo() {
  return (
    <div className="grid justify-items-center gap-3 pt-12">
      <AvatarCircles people={people} max={5} total={248} size="lg" />
      <p className="text-sm text-muted-foreground">248 people are working on this project</p>
    </div>
  )
}
