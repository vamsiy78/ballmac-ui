import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ballmac/popover";
export default function PopoverStates() {
  return (
    <div className="w-full max-w-xs">
      <Popover>
        <PopoverTrigger className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          Edit display name
        </PopoverTrigger>
        <PopoverContent label="Display name" align="start" showCloseButton>
          <PopoverHeader>
            <PopoverTitle>Display name</PopoverTitle>
            <PopoverDescription>
              This name appears to your team.
            </PopoverDescription>
          </PopoverHeader>
          <label className="grid gap-1 text-xs font-medium">
            Name
            <input
              defaultValue="Alex Morgan"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>
        </PopoverContent>
      </Popover>
    </div>
  );
}
