import { AvatarStack } from "@/components/ballmac/avatar-stack"
export default function AvatarStackStates() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <AvatarStack
        size="sm"
        people={[{ name: "Alex Morgan" }, { name: "Sam Lee" }]}
      />
      <AvatarStack
        people={[
          { name: "Alex Morgan" },
          { name: "Sam Lee" },
          { name: "Taylor Chen" },
        ]}
        max={2}
      />
    </div>
  )
}
