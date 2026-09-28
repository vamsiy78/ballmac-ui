import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>JL</AvatarFallback>
      </Avatar>
      <Avatar status="online">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <Avatar size="lg" status="away">
        <AvatarFallback className="bg-primary text-primary-foreground">SK</AvatarFallback>
      </Avatar>
      <div className="grid gap-0.5">
        <span className="text-sm font-medium">Sam Kim</span>
        <span className="text-xs text-muted-foreground">Away until 2 PM</span>
      </div>
    </div>
  )
}
