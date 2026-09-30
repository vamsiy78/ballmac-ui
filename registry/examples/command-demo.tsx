import { Calendar, Mail, Settings, Smile, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ballmac/command";
export default function CommandDemo() {
  return (
    <Command className="w-full max-w-md rounded-xl border shadow-md" label="Quick actions">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar aria-hidden="true" /> Schedule meeting
          </CommandItem>
          <CommandItem>
            <Smile aria-hidden="true" /> Search emoji
          </CommandItem>
          <CommandItem disabled>
            <Mail aria-hidden="true" /> Compose email (offline)
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User aria-hidden="true" /> Profile <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings aria-hidden="true" /> Preferences <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
