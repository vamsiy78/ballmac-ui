"use client";
import * as React from "react";
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
export default function DropdownMenuDemo() {
  const [notify, setNotify] = React.useState(true);
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        JR
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Jordan Rivera</p>
        <p className="truncate text-xs text-muted-foreground">
          jordan@acme.example
        </p>
      </div>
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger className="h-9 rounded-md border px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
          Account
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>Signed in as Jordan</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem aria-keyshortcuts="Shift+Meta+P">
              <UserRound aria-hidden="true" /> Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard aria-hidden="true" /> Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings aria-hidden="true" /> Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={notify} onCheckedChange={setNotify}>
            Email notifications
          </DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users aria-hidden="true" /> Switch team
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Acme Design</DropdownMenuItem>
              <DropdownMenuItem>Acme Platform</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <LifeBuoy aria-hidden="true" /> Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive>
            <LogOut aria-hidden="true" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
