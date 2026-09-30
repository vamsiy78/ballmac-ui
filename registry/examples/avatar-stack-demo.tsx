import { AvatarStack } from "@/components/ballmac/avatar-stack"
export default function AvatarStackDemo() {
  return (
    <div className="flex w-full max-w-xs items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium">Design review</p>
        <p className="text-muted-foreground mt-1 text-xs">5 collaborators</p>
      </div>
      <AvatarStack
        people={[
          { name: "Alex Morgan" },
          { name: "Sam Lee" },
          { name: "Taylor Chen" },
          { name: "Jordan Patel" },
          { name: "Morgan Reed" },
        ]}
        max={3}
      />
    </div>
  )
}
